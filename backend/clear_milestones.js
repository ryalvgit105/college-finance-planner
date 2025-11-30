const mongoose = require('mongoose');
const Milestone = require('./models/Milestone');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const clearMilestones = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/college-finance-planner';
        console.log('Connecting to:', uri);

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const result = await Milestone.deleteMany({});
        console.log(`Cleared ${result.deletedCount} milestones`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

clearMilestones();
