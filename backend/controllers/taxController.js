const Tax = require('../models/Tax');

// @desc    Get tax settings for a profile
// @route   GET /api/tax/:profileId
// @access  Public
exports.getTax = async (req, res) => {
    try {
        const { profileId } = req.params;
        let tax = await Tax.findOne({ profileId });

        if (!tax) {
            // Return default if not found (or create one implicitly if preferred, but for now just return defaults structure)
            return res.status(200).json({
                success: true,
                data: {
                    profileId,
                    filingStatus: 'Single',
                    federalBracket: 0.22,
                    stateBracket: 0.05,
                    standardDeduction: 13850,
                    additionalDeductions: 0
                }
            });
        }

        res.status(200).json({
            success: true,
            data: tax
        });
    } catch (error) {
        console.error('Error fetching tax settings:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create or Update tax settings
// @route   POST /api/tax
// @access  Public
exports.createOrUpdateTax = async (req, res) => {
    try {
        const { profileId, ...taxData } = req.body;

        let tax = await Tax.findOne({ profileId });

        if (tax) {
            // Update
            tax = await Tax.findOneAndUpdate(
                { profileId },
                { $set: taxData },
                { new: true }
            );
        } else {
            // Create
            tax = await Tax.create({
                profileId,
                ...taxData
            });
        }

        res.status(200).json({
            success: true,
            data: tax
        });
    } catch (error) {
        console.error('Error saving tax settings:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete tax settings
// @route   DELETE /api/tax/:id
// @access  Public
exports.deleteTax = async (req, res) => {
    try {
        const tax = await Tax.findById(req.params.id);

        if (!tax) {
            return res.status(404).json({ success: false, error: 'Tax settings not found' });
        }

        await tax.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting tax settings:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
