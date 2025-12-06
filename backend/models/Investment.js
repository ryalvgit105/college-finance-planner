const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    assetType: {
        type: String,
        enum: ['stock', 'etf', 'crypto', 'savings', 'brokerage', 'other', 'bond', 'mutual fund', 'real estate', '401k', 'ira'],
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
    // V4 Projection Engine Fields
    taxTreatment: {
        type: String,
        enum: ['taxable', 'tax_deferred', 'tax_free'],
        default: 'taxable'
    },
    startYearOffset: {
        type: Number,
        default: 0,
        comment: 'Years from projection base year when this investment starts/started (0 = base year)'
    },
    endYearOffset: {
        type: Number,
        default: null,
        comment: 'Years from projection base year when this investment ends (null = indefinite)'
    },
    notes: {
        type: String
    }
}, { timestamps: true });

// V4 Virtual field for naming consistency
InvestmentSchema.virtual('contributionPerMonth').get(function () {
    return this.monthlyContribution;
}).set(function (value) {
    this.monthlyContribution = value;
});

module.exports = mongoose.model('Investment', InvestmentSchema);
