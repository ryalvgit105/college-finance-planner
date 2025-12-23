const mongoose = require('mongoose');

const monthlySnapshotSchema = new mongoose.Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: [true, 'Profile ID is required']
    },
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
    type: {
        type: String,
        enum: ['asset', 'debt', 'investment'],
        required: true
    },
    items: [{
        originalId: { type: mongoose.Schema.Types.ObjectId }, // Reference to the source item if it still exists
        name: { type: String, required: true },
        value: { type: Number, required: true },
        category: String, // e.g., 'Savings Account', 'Credit Card'
        description: String
    }],
    totalValue: {
        type: Number,
        default: 0
    },
    isClosed: {
        type: Boolean,
        default: false, // If true, this snapshot is considered a permanent record
        description: "Indicates if the month has been explicitly closed/finalized by the user"
    }
}, {
    timestamps: true
});

// Compound index to ensure uniqueness: One snapshot per type per month per profile
monthlySnapshotSchema.index({ profileId: 1, year: 1, month: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('MonthlySnapshot', monthlySnapshotSchema);
