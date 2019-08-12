import Axios from 'axios';
import store from '../../store';

class ProductBucket {
    constructor() {
        this.products = store.getState().products;
    }

    getProductById = id => {
        this.products = store.getState().products;
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

    getProductsByPage = ({ page = 1, limit = 10, query = {} }) => {
        this.products = store.getState().products;
        return new Promise((resolve, reject) => {
            console.log('Getting products');
            Axios.get(
                `/api/products/?query=${query}&select=_id&skip=${(page - 1) *
                    limit}&limit=${limit}&sort=updated_at[-1]`
            )
                .then(({ data }) => {
                    const ids = data.data;
                    let returnArr = [];
                    const needed = [];
                    ids.forEach(id => {
                        console.log(this.products);
                        const product = this.products.find(product => product._id === id._id);
                        if (product) return returnArr.push(product);
                        return needed.push(id._id);
                    });
                    if (needed.length > 0) {
                        console.log('needed ', needed.length);
                        Axios.get(`/api/products?where[_id]=${needed}`).then(({ data }) => {
                            returnArr = returnArr.concat(data.data);
                            store.dispatch({ type: 'UPDATE_PRODUCTS', products: data.data });
                            resolve(returnArr);
                        });
                    } else {
                        resolve(returnArr);
                    }
                })
                .catch(err => reject(err));
        });
    };

    createProduct = product => {
        return Axios.post(`/api/products`, product);
    };
}

export default new ProductBucket();
