const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Debt type is required'],
        trim: true,
        maxlength: [100, 'Debt type cannot exceed 100 characters']
    },
    balance: {
        type: Number,
        required: [true, 'Balance is required'],
        min: [0, 'Balance must be a positive number']
    },
    interestRate: {
        type: Number,
        min: [0, 'Interest rate must be a positive number'],
        max: [100, 'Interest rate cannot exceed 100%']
    },
    monthlyPayment: {
        type: Number,
        min: [0, 'Monthly payment must be a positive number']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Debt', debtSchema);
