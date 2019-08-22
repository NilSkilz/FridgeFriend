const DEFAULT_SETTINGS = {
    products: []
};

function getState() {
    let thisState = JSON.parse(localStorage.getItem('config'));
    if (!thisState) {
        thisState = DEFAULT_SETTINGS;
    }

    return thisState;
}

const rootReducer = (state = getState(), action) => {
    switch (action.type) {
        case 'ADD_PRODUCTS': {
            return { ...state, products: action.products };
        }

        default:
            return state;
    }
};

export default rootReducer;
