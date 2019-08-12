import _ from 'lodash';

const DEFAULT_SETTINGS = {
    config: null,
    products: [],
    recipes: [],
    departments: [],
    superDepartments: []
};

function getState() {
    let thisState = DEFAULT_SETTINGS;
    return thisState;
}

const rootReducer = (state = getState(), action) => {
    if (action.type === 'GET_STATE') {
        return { ...state };
    }

    if (action.type === 'UPDATE_PRODUCTS') {
        let { products } = getState();

        products = _.cloneDeep(products);

        if (!Array.isArray(action.products)) {
            action.products = [action.products];
        }

        action.products.forEach(product => {
            const existing = products.find(p => (p._id = product._id));
            if (existing) {
                products.splice(products.indexOf(existing), 1, product);
            } else {
                products.push(product);
            }
        });
        return { ...state, products };
    }
};

export default rootReducer;
