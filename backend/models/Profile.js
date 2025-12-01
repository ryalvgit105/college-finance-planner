const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    name: {
        type: String,
        required: [true, 'Profile name is required'],
        trim: true,
        maxlength: [50, 'Profile name cannot exceed 50 characters']
    },
    profileType: {
        type: String,
        required: [true, 'Profile type is required'],
        enum: {
            values: ['College', 'Business', 'Personal'],
            message: '{VALUE} is not a supported profile type'
        }
    },
    enabledModules: {
        assets: { type: Boolean, default: true },
        debts: { type: Boolean, default: true },
        income: { type: Boolean, default: true },
        spending: { type: Boolean, default: true },
        goals: { type: Boolean, default: true },
        milestones: { type: Boolean, default: true }
    },
    categories: {
        type: [String],
        default: ['Rent', 'Groceries', 'Utilities', 'Entertainment', 'Transport']
    }
}, {
    timestamps: true
});

// Ensure a user can't have duplicate profile names
profileSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Profile', profileSchema);
