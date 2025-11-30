const Asset = require('../models/Asset');
const mongoose = require('mongoose');

// @desc    Create a new asset
// @route   POST /api/assets
// @access  Public (will add auth later)
exports.createAsset = async (req, res) => {
    try {
        const { type, value, description } = req.body;

        // Create new asset
        const asset = await Asset.create({
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

        const assets = await Asset.find().sort({ createdAt: -1 });

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
