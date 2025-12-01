const Milestone = require('../models/Milestone');
const mongoose = require('mongoose');

// @desc    Create a milestone
// @route   POST /api/milestones
// @access  Public (will add auth later)
exports.createMilestone = async (req, res) => {
    try {
        const { profileId, title, date, description, expectedCost, relatedGoalId } = req.body;

        if (!profileId) {
            return res.status(400).json({
                success: false,
                message: 'Profile ID is required'
            });
        }

        const milestone = await Milestone.create({
            profileId,
            title,
            date,
            description,
            expectedCost,
            relatedGoalId
        });

        res.status(201).json({
            success: true,
            data: milestone
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
            message: 'Server error while creating milestone',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get milestones with optional month filtering
// @route   GET /api/milestones?month=YYYY-MM
// @access  Public (will add auth later)
exports.getMilestones = async (req, res) => {
    try {
        // Mock data fallback if DB is offline
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json({
                success: true,
                count: 3,
                month: req.query.month || 'all',
                data: [
                    { _id: '1', title: 'Submit Application', date: new Date('2025-12-01'), achieved: false },
                    { _id: '2', title: 'Scholarship Deadline', date: new Date('2026-01-15'), achieved: false },
                    { _id: '3', title: 'Campus Visit', date: new Date('2026-03-10'), achieved: false }
                ]
            });
        }

        const { month, profileId } = req.query;
        let query = {};

        if (profileId) {
            query.profileId = profileId;
        }

        // If month parameter is provided, filter by that month
        if (month) {
            // Parse month (format: YYYY-MM)
            const [year, monthNum] = month.split('-');

            if (!year || !monthNum) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid month format. Use YYYY-MM (e.g., 2025-12)'
                });
            }

            // Create date range for the entire month
            const startDate = new Date(year, monthNum - 1, 1);
            const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

            query.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const milestones = await Milestone.find(query)
            .populate('relatedGoalId', 'goalName targetAmount')
            .sort({ date: 1 });

        res.status(200).json({
            success: true,
            count: milestones.length,
            month: month || 'all',
            data: milestones
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

        res.status(500).json({
            success: false,
            message: 'Server error while updating milestone',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update a milestone
// @route   PATCH /api/milestones/:id
// @access  Public (will add auth later)
exports.updateMilestone = async (req, res) => {
    try {
        const { profileId } = req.body; // Expect profileId in body for updates to verify ownership

        if (!profileId) {
            return res.status(400).json({
                success: false,
                message: 'Profile ID is required for verification'
            });
        }

        const milestone = await Milestone.findOneAndUpdate(
            { _id: req.params.id, profileId },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!milestone) {
            return res.status(404).json({
                success: false,
                message: 'Milestone not found'
            });
        }

        res.status(200).json({
            success: true,
            data: milestone
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while updating milestone',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
