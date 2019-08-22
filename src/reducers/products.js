const products = (state = [], action) => {
    switch (action.type) {
        case 'ADD_PRODUCTS':
            return [...state, { products: action.products }];
        default:
            return state;
    }
};

export default products;
