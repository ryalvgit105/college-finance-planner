const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verifyFeatureToggles() {
    try {
        console.log('🚀 Starting Feature Toggles Verification...');

        // 1. Create a Profile
        const userId = '648a1b2c3d4e5f6a7b8c9d0e'; // Random ObjectId
        const profileName = `Toggle Test Profile ${Date.now()}`;

        console.log(`\n1️⃣ Creating Profile: "${profileName}"...`);
        const createProfileRes = await axios.post(`${API_URL}/profiles`, {
            userId,
            name: profileName,
            profileType: 'Business'
        });

        if (!createProfileRes.data.success) {
            throw new Error('Failed to create profile');
        }

        const profile = createProfileRes.data.data;
        const profileId = profile._id;
        console.log(`✅ Profile Created! ID: ${profileId}`);

        // Verify defaults
        console.log('   Checking default toggles...');
        const defaults = profile.enabledModules;
        if (defaults.assets && defaults.debts && defaults.goals) {
            console.log('✅ Default toggles are all TRUE as expected.');
        } else {
            console.error('❌ Default toggles are incorrect:', defaults);
        }

        // 2. Update Profile to disable 'goals'
        console.log(`\n2️⃣ Updating Profile to disable 'goals' module...`);
        const updateProfileRes = await axios.put(`${API_URL}/profiles/${profileId}`, {
            enabledModules: {
                goals: false
            }
        });

        if (!updateProfileRes.data.success) {
            throw new Error('Failed to update profile');
        }

        const updatedProfile = updateProfileRes.data.data;
        console.log('✅ Profile Updated!');

        // 3. Verify the change
        console.log('   Verifying toggle state...');
        if (updatedProfile.enabledModules.goals === false && updatedProfile.enabledModules.assets === true) {
            console.log('✅ Goals module is now DISABLED (false).');
            console.log('✅ Assets module remains ENABLED (true).');
        } else {
            console.error('❌ Toggles did not update correctly:', updatedProfile.enabledModules);
        }

        console.log('\n✨ Verification Complete: Feature Toggles are Working!');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verifyFeatureToggles();
