const Goal = require('../models/Goal');
const mongoose = require('mongoose');

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
        // Mock data fallback if DB is offline
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json({
                success: true,
                count: 3,
                data: [
                    { _id: '1', goalName: 'Tuition Fund', targetAmount: 20000, currentAmount: 5000, targetDate: new Date('2026-08-01'), monthlyBudget: 500, category: 'Education' },
                    { _id: '2', goalName: 'New Laptop', targetAmount: 1500, currentAmount: 200, targetDate: new Date('2025-12-25'), monthlyBudget: 200, category: 'Tech' },
                    { _id: '3', goalName: 'Textbooks', targetAmount: 500, currentAmount: 0, targetDate: new Date('2026-01-10'), monthlyBudget: 100, category: 'Education' }
                ]
            });
        }

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
