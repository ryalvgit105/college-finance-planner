const Income = require('../models/Income');

// @desc    Create or update income/career info
// @route   POST /api/income
// @access  Public (will add auth later)
exports.createOrUpdateIncome = async (req, res) => {
    try {
        const { profileId, currentIncome, incomeSources, careerGoal, projectedSalary, educationRequired, notes } = req.body;

        if (!profileId) {
            return res.status(400).json({
                success: false,
                message: 'Profile ID is required'
            });
        }

        // For now, we'll create a new entry each time
        // In production with auth, you'd update the user's existing income record
        const income = await Income.create({
            profileId,
            currentIncome,
            incomeSources,
            careerGoal,
            projectedSalary,
            educationRequired,
            notes
        });

        res.status(201).json({
            success: true,
            data: income
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
            message: 'Server error while saving income/career info',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all income/career records
// @route   GET /api/income
// @access  Public (will add auth later)
exports.getIncome = async (req, res) => {
    try {
        const { profileId } = req.query;
        let query = {};

        if (profileId) {
            query.profileId = profileId;
        }

        // Get all income records, sorted by most recent
        const incomeRecords = await Income.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: incomeRecords.length,
            data: incomeRecords
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching income/career info',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
// @desc    Update an income entry
// @route   PUT /api/income/:id
// @access  Public (will add auth later)
exports.updateIncome = async (req, res) => {
    try {
        const income = await Income.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!income) {
            return res.status(404).json({
                success: false,
                message: 'Income entry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: income
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while updating income',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Delete an income entry
// @route   DELETE /api/income/:id
// @access  Public (will add auth later)
exports.deleteIncome = async (req, res) => {
    try {
        const income = await Income.findByIdAndDelete(req.params.id);

        if (!income) {
            return res.status(404).json({
                success: false,
                message: 'Income entry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while deleting income',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
