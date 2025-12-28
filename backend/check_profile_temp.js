const mongoose = require('mongoose');
require('dotenv').config();

const ProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, default: 'Test User' },
    createdAt: { type: Date, default: Date.now }
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

// This matches the frontend hardcoded ID
const TARGET_ID = '648a1b2c3d4e5f6a7b8c9d0e';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/financeplanner';

const checkProfile = async () => {
    try {
        console.log('Connecting to:', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Force update the profile to have the matching userId
        // ID: 648a1b2c3d4e5f6a7b8c9d0e
        // UserId: 648a1b2c3d4e5f6a7b8c9d0e (Must be this to match frontend query)

        let profile = await Profile.findById(TARGET_ID);

        if (profile) {
            console.log('✅ Found profile. Updating userId...');
            profile.userId = TARGET_ID;
            await profile.save();
            console.log('✅ Updated profile userId to match TARGET_ID:', profile);
        } else {
            console.log('❌ Profile NOT found. Creating with correct userId...');
            profile = new Profile({
                _id: TARGET_ID,
                userId: TARGET_ID, // Use same ID for userId for simplicity
                name: 'Default User'
            });
            await profile.save();
            console.log('✅ Created default profile:', profile);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkProfile();
