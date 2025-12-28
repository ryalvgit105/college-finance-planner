const MonthlySnapshot = require('../models/MonthlySnapshot');
const Asset = require('../models/Asset');
const Debt = require('../models/Debt');

const Investment = require('../models/Investment');
const mongoose = require('mongoose');

// @desc    Get snapshot history for a specific type and year
// @route   GET /api/snapshots/:type/history?year=2025
// @access  Public (for now, eventually Protected)
const getHistory = async (req, res) => {
    try {
        const { type } = req.params;
        const { year, profileId } = req.query;

        if (!profileId) {
            return res.status(400).json({ error: 'Profile ID is required' });
        }

        const validTypes = ['asset', 'debt', 'investment', 'income'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: 'Invalid snapshot type' });
        }

        const snapshots = await MonthlySnapshot.find({
            profileId,
            year: parseInt(year),
            type: type
        }).sort({ month: 1 });

        // Transform into a cleaner format for the frontend (array of 12 values)
        // If a month is missing, we might return null or handle it on frontend
        res.status(200).json(snapshots);

    } catch (error) {
        console.error('Error fetching snapshot history:', error);
        res.status(500).json({ error: 'Server error fetching history' });
    }
};

// @desc    Capture current state as a snapshot for a specific month
// @route   POST /api/snapshots/capture
// @access  Public
const captureSnapshot = async (req, res) => {
    try {
        const { profileId, month, year, type } = req.body;

        if (!profileId || !month || !year || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let itemsToSnapshot = [];
        let totalValue = 0;

        // Fetch source data based on type
        if (type === 'asset') {
            const assets = await Asset.find({ profileId });
            itemsToSnapshot = assets.map(a => ({
                originalId: a._id,
                name: a.type, // Using type as name for assets based on current UI? Or description? 
                // Reviewing Asset.js: it has 'type' and 'description'.
                // In UI 'description' seems to be the label user sees often.
                // Let's us Description if available, else Type.
                name: a.description || a.type,
                value: a.value,
                category: a.type
            }));
        } else if (type === 'debt') {
            const debts = await Debt.find({ profileId });
            itemsToSnapshot = debts.map(d => ({
                originalId: d._id,
                name: d.description || d.type,
                value: d.balance,
                category: d.type
            }));
        } else if (type === 'investment') {
            const investments = await Investment.find({ profileId });
            itemsToSnapshot = investments.map(i => ({
                originalId: i._id,
                name: i.name,
                value: i.currentValue,
                category: i.assetType
            }));
        } else if (type === 'income') {
            const Income = require('../models/Income');
            // Assuming we want the LATEST income record as the current state
            // If the app supports multiple separate income streams as separate docs, this needs adjustment.
            // Based on simple schema, taking latest.
            const latestIncome = await Income.findOne({ profileId }).sort({ createdAt: -1 });

            if (latestIncome) {
                itemsToSnapshot = [{
                    originalId: latestIncome._id,
                    name: 'Current Annual Income', // or sources.join(', ')
                    value: latestIncome.currentIncome, // This is Annual? Or Monthly? Schema says Number. Usually Annual.
                    category: 'Income',
                    description: latestIncome.incomeSources.join(', ')
                }];
            }
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }

        // Calculate total
        totalValue = itemsToSnapshot.reduce((sum, item) => sum + item.value, 0);

        // Find and update, or create new
        const snapshot = await MonthlySnapshot.findOneAndUpdate(
            { profileId, year, month, type },
            {
                items: itemsToSnapshot,
                totalValue,
                isClosed: true // Capturing assumes we are finalizing/saving state
            },
            { new: true, upsert: true } // Create if not exists
        );

        res.status(200).json(snapshot);

    } catch (error) {
        console.error('Error capturing snapshot:', error);
        res.status(500).json({ error: 'Server error capturing snapshot' });
    }
};

// @desc    Get detailed snapshot for a specific month
// @route   GET /api/snapshots/detail?month=1&year=2025&type=asset
const getSnapshotDetail = async (req, res) => {
    try {
        const { profileId, month, year, type } = req.query;

        if (!profileId || !month || !year || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const snapshot = await MonthlySnapshot.findOne({
            profileId,
            year: parseInt(year),
            month: parseInt(month),
            type
        });

        if (!snapshot) {
            return res.status(404).json({ message: 'No snapshot found for this period' });
        }

        res.status(200).json(snapshot);
    } catch (error) {
        console.error('Error fetching snapshot detail:', error);
        res.status(500).json({ error: 'Server error fetching snapshot detail' });
    }
}

// @desc    Get a test profile ID (Helper for verification)
// @route   GET /api/snapshots/test-helpers/profile-id
const getTestProfileId = async (req, res) => {
    try {
        // Just find the first profile
        const MonthlySnapshot = require('../models/MonthlySnapshot'); // Ensure model is loaded? No, need Profile model.
        // We need to require Profile model here or at top.
        // Let's require it at the top.
        // But to be safe in this block:
        const Profile = mongoose.model('Profile');

        const profile = await Profile.findOne();
        if (!profile) {
            return res.status(404).json({ error: 'No profiles found' });
        }
        res.status(200).json({ profileId: profile._id });
    } catch (error) {
        // If Profile model not registered yet? it should be.
        try {
            // Fallback if model not found by name
            const ProfileDef = require('../models/Profile');
            const profile = await ProfileDef.findOne();
            if (profile) return res.status(200).json({ profileId: profile._id });
        } catch (e) { }

        console.error('Error getting test profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = {
    getHistory,
    captureSnapshot,
    getSnapshotDetail,
    getTestProfileId
};
