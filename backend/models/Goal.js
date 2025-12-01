const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: [true, 'Profile ID is required']
    },
    goalName: {
        type: String,
        required: [true, 'Goal name is required'],
        trim: true,
        maxlength: [200, 'Goal name cannot exceed 200 characters']
    },
    targetAmount: {
        type: Number,
        required: [true, 'Target amount is required'],
        min: [0, 'Target amount must be a positive number']
    },
    currentAmount: {
        type: Number,
        default: 0,
        min: [0, 'Current amount must be a positive number']
    },
    targetDate: {
        type: Date,
        required: [true, 'Target date is required']
    },
    monthlyBudget: {
        type: Number,
        required: [true, 'Monthly budget is required'],
        min: [0, 'Monthly budget must be a positive number']
    },
    categories: {
        type: Map,
        of: Number,
        default: {},
        validate: {
            validator: function (map) {
                // Ensure all values are positive numbers
                for (let value of map.values()) {
                    if (value < 0) return false;
                }
                return true;
            },
            message: 'All category values must be positive numbers'
        }
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    // Phase 5 Additions
    priority: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    autoAllocate: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        enum: ['investment', 'education', 'housing', 'business', 'misc'],
        default: 'misc'
    },
    expectedReturnRate: {
        type: Number,
        default: 0.05 // 5% default
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema);
