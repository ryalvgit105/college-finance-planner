const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    totalIncome: {
        type: Number,
        required: true,
        min: 0
    },
    categories: [{
        name: {
            type: String,
            required: true
        },
        allocatedAmount: {
            type: Number,
            required: true,
            min: 0
        },
        spentAmount: {
            type: Number,
            default: 0,
            min: 0
        }
    }],
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Budget', budgetSchema);
