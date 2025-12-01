const PathTemplate = require('../models/PathTemplate');

const seedTemplates = async () => {
    try {
        const count = await PathTemplate.countDocuments();
        if (count > 0) {
            console.log('Path templates already exist. Skipping seed.');
            return;
        }

        const templates = [
            {
                templateName: 'College',
                durationYears: 4,
                startingSalary: 60000,
                salaryGrowthRate: 0.05,
                educationCost: 100000, // Total cost
                benefitsIncluded: true,
                defaultBenefits: {
                    healthInsurance: 2000,
                    retirementContribution: 3000,
                    employerMatch: 1500
                },
                notes: 'Traditional 4-year degree path with tuition costs and delayed earnings.'
            },
            {
                templateName: 'Trade',
                durationYears: 2,
                startingSalary: 45000,
                salaryGrowthRate: 0.03,
                educationCost: 15000,
                benefitsIncluded: true,
                defaultBenefits: {
                    healthInsurance: 1500,
                    retirementContribution: 1000,
                    employerMatch: 500
                },
                notes: 'Vocational training with lower cost and faster entry to workforce.'
            },
            {
                templateName: 'Military',
                durationYears: 0, // Immediate earning
                startingSalary: 35000, // Base pay
                salaryGrowthRate: 0.04,
                educationCost: 0,
                benefitsIncluded: true,
                militarySpecific: true,
                defaultBenefits: {
                    healthInsurance: 0, // Tricare
                    retirementContribution: 0, // TSP
                    employerMatch: 1750, // Blended Retirement
                    militaryHousingAllowance: 18000, // BAH
                    militarySubsistenceAllowance: 4500 // BAS
                },
                notes: 'Immediate earnings with significant non-taxable allowances and benefits.'
            },
            {
                templateName: 'Entrepreneurship',
                durationYears: 1, // Ramp up
                startingSalary: 0, // Initial struggle
                salaryGrowthRate: 0.15, // High risk/reward
                educationCost: 5000, // Startup capital
                benefitsIncluded: false,
                notes: 'High risk path with potential for exponential growth but initial instability.'
            }
        ];

        await PathTemplate.insertMany(templates);
        console.log('Path templates seeded successfully.');
    } catch (error) {
        console.error('Error seeding path templates:', error);
    }
};

module.exports = seedTemplates;
