var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RecipeSchema = new Schema({
    _id: {
        type: Schema.ObjectId,
        required: true,
        default: mongoose.Types.ObjectId()
    },

    ingredients: [
        {
            type: Object,
            required: false
        }
    ],

    name: {
        type: String,
        required: true
    },

    servings: {
        type: Number,
        required: true,
        default: 1
    }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
