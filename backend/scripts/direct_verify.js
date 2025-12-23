const mongoose = require('mongoose');
const MonthlySnapshot = require('../models/MonthlySnapshot');
const Asset = require('../models/Asset');
const Profile = require('../models/Profile');
require('dotenv').config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/financeplanner';

async function runDirectVerification() {
    try {
        console.log('1. Connecting to DB...');
        await mongoose.connect(MONGODB_URI);
        console.log('   Connected.');

        // Get Profile
        const profile = await Profile.findOne();
        if (!profile) throw new Error('No profile found');
        const profileId = profile._id;
        console.log(`   Using Profile: ${profileId}`);

        // Create Asset
        console.log('2. Creating Asset...');
        const asset = await Asset.create({
            profileId,
            type: 'Direct DB Asset',
            value: 2000,
            description: 'Direct Test'
        });
        console.log(`   Asset Created: ${asset._id}`);

        // Simulate Capture Logic
        console.log('3. simulating Capture...');
        const itemsToSnapshot = [{
            originalId: asset._id,
            name: asset.description || asset.type,
            value: asset.value,
            category: asset.type
        }];
        const totalValue = 2000;

        const snapshot = await MonthlySnapshot.findOneAndUpdate(
            { profileId, year: 2025, month: 2, type: 'asset' },
            {
                items: itemsToSnapshot,
                totalValue,
                isClosed: true
            },
            { new: true, upsert: true }
        );
        console.log(`   Snapshot Captured: ${snapshot._id}, Total: ${snapshot.totalValue}`);

        // Verify History Logic
        console.log('4. Verifying History...');
        const history = await MonthlySnapshot.find({
            profileId,
            year: 2025,
            type: 'asset'
        }).sort({ month: 1 });

        console.log(`   History Found: ${history.length} items`);
        if (history.some(h => h.month === 2 && h.totalValue === 2000)) {
            console.log('✅ Direct Verification SUCCESS');
        } else {
            console.log('❌ Direct Verification FAILED');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

runDirectVerification();
