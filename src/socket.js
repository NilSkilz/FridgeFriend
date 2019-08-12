import io from 'socket.io-client';
import store from './store';

const RECIPES = 'recipes';
const STOCKS = 'stocks';

class SocketManager {
    constructor() {
        var socket = io();
        // io.on('connection', function(socket) {
        // console.log('connected');
        socket.on('products', function(msg) {
            console.log('Got new product: ', msg.data);
            store.dispatch({ type: 'UPDATE_PRODUCTS', products: msg.data.data });
        });

        socket.on(RECIPES, function(msg) {
            console.log('Got new recipe: ', msg.data);
            store.dispatch({ type: 'UPDATE_RECIPES', recipes: msg.data.data });
        });

        socket.on(STOCKS, function(msg) {
            console.log('Got new stock: ', msg.data);
            store.dispatch({ type: 'UPDATE_STOCKS', stocks: msg.data.data });
        });
        // });
    }
}

export default new SocketManager();
