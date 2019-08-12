var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StockItemSchema = new Schema({
    _id: {
        type: Schema.ObjectId,
        required: true,
        default: mongoose.Types.ObjectId()
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    price: {
        type: Number,
        required: false
    },

    open: {
        type: Boolean,
        required: true,
        default: false
    },

    opened_date: {
        type: Date,
        required: false
    },

    best_before_date: {
        type: Date,
        required: false
    },

    purchase_date: {
        type: Date,
        required: true,
        default: new Date()
    },

    consumed_date: {
        type: Date,
        required: false
    }
});

module.exports = mongoose.model('Stock', StockItemSchema);
