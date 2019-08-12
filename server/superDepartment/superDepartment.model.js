var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SuperDepartmentSchema = new Schema({
    _id: {
        type: Schema.ObjectId,
        required: true,
        default: mongoose.Types.ObjectId()
    },

    name: { type: String, required: true }
});

module.exports = mongoose.model('SuperDepartment', SuperDepartmentSchema);
