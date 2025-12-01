const mongoose = require('mongoose');

const TaxSchema = new mongoose.Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    filingStatus: {
        type: String,
        enum: ['Single', 'Married'],
        default: 'Single'
    },
    federalBracket: {
        type: Number,
        default: 0.22
    },
    stateBracket: {
        type: Number,
        default: 0.05
    },
    standardDeduction: {
        type: Number,
        default: 13850
    },
    additionalDeductions: {
        type: Number,
        default: 0
    },
    notes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Tax', TaxSchema);
