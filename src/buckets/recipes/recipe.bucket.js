import Axios from 'axios';
import io from 'socket.io-client';
import sockets from '../../socket';

class RecipeBucket {
    constructor() {
        this.recipes = [];
    }

    getRecipeById = id => {
        return new Promise((resolve, reject) => {
            const recipe = this.recipes.find(recipe => recipe._id === id);
            if (recipe) resolve(recipe);
            Axios.get(`/api/recipes/${id}`)
                .then(data => {
                    const recipe = data.data;
                    this.recipes.push(recipe);
                    resolve(recipe);
                })
                .catch(err => reject(err));
        });
    };

    getRecipesByPage = ({ page = 1, limit = 10 }) => {
        return new Promise((resolve, reject) => {
            Axios.get(
                `/api/recipes/?select=_id&skip=${(page - 1) *
                    limit}&limit=${limit}&sort=updated_at[-1]`
            )
                .then(({ data }) => {
                    const ids = data.data;
                    let returnArr = [];
                    const needed = [];
                    ids.forEach(id => {
                        const recipe = this.recipea.find(recipe => recipe._id === id._id);
                        if (recipe) return returnArr.push(recipe);
                        return needed.push(id._id);
                    });
                    if (needed.length > 0) {
                        Axios.get(`/api/recipea?where[_id]=${needed}`).then(({ data }) => {
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

    createRecipe = recipe => {
        return Axios.post(`/api/recipes`, recipe);
    };
}

export default new RecipeBucket();
