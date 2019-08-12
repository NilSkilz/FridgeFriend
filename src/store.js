import { createStore } from 'redux';
import reducer from './reducers/';
import SocketManager from './socket';

const store = createStore(reducer);

export default store;
