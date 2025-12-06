const Profile = require('../models/Profile');
const Tax = require('../models/Tax');
const Benefits = require('../models/Benefits');

// @desc    Create a new profile
// @route   POST /api/profiles
// @access  Public (will add auth later)
exports.createProfile = async (req, res) => {
    try {
        const { userId, name, profileType } = req.body;

        // Check if profile with same name exists for user
        const profileExists = await Profile.findOne({ userId, name });
        if (profileExists) {
            return res.status(400).json({
                success: false,
                message: 'Profile with this name already exists for this user'
            });
        }

        const profile = await Profile.create({
            userId,
            name,
            profileType
        });

        // Initialize default Tax and Benefits settings
        await Promise.all([
            Tax.create({ profileId: profile._id }),
            Benefits.create({ profileId: profile._id })
        ]);

        res.status(201).json({
            success: true,
            data: profile
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => ({
                field: err.path,
                message: err.message
            }));
            return res.status(400).json({ success: false, errors });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while creating profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Get all profiles for a user
// @route   GET /api/profiles
// @access  Public (will add auth later)
exports.getProfiles = async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const profiles = await Profile.find({ userId });

        res.status(200).json({
            success: true,
            count: profiles.length,
            data: profiles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profiles',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// @desc    Update a profile
// @route   PUT /api/profiles/:id
// @access  Public (will add auth later)
exports.updateProfile = async (req, res) => {
    try {
        const { name, profileType, enabledModules, categories } = req.body;

        // Check if profile exists
        let profile = await Profile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        // Update fields
        if (name) profile.name = name;
        if (profileType) profile.profileType = profileType;
        if (enabledModules) {
            // Merge existing enabledModules with new ones to allow partial updates
            profile.enabledModules = {
                ...profile.enabledModules,
                ...enabledModules
            };
        }
        if (categories) profile.categories = categories;
        if (req.body.budgets) {
            profile.budgets = req.body.budgets;
        }

        await profile.save();

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
