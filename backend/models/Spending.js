const mongoose = require('mongoose');

const spendingSchema = new mongoose.Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: [true, 'Profile ID is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        lowercase: true,
        maxlength: [50, 'Category cannot exceed 50 characters']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount must be a positive number']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Index for efficient date-based queries
spendingSchema.index({ date: 1 });
spendingSchema.index({ category: 1 });

module.exports = mongoose.model('Spending', spendingSchema);
