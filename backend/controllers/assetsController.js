const Asset = require('../models/Asset');
const mongoose = require('mongoose');

// @desc    Create a new asset
// @route   POST /api/assets
// @access  Public (will add auth later)
exports.createAsset = async (req, res) => {
    try {
        const { profileId, type, value, description } = req.body;

        if (!profileId) {
            return res.status(400).json({
                success: false,
                message: 'Profile ID is required'
            });
        }

        // Create new asset
        const asset = await Asset.create({
            profileId,
            type,
            value,
            description
        });

        res.status(201).json({
            success: true,
            data: asset
        });
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));

            return res.status(400).json({
                success: false,
                errors
            });
        }

        // Handle other errors
        res.status(500).json({
            success: false,
            message: 'Server error while creating asset',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all assets
// @route   GET /api/assets
// @access  Public (will add auth later)
exports.getAllAssets = async (req, res) => {
    try {
        const { profileId } = req.query;
        let query = {};

        if (profileId) {
            query.profileId = profileId;
        }

        // Mock data fallback if DB is offline
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json({
                success: true,
                count: 2,
                data: [
                    { _id: '1', name: 'Savings Account', value: 5000, type: 'Cash' },
                    { _id: '2', name: 'Investment Portfolio', value: 12000, type: 'Investment' }
                ]
            });
        }

        const assets = await Asset.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: assets.length,
            data: assets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching assets',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
// @desc    Update an asset
// @route   PUT /api/assets/:id
// @access  Public (will add auth later)
exports.updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }

        res.status(200).json({
            success: true,
            data: asset
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while updating asset',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Delete an asset
// @route   DELETE /api/assets/:id
// @access  Public (will add auth later)
exports.deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndDelete(req.params.id);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while deleting asset',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
