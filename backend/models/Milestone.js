const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: [true, 'Profile ID is required']
    },
    title: {
        type: String,
        required: [true, 'Milestone title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    date: {
        type: Date,
        required: [true, 'Milestone date is required']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    expectedCost: {
        type: Number,
        min: [0, 'Expected cost must be a positive number']
    },
    relatedGoalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Goal'
    },
    achieved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient month-based queries
milestoneSchema.index({ date: 1 });

module.exports = mongoose.model('Milestone', milestoneSchema);
