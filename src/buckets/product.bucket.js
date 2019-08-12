import Axios from 'axios';
import io from 'socket.io-client';
import sockets from '../socket';

class ProductBucket {
    constructor() {
        this.products = [];
        this.subscribeToWebsockets();
    }

    getProductById = id => {
        return new Promise((resolve, reject) => {
            const product = this.products.find(product => product._id === id);
            if (product) resolve(product);
            Axios.get(`/api/products/${id}`)
                .then(data => {
                    const product = data.data;
                    this.products.push(product);
                    resolve(product);
                })
                .catch(err => reject(err));
        });
    };

    getProductsByPage = ({ page = 1, limit = 10 }) => {
        return new Promise((resolve, reject) => {
            Axios.get(
                `/api/products/?select=_id&skip=${(page - 1) *
                    limit}&limit=${limit}&sort=updated_at[-1]`
            )
                .then(({ data }) => {
                    const ids = data.data;
                    let returnArr = [];
                    const needed = [];
                    ids.forEach(id => {
                        const product = this.products.find(product => product._id === id._id);
                        if (product) return returnArr.push(product);
                        return needed.push(id._id);
                    });
                    if (needed.length > 0) {
                        Axios.get(`/api/products?where[_id]=${needed}`).then(({ data }) => {
                            returnArr = returnArr.concat(data.data);
                            resolve(returnArr);
                        });
                    } else {
                        resolve(returnArr);
                    }
                })
                .catch(err => reject(err));
        });
    };

    subscribeToWebsockets = () => {
        var socket = io();
        socket.on('chat message', function(msg) {
            console.log('message: ' + msg.yo);
        });
    };

    recievedMessage = data => {
        data.forEach(product => {
            const existing = this.products.find(p => (p._id = product._id));
            if (existing) {
                this.products.splice(this.products.indexOf(existing), 1, product);
            } else {
                this.products.push(product);
            }
        });
    };

    createProduct = product => {
        return Axios.post(`/api/products`, product);
    };
}

export default new ProductBucket();
