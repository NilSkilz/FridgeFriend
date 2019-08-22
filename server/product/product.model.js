var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProductSchema = new Schema({
    _id: {
        type: Schema.ObjectId,
        required: true,
        default: mongoose.Types.ObjectId()
    },
    price: { type: Number, required: false },
    name: { type: String, required: true },
    gtin: { type: String, required: false },
    tpnb: { type: String, required: false },
    tpnc: { type: String, required: false },
    description: { type: String, required: true },
    image: { type: String, required: false },

    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: false
    },

    superDepartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SuperDepartment',
        required: false
    },
    best_before: {
        type: Object,
        required: false
    },
    brand: { type: String, required: false },
    qtyContents: { type: Object, required: false },
    productCharacteristics: { type: Object, required: false },
    ingredients: { type: Object, required: false },
    gda: { type: Object, required: false },
    calcNutrition: { type: Object, required: false },
    storage: { type: Object, required: false },
    marketingText: { type: Object, required: false },
    pkgDimensions: { type: Object, required: false },
    productAttributes: { type: Object, required: false },
    minimum_stock: { type: Number, required: true, default: 2 },
    stock: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Stock'
        }
    ]
});

module.exports = mongoose.model('Product', ProductSchema);
