const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: [true, 'Profile ID is required']
    },
    type: {
        type: String,
        required: [true, 'Asset type is required'],
        trim: true,
        maxlength: [100, 'Asset type cannot exceed 100 characters']
    },
    value: {
        type: Number,
        required: [true, 'Asset value is required'],
        min: [0, 'Asset value must be a positive number']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Asset', assetSchema);
