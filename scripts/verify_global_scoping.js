const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verifyGlobalScoping() {
    try {
        console.log('🚀 Starting Global Scoping Verification...');

        // 1. Create a Profile
        const userId = '648a1b2c3d4e5f6a7b8c9d0e';
        const profileName = `Scope Test Profile ${Date.now()}`;

        console.log(`\n1️⃣ Creating Profile: "${profileName}"...`);
        const createProfileRes = await axios.post(`${API_URL}/profiles`, {
            userId,
            name: profileName,
            profileType: 'Personal'
        });
        const profileId = createProfileRes.data.data._id;
        console.log(`✅ Profile Created! ID: ${profileId}`);

        // 2. Create Data (Asset & Goal)
        console.log('\n2️⃣ Creating Asset and Goal...');
        await axios.post(`${API_URL}/assets`, {
            profileId,
            type: 'Savings',
            value: 10000,
            description: 'Scope Test Asset'
        });
        await axios.post(`${API_URL}/goals`, {
            profileId,
            goalName: 'Scope Test Goal',
            targetAmount: 5000,
            targetDate: '2026-01-01',
            monthlyBudget: 200
        });
        console.log('✅ Data Created!');

        // 3. Test Projection WITHOUT profileId (Should Fail)
        console.log('\n3️⃣ Testing Projection WITHOUT profileId (Expect Failure)...');
        try {
            await axios.get(`${API_URL}/projection`);
            console.error('❌ Projection API should have failed but succeeded!');
        } catch (error) {
            if (error.response && error.response.status === 400) {
                console.log('✅ Projection API correctly rejected request without profileId (400 Bad Request).');
            } else {
                console.error('❌ Unexpected error:', error.message);
            }
        }

        // 4. Test Projection WITH profileId (Should Succeed and return correct data)
        console.log('\n4️⃣ Testing Projection WITH profileId...');
        const projectionRes = await axios.get(`${API_URL}/projection`, {
            params: { profileId }
        });

        const summary = projectionRes.data.data.summary;
        if (summary.totalAssets === 10000 && summary.activeGoals === 1) {
            console.log('✅ Projection returned correct scoped data:');
            console.log(`   - Total Assets: $${summary.totalAssets}`);
            console.log(`   - Active Goals: ${summary.activeGoals}`);
        } else {
            console.error('❌ Projection returned incorrect data:', summary);
        }

        // 5. Test Milestone Update Scoping
        console.log('\n5️⃣ Testing Milestone Update Scoping...');
        // Create milestone
        const milestoneRes = await axios.post(`${API_URL}/milestones`, {
            profileId,
            title: 'Scope Milestone',
            date: '2025-12-01',
            description: 'Test'
        });
        const milestoneId = milestoneRes.data.data._id;

        // Try to update with WRONG profileId (Should Fail/Not Find)
        const wrongProfileId = '648a1b2c3d4e5f6a7b8c9d0f'; // Different ID
        try {
            await axios.patch(`${API_URL}/milestones/${milestoneId}`, {
                profileId: wrongProfileId,
                title: 'Hacked Milestone'
            });
            console.error('❌ Milestone update should have failed (not found) but succeeded!');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Milestone update correctly rejected/not found with wrong profileId.');
            } else {
                console.error('❌ Unexpected error during milestone update test:', error.message);
            }
        }

        console.log('\n✨ Verification Complete: Global Profile Scoping is Enforced!');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error.response ? error.response.data : error.message);
    }
}

verifyGlobalScoping();
