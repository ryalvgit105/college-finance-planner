const Spending = require('../models/Spending');

// @desc    Log a new expense
// @route   POST /api/spending
// @access  Public (will add auth later)
exports.logSpending = async (req, res) => {
    try {
        const { profileId, date, category, type, amount, notes } = req.body;

        if (!profileId) {
            return res.status(400).json({
                success: false,
                message: 'Profile ID is required'
            });
        }

        const spending = await Spending.create({
            profileId,
            date,
            category,
            type: type || 'variable', // Default to variable if not provided
            amount,
            notes
        });

        res.status(201).json({
            success: true,
            data: spending
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
            message: 'Server error while logging spending',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all spending entries
// @route   GET /api/spending
// @access  Public (will add auth later)
exports.getAllSpending = async (req, res) => {
    try {
        const { profileId, month } = req.query;
        let query = {};

        if (profileId) {
            query.profileId = profileId;
        }

        // Filter by month if provided (YYYY-MM)
        if (month) {
            const [year, monthNum] = month.split('-');
            const startDate = new Date(year, monthNum - 1, 1);
            const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);

            query.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const spendingEntries = await Spending.find(query).sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: spendingEntries.length,
            data: spendingEntries
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching spending',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get weekly spending breakdown
// @route   GET /api/spending/week?start=YYYY-MM-DD
// @access  Public (will add auth later)
exports.getWeeklyBreakdown = async (req, res) => {
    try {
        const { start, profileId } = req.query;

        if (!start) {
            return res.status(400).json({
                success: false,
                message: 'Start date is required (format: YYYY-MM-DD)'
            });
        }

        // Parse start date
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);

        // Calculate end date (6 days later)
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        let query = {
            date: {
                $gte: startDate,
                $lte: endDate
            }
        };

        if (profileId) {
            query.profileId = profileId;
        }

        // Fetch all spending records for the week
        const spendingRecords = await Spending.find(query).sort({ date: 1 });

        // Group by day and calculate totals
        const dailyTotals = {};
        let weeklyTotal = 0;

        spendingRecords.forEach(record => {
            const dateKey = record.date.toISOString().split('T')[0];
            if (!dailyTotals[dateKey]) {
                dailyTotals[dateKey] = 0;
            }
            dailyTotals[dateKey] += record.amount;
            weeklyTotal += record.amount;
        });

        // Create array of all 7 days with totals (0 if no spending)
        const days = [];
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);
            const dateKey = currentDate.toISOString().split('T')[0];

            days.push({
                date: dateKey,
                total: dailyTotals[dateKey] || 0
            });
        }

        res.status(200).json({
            success: true,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            days,
            weeklyTotal: Math.round(weeklyTotal * 100) / 100
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching weekly breakdown',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
// @desc    Update a spending entry
// @route   PUT /api/spending/:id
// @access  Public (will add auth later)
exports.updateSpending = async (req, res) => {
    try {
        const spending = await Spending.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!spending) {
            return res.status(404).json({
                success: false,
                message: 'Spending entry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: spending
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while updating spending',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Delete a spending entry
// @route   DELETE /api/spending/:id
// @access  Public (will add auth later)
exports.deleteSpending = async (req, res) => {
    try {
        const spending = await Spending.findByIdAndDelete(req.params.id);

        if (!spending) {
            return res.status(404).json({
                success: false,
                message: 'Spending entry not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while deleting spending',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
