const Goal = require('../models/Goal');

// @desc    Create a financial goal with budget
// @route   POST /api/goals
// @access  Public (will add auth later)
exports.createGoal = async (req, res) => {
    try {
        const { goalName, targetAmount, targetDate, monthlyBudget, categories, notes } = req.body;

        // Create new goal
        const goal = await Goal.create({
            goalName,
            targetAmount,
            targetDate,
            monthlyBudget,
            categories,
            notes
        });

        res.status(201).json({
            success: true,
            data: goal
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
            message: 'Server error while creating goal',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all financial goals
// @route   GET /api/goals
// @access  Public (will add auth later)
exports.getAllGoals = async (req, res) => {
    try {
        const goals = await Goal.find().sort({ targetDate: 1 });

        res.status(200).json({
            success: true,
            count: goals.length,
            data: goals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching goals',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
