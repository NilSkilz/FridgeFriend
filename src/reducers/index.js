import _ from 'lodash';

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
        // ----------------------
        // Products

        case 'ADD_PRODUCTS': {
            return { ...state, products: action.products };
        }

        case 'EDIT_PRODUCT': {
            return { ...state, product: action.product };
        }

        case 'UPDATE_PRODUCT': {
            const { product } = action;
            const products = _.cloneDeep(state.products);
            const oldProduct = products.find(p => p._id === product._id);
            if (oldProduct) {
                products.splice(products.indexOf(oldProduct), 1, product);
            } else {
                // New product
                products.push(product);
            }
            return { ...state, products: products };
        }

        case 'DELETE_PRODUCT': {
            return { ...state, product_delete: action.product };
        }

        case 'DELETE_PRODUCT_CONFIRM': {
            const { product } = action;
            const products = _.cloneDeep(state.products);
            const oldProduct = products.find(p => p._id === product._id);
            if (oldProduct) {
                products.splice(products.indexOf(oldProduct), 1);
            }
            return { ...state, products: products };
        }

        // ----------------------
        // Recipes

        case 'ADD_RECIPES': {
            return { ...state, recipes: action.recipes };
        }

        case 'EDIT_RECIPE': {
            return { ...state, recipe: action.recipe };
        }

        case 'UPDATE_RECIPE': {
            const { recipe } = action;
            const recipes = _.cloneDeep(state.recipes);
            const oldRecipe = recipes.find(r => r._id === recipe._id);
            if (oldRecipe) {
                recipes.splice(recipes.indexOf(oldRecipe), 1, recipe);
            } else {
                // New recipe
                recipes.push(recipe);
            }
            return { ...state, recipes: recipes };
        }

        case 'DELETE_RECIPE': {
            return { ...state, recipe_delete: action.recipe };
        }

        case 'DELETE_RECIPE_CONFIRM': {
            const { recipe } = action;
            const recipes = _.cloneDeep(state.recipes);
            const oldRecipe = recipes.find(r => r._id === recipe._id);
            if (oldRecipe) {
                recipes.splice(recipes.indexOf(oldRecipe), 1);
            }
            return { ...state, recipes: recipes };
        }

        case 'ADD_LOGS': {
            return { ...state, logs: action.logs };
        }

        case 'ADD_DEPTS': {
            return { ...state, depts: action.depts };
        }

        case 'ADD_SUPER_DEPTS': {
            return { ...state, superDepts: action.superDepts };
        }

        default:
            return state;
    }
};

export default rootReducer;
