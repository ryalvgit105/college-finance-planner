const mongoose = require('mongoose');
require('dotenv').config();
const Investment = require('./models/Investment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college-finance-planner';

async function listAllInvestments() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const investments = await Investment.find({});
        console.log(`\nFound ${investments.length} total investments across ALL profiles:\n`);

        investments.forEach(inv => {
            console.log(`ID: ${inv._id}`);
            console.log(`Name: ${inv.name}`);
            console.log(`Type: ${inv.assetType} | Value: ${inv.currentValue}`);
            console.log(`ProfileID: ${inv.profileId}`);
            console.log(`Created: ${inv.createdAt}`);
            console.log('-----------------------------------');
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

listAllInvestments();
