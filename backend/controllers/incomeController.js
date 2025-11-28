const Income = require('../models/Income');

// @desc    Create or update income/career info
// @route   POST /api/income
// @access  Public (will add auth later)
exports.createOrUpdateIncome = async (req, res) => {
    try {
        const { currentIncome, incomeSources, careerGoal, projectedSalary, educationRequired, notes } = req.body;

        // For now, we'll create a new entry each time
        // In production with auth, you'd update the user's existing income record
        const income = await Income.create({
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
        // Get all income records, sorted by most recent
        const incomeRecords = await Income.find().sort({ createdAt: -1 });

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
