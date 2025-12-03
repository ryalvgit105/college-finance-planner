const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        min: 13,
        max: 100
    },
    // V4 Projection Engine Settings
    projectionBaseYear: {
        type: Number,
        default: () => new Date().getFullYear()
    },
    projectionSettings: {
        maxYears: {
            type: Number,
            default: 50,
            min: 1,
            max: 100
        },
        defaultInflationRate: {
            type: Number,
            default: 0.02,
            min: 0,
            max: 0.20
        },
        defaultInvestmentReturn: {
            type: Number,
            default: 0.07,
            min: 0,
            max: 0.30
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
