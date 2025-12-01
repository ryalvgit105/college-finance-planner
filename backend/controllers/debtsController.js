const Debt = require('../models/Debt');

// @desc    Create a new debt
// @route   POST /api/debts
// @access  Public (will add auth later)
exports.createDebt = async (req, res) => {
    try {
        const { profileId, type, balance, interestRate, monthlyPayment, description } = req.body;

        if (!profileId) {
            return res.status(400).json({
                success: false,
                message: 'Profile ID is required'
            });
        }

        // Create new debt
        const debt = await Debt.create({
            profileId,
            type,
            balance,
            interestRate,
            monthlyPayment,
            description
        });

        res.status(201).json({
            success: true,
            data: debt
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
            message: 'Server error while creating debt',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all debts
// @route   GET /api/debts
// @access  Public (will add auth later)
exports.getAllDebts = async (req, res) => {
    try {
        const { profileId } = req.query;
        let query = {};

        if (profileId) {
            query.profileId = profileId;
        }

        const debts = await Debt.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: debts.length,
            data: debts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching debts',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
