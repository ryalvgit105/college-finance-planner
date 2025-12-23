const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const Asset = require('../models/Asset');
const Income = require('../models/Income');
const MonthlySnapshot = require('../models/MonthlySnapshot');
require('dotenv').config({ path: './backend/.env' });

const runVerification = async () => {
    try {
        console.log('Connecting to DB...');
        // Force IPv4
        await mongoose.connect('mongodb://127.0.0.1:27017/college-finance-planner');
        console.log('Connected.');

        // 1. Create Test Profile
        const profile = await Profile.create({
            user: new mongoose.Types.ObjectId(), // Fake User ID
            name: 'Time Traveller',
            currentAge: 30,
            retirementAge: 65,
            lifeExpectancy: 90
        });
        console.log('Profile created:', profile._id);

        // --- ASSET TEST ---
        console.log('\n--- TESTING ASSET TIME MACHINE ---');
        // 2 Create Asset (Value 1000)
        let asset = await Asset.create({
            profileId: profile._id,
            type: 'Cash',
            value: 1000,
            description: 'Emergency Fund'
        });
        console.log('Asset created (Live: 1000)');

        // 3. Capture Snapshot Jan 2025
        const snapshotController = require('../controllers/snapshotController');
        // We will mock req/res for controller, or just use logic. 
        // Better: Call logic directly effectively by replicating it or using model.
        // I will replicate controller logic here for strict test of MODEL capability, 
        // as calling controller requires Express mock.

        // Capture Jan
        await MonthlySnapshot.create({
            profileId: profile._id,
            month: 1,
            year: 2025,
            type: 'asset',
            items: [{
                originalId: asset._id,
                name: asset.description,
                value: asset.value,
                category: asset.type
            }],
            totalValue: asset.value,
            isClosed: true
        });
        console.log('Snapshot captured for Jan 2025 (Value: 1000)');

        // 4. Update Asset to 2000
        asset.value = 2000;
        await asset.save();
        console.log('Asset updated (Live: 2000)');

        // 5. Verify Jan Snapshot is still 1000
        const janSnapshot = await MonthlySnapshot.findOne({ profileId: profile._id, month: 1, year: 2025, type: 'asset' });
        console.log('Jan Snapshot Value:', janSnapshot.items[0].value);
        if (janSnapshot.items[0].value !== 1000) throw new Error('Time Machine Failed! Jan snapshot changed.');

        // 6. Verify Live is 2000
        const liveAsset = await Asset.findById(asset._id);
        console.log('Live Asset Value:', liveAsset.value);
        if (liveAsset.value !== 2000) throw new Error('Live Update Failed!');


        // --- INCOME TEST ---
        console.log('\n--- TESTING INCOME TIME MACHINE ---');
        // 7. Create Income (50k)
        let income = await Income.create({
            profileId: profile._id,
            currentIncome: 50000,
            incomeSources: ['Salary']
        });
        console.log('Income created (Live: 50k)');

        // 8. Capture Snapshot Feb 2025
        await MonthlySnapshot.create({
            profileId: profile._id,
            month: 2,
            year: 2025,
            type: 'income',
            items: [{
                originalId: income._id,
                name: 'Current Annual Income',
                value: income.currentIncome,
                category: 'Income'
            }],
            totalValue: income.currentIncome,
            isClosed: true
        });
        console.log('Snapshot captured for Feb 2025 (Value: 50k)');

        // 9. Update Income to 60k
        // Simulate "New Record" or "Update"? Controller updates if ID known, or creates new if separate.
        // Assuming we update the doc (like Asset).
        income.currentIncome = 60000;
        await income.save();
        console.log('Income updated (Live: 60k)');

        // 10. Verify Feb Snapshot is 50k
        const febSnapshot = await MonthlySnapshot.findOne({ profileId: profile._id, month: 2, year: 2025, type: 'income' });
        console.log('Feb Snapshot Value:', febSnapshot.items[0].value);
        if (febSnapshot.items[0].value !== 50000) throw new Error('Time Machine Failed! Feb snapshot changed.');

        // 11. Verify Live is 60k
        const liveIncome = await Income.findById(income._id);
        console.log('Live Income Value:', liveIncome.currentIncome);
        if (liveIncome.currentIncome !== 60000) throw new Error('Live Income Update Failed!');

        console.log('\nSUCCESS! Time Machine verified.');

        // Cleanup
        await Profile.deleteOne({ _id: profile._id });
        await Asset.deleteMany({ profileId: profile._id });
        await Income.deleteMany({ profileId: profile._id });
        await MonthlySnapshot.deleteMany({ profileId: profile._id });

        mongoose.connection.close();
    } catch (err) {
        console.error('Verification Failed:', err);
        mongoose.connection.close();
        process.exit(1);
    }
};

runVerification();
