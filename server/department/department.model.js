var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DepartmentSchema = new Schema({
    _id: {
        type: Schema.ObjectId,
        required: true,
        default: mongoose.Types.ObjectId()
    },

    name: { type: String, required: true }
});

module.exports = mongoose.model('Department', DepartmentSchema);
