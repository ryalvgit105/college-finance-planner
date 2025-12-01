const mongoose = require('mongoose');

const PathTemplateSchema = new mongoose.Schema({
    templateName: {
        type: String,
        required: true,
        enum: ['College', 'Trade', 'Military', 'Entrepreneurship', 'Custom']
    },
    durationYears: {
        type: Number,
        required: true,
        default: 4
    },
    startingSalary: {
        type: Number,
        required: true,
        default: 50000
    },
    salaryGrowthRate: {
        type: Number,
        required: true,
        default: 0.03 // 3%
    },
    educationCost: {
        type: Number,
        required: true,
        default: 0
    },
    benefitsIncluded: {
        type: Boolean,
        default: false
    },
    militarySpecific: {
        type: Boolean,
        default: false
    },
    defaultBenefits: {
        healthInsurance: { type: Number, default: 0 },
        retirementContribution: { type: Number, default: 0 },
        employerMatch: { type: Number, default: 0 },
        militaryHousingAllowance: { type: Number, default: 0 },
        militarySubsistenceAllowance: { type: Number, default: 0 }
    },
    defaultExpenses: {
        type: Number,
        default: 0
    },
    notes: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('PathTemplate', PathTemplateSchema);
