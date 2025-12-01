const Benefits = require('../models/Benefits');

// @desc    Get benefits settings for a profile
// @route   GET /api/benefits/:profileId
// @access  Public
exports.getBenefits = async (req, res) => {
    try {
        const { profileId } = req.params;
        let benefits = await Benefits.findOne({ profileId });

        if (!benefits) {
            return res.status(200).json({
                success: true,
                data: {
                    profileId,
                    healthInsurance: 0,
                    retirementContribution: 0,
                    employerMatch: 0,
                    militaryHousingAllowance: 0,
                    militarySubsistenceAllowance: 0,
                    customBenefits: []
                }
            });
        }

        res.status(200).json({
            success: true,
            data: benefits
        });
    } catch (error) {
        console.error('Error fetching benefits:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create or Update benefits
// @route   POST /api/benefits
// @access  Public
exports.createOrUpdateBenefits = async (req, res) => {
    try {
        const { profileId, ...benefitsData } = req.body;

        let benefits = await Benefits.findOne({ profileId });

        if (benefits) {
            // Update
            benefits = await Benefits.findOneAndUpdate(
                { profileId },
                { $set: benefitsData },
                { new: true }
            );
        } else {
            // Create
            benefits = await Benefits.create({
                profileId,
                ...benefitsData
            });
        }

        res.status(200).json({
            success: true,
            data: benefits
        });
    } catch (error) {
        console.error('Error saving benefits:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete benefits
// @route   DELETE /api/benefits/:id
// @access  Public
exports.deleteBenefits = async (req, res) => {
    try {
        const benefits = await Benefits.findById(req.params.id);

        if (!benefits) {
            return res.status(404).json({ success: false, error: 'Benefits not found' });
        }

        await benefits.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting benefits:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
