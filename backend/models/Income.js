const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: [true, 'Profile ID is required']
    },
    currentIncome: {
        type: Number,
        required: [true, 'Current income is required'],
        min: [0, 'Current income must be a positive number']
    },
    incomeSources: {
        type: [String],
        default: [],
        validate: {
            validator: function (arr) {
                return arr.every(source => source.trim().length > 0);
            },
            message: 'Income sources cannot contain empty strings'
        }
    },
    careerGoal: {
        type: String,
        required: [true, 'Career goal is required'],
        trim: true,
        maxlength: [200, 'Career goal cannot exceed 200 characters']
    },
    projectedSalary: {
        type: Number,
        min: [0, 'Projected salary must be a positive number']
    },
    educationRequired: {
        type: String,
        trim: true,
        maxlength: [300, 'Education required cannot exceed 300 characters']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Income', incomeSchema);
