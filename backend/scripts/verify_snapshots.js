const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function runVerification() {
    try {
        console.log('1. Fetching Profile ID via Test Helper...');

        // Use the test helper endpoint
        const profileRes = await axios.get(`${API_URL}/snapshots/test-helpers/profile-id`);
        const profileId = profileRes.data.profileId;

        console.log(`   Found Profile ID: ${profileId}`);

        console.log('2. Creating a Test Asset...');
        const assetRes = await axios.post(`${API_URL}/assets`, {
            profileId: profileId,
            type: 'Savings Account',
            value: 5000,
            description: 'Test Verification Asset'
        });
        console.log(`   Asset Created: ${assetRes.data.data._id}`);

        console.log('3. Capturing Snapshot for Jan 2025...');
        const snapshotRes = await axios.post(`${API_URL}/snapshots/capture`, {
            profileId: profileId,
            month: 1,
            year: 2025,
            type: 'asset'
        });
        console.log(`   Snapshot Captured. Total Value: ${snapshotRes.data.totalValue}`);

        console.log('4. Fetching Snapshot History...');
        const historyRes = await axios.get(`${API_URL}/snapshots/asset/history?year=2025&profileId=${profileId}`);
        console.log(`   History Retrieved: ${historyRes.data.length} snapshots found`);
        // console.log('   Data:', JSON.stringify(historyRes.data, null, 2));

        if (historyRes.data.some(s => s.month === 1 && s.totalValue >= 5000)) {
            console.log('✅ Verification Complete: Snapshot system is working.');
        } else {
            console.log('⚠️ Verification Warning: Snapshot data might not match expected value.');
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error.response ? error.response.data : error.message);
    }
}

runVerification();
