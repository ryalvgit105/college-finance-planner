const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const PROFILE_ID = '6750da52d192e07802871861'; // Using a known profile ID or should fetch one. 
// Ideally we create a profile first, but for now we'll assumes a profile exists or just check if we can reach the endpoint.
// We will start by fetching all profiles to get a valid ID.

async function verifyInvestments() {
    console.log('🚀 Starting Investment API Verification...');
    let profileId;

    try {
        // 1. Get a Profile ID
        try {
            // This is a bit tricky without auth, assuming public access per current code status
            // We just need ANY valid mongo ID if the backend checks valid format, 
            // but if it checks for existence we need a real one.
            // Let's create a dummy profile if possible, or use a hardcoded one if the user has one.
            // The user's env has "6750da52d192e07802871861" in recent logs? No, I don't see logs.
            // I will create a dummy profile.
            console.log('Creating unique test profile...');
            const profileRes = await axios.post(`${BASE_URL}/profiles`, {
                name: `Test Profile ${Date.now()}`,
                age: 30,
                retirementAge: 65,
                userId: 'test-user-v4'
            });
            profileId = profileRes.data.data._id;
            console.log('✅ Created Test Profile:', profileId);
        } catch (err) {
            console.warn('⚠️ Could not create profile (api/profiles might not exist or verify auth). Using fallback ID.');
            profileId = '6650da52d192e07802871861'; // Random 24-char hex string
        }

        // 2. Create Investment (Optional Monthly Contribution OMITTED)
        console.log('\n--- Test 1: Create Investment (No Monthly Contribution) ---');
        const invPayload = {
            profileId,
            name: 'Test Stock A',
            assetType: 'stock',
            currentValue: 1000,
            expectedAnnualReturn: 7,
            // monthlyContribution omitted
            taxTreatment: 'taxable',
            startYearOffset: 0,
            endYearOffset: 30
        };

        const createRes = await axios.post(`${BASE_URL}/investments`, invPayload);
        const invId = createRes.data.data._id;
        console.log('✅ Created Investment:', invId);
        console.log('   Expected monthlyContribution to be 0:', createRes.data.data.monthlyContribution);
        if (createRes.data.data.monthlyContribution !== 0) throw new Error('Default value failed');

        // 3. Create Investment (With Monthly Contribution)
        console.log('\n--- Test 2: Create Investment (WITH Monthly Contribution) ---');
        const invPayload2 = {
            profileId,
            name: 'Test Fund B',
            assetType: 'ETF',
            currentValue: 5000,
            expectedAnnualReturn: 6,
            monthlyContribution: 200,
            taxTreatment: 'tax_deferred'
        };
        const createRes2 = await axios.post(`${BASE_URL}/investments`, invPayload2);
        const invId2 = createRes2.data.data._id;
        console.log('✅ Created Investment 2:', invId2);
        console.log('   Expected monthlyContribution to be 200:', createRes2.data.data.monthlyContribution);

        // 4. Update Investment
        console.log('\n--- Test 3: Update Investment 1 ---');
        const updateRes = await axios.put(`${BASE_URL}/investments/${invId}`, {
            currentValue: 1500,
            name: 'Test Stock A Updated'
        });
        console.log('✅ Updated Investment 1. New Value:', updateRes.data.data.currentValue);
        if (updateRes.data.data.currentValue !== 1500) throw new Error('Update failed');

        // 5. Get Investments
        console.log('\n--- Test 4: List Investments ---');
        const listRes = await axios.get(`${BASE_URL}/investments/${profileId}`);
        const items = listRes.data.data;
        console.log(`✅ Fetched ${items.length} investments.`);
        const found = items.find(i => i._id === invId);
        if (!found) throw new Error('Created investment not found in list');

        // 6. Delete Investment
        console.log('\n--- Test 5: Delete Investment 2 ---');
        await axios.delete(`${BASE_URL}/investments/${invId2}`);
        console.log('✅ Deleted Investment 2');

        // Verify Delete
        const listRes2 = await axios.get(`${BASE_URL}/investments/${profileId}`);
        const items2 = listRes2.data.data;
        if (items2.find(i => i._id === invId2)) throw new Error('Investment 2 still exists after delete');
        console.log('✅ Verification confirmed: Item is gone.');

        console.log('\n🎓 ALL TESTS PASSED SUCCESSFULLY! 🎓');

    } catch (error) {
        console.error('\n❌ TEST FAILED');
        if (error.response) {
            console.error('API Error:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

verifyInvestments();
