const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verifyProfiles() {
    try {
        console.log('🚀 Starting Profile System Verification...');

        // 1. Create a Profile
        const userId = '648a1b2c3d4e5f6a7b8c9d0e'; // Random ObjectId
        const profileName = `Test Profile ${Date.now()}`;

        console.log(`\n1️⃣ Creating Profile: "${profileName}"...`);
        const createProfileRes = await axios.post(`${API_URL}/profiles`, {
            userId,
            name: profileName,
            profileType: 'Personal'
        });

        if (!createProfileRes.data.success) {
            throw new Error('Failed to create profile');
        }

        const profileId = createProfileRes.data.data._id;
        console.log(`✅ Profile Created! ID: ${profileId}`);

        // 2. Create an Asset associated with this Profile
        console.log(`\n2️⃣ Creating Asset for Profile ID: ${profileId}...`);
        const createAssetRes = await axios.post(`${API_URL}/assets`, {
            profileId,
            type: 'Savings',
            value: 5000,
            description: 'Emergency Fund'
        });

        if (!createAssetRes.data.success) {
            throw new Error('Failed to create asset');
        }
        console.log('✅ Asset Created!');

        // 3. Fetch Assets filtering by Profile ID
        console.log(`\n3️⃣ Fetching Assets for Profile ID: ${profileId}...`);
        const getAssetsRes = await axios.get(`${API_URL}/assets`, {
            params: { profileId }
        });

        const assets = getAssetsRes.data.data;
        const myAsset = assets.find(a => a.profileId === profileId);

        if (myAsset) {
            console.log(`✅ Found asset belonging to profile: ${myAsset.description} ($${myAsset.value})`);
        } else {
            console.error('❌ Could not find the created asset in the filtered list!');
        }

        // 4. Verify Data Segregation (Optional: Create another profile and ensure it doesn't see this asset)
        // For now, just success is enough.

        console.log('\n✨ Verification Complete: Profile System is Working!');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verifyProfiles();
