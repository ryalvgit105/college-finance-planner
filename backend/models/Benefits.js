const mongoose = require('mongoose');

const BenefitsSchema = new mongoose.Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true
    },
    healthInsurance: {
        type: Number,
        default: 0
    },
    retirementContribution: {
        type: Number,
        default: 0
    },
    employerMatch: {
        type: Number,
        default: 0
    },
    militaryHousingAllowance: {
        type: Number,
        default: 0
    },
    militarySubsistenceAllowance: {
        type: Number,
        default: 0
    },
    customBenefits: [{
        name: String,
        amount: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model('Benefits', BenefitsSchema);
