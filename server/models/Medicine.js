const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide the medicine name'],
        unique: true
    },
    company: {
        type: String,
        required: [true, 'Please provide the company name']
    },
    inStock: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);
