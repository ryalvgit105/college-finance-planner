const mongoose = require('mongoose');
require('dotenv').config();

// Define a simple Profile schema to avoid potential model file issues
const ProfileSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, default: 'Test User' },
    createdAt: { type: Date, default: Date.now }
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

// Profile ID expected by frontend
const TARGET_ID = '648a1b2c3d4e5f6a7b8c9d0e';

const checkProfile = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/college-finance-planner');
        console.log('Connected to MongoDB');

        let profile = await Profile.findById(TARGET_ID);

        if (profile) {
            console.log('✅ Profile found:', profile);
        } else {
            console.log('❌ Profile NOT found. Creating default profile...');
            profile = new Profile({
                _id: TARGET_ID,
                userId: 'user_123_mock',
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
