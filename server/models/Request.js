const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, 'Please add a user name']
    },
    medicineName: {
        type: String,
        required: [true, 'Please add a medicine name']
    },
    companyName: {
        type: String,
        required: [true, 'Please add a company name']
    },
    quantity: {
        type: Number,
        required: [true, 'Please add the quantity needed']
    },
    requiredDate: {
        type: Date,
        required: [true, 'Please add the required date']
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, {
    timestamps: true 
}); // createdAt and updatedAt automatic generation

module.exports = mongoose.model('Request', requestSchema);
