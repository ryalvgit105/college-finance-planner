const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    assetType: {
        type: String,
        enum: ['stock', 'ETF', 'crypto', 'savings', 'brokerage', 'other'],
        required: true
    },
    ticker: {
        type: String,
        trim: true
    },
    amountInvested: {
        type: Number,
        default: 0
    },
    currentValue: {
        type: Number,
        required: true,
        default: 0
    },
    expectedAnnualReturn: {
        type: Number,
        default: 0.07 // 7% default
    },
    monthlyContribution: {
        type: Number,
        default: 0
    },
    notes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Investment', InvestmentSchema);
