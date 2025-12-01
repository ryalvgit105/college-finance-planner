const Investment = require('../models/Investment');
const { calculateProjections } = require('../utils/longTermProjection');

// @desc    Get all investments for a profile
// @route   GET /api/investments/:profileId
// @access  Public
exports.getInvestments = async (req, res) => {
    try {
        const { profileId } = req.params;
        const investments = await Investment.find({ profileId });

        // Calculate projections
        const projections = calculateProjections(investments);

        res.status(200).json({
            success: true,
            data: investments,
            projections
        });
    } catch (error) {
        console.error('Error fetching investments:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create a new investment
// @route   POST /api/investments
// @access  Public
exports.createInvestment = async (req, res) => {
    try {
        const investment = await Investment.create(req.body);
        res.status(201).json({
            success: true,
            data: investment
        });
    } catch (error) {
        console.error('Error creating investment:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Update an investment
// @route   PUT /api/investments/:id
// @access  Public
exports.updateInvestment = async (req, res) => {
    try {
        const investment = await Investment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!investment) {
            return res.status(404).json({ success: false, error: 'Investment not found' });
        }

        res.status(200).json({
            success: true,
            data: investment
        });
    } catch (error) {
        console.error('Error updating investment:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete an investment
// @route   DELETE /api/investments/:id
// @access  Public
exports.deleteInvestment = async (req, res) => {
    try {
        const investment = await Investment.findByIdAndDelete(req.params.id);

        if (!investment) {
            return res.status(404).json({ success: false, error: 'Investment not found' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting investment:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
