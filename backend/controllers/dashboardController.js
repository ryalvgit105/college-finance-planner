const Asset = require('../models/Asset');
const Debt = require('../models/Debt');
const Income = require('../models/Income');
const Spending = require('../models/Spending');
const Goal = require('../models/Goal');
const Milestone = require('../models/Milestone');
const Tax = require('../models/Tax');
const Benefits = require('../models/Benefits');
const { calculateNetIncome } = require('../utils/incomeCalculator');

// @desc    Get dashboard summary data
// @route   GET /api/dashboard/summary/:profileId
// @access  Public
exports.getDashboardSummary = async (req, res) => {
    try {
        const { profileId } = req.params;

        if (!profileId) {
            return res.status(400).json({
                success: false,
                message: 'Profile ID is required'
            });
        }

        // 1. Fetch Data in Parallel
        const [assets, debts, incomeRecords, spending, goals, milestones, taxSettings, benefits] = await Promise.all([
            Asset.find({ profileId }),
            Debt.find({ profileId }),
            Income.find({ profileId }).sort({ createdAt: -1 }).limit(1),
            Spending.find({
                profileId,
                date: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
                }
            }),
            Goal.find({ profileId }),
            Milestone.find({ profileId }),
            Tax.findOne({ profileId }),
            Benefits.findOne({ profileId })
        ]);

        // 2. Calculate Aggregates

        // Total Assets
        const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);

        // Total Debts
        const totalDebts = debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);

        // Gross Income (Annual) from latest record
        const latestIncome = incomeRecords.length > 0 ? incomeRecords[0] : null;
        const grossAnnualIncome = latestIncome ? (latestIncome.currentIncome || 0) : 0;

        // Calculate Net Income using Tax + Benefits Engine
        const incomeDetails = calculateNetIncome(grossAnnualIncome, taxSettings, benefits);
        const netMonthlyIncome = incomeDetails.netMonthlyIncome;

        // Monthly Spending (Sum of current month)
        const monthlySpending = spending.reduce((sum, item) => sum + (item.amount || 0), 0);

        // Net Worth
        const netWorth = totalAssets - totalDebts;

        // Monthly Savings (Net Income - Spending)
        const monthlySavings = netMonthlyIncome - monthlySpending;

        // Savings Rate
        const savingsRate = netMonthlyIncome > 0 ? (monthlySavings / netMonthlyIncome) * 100 : 0;

        // 3. Process Lists

        // Next 3 Active Goals
        const activeGoals = goals
            .filter(g => (g.currentAmount || 0) < (g.targetAmount || 0))
            .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
            .slice(0, 3);

        // Next 3 Upcoming Milestones
        const upcomingMilestones = milestones
            .filter(m => new Date(m.date) > new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3);

        // 4. Construct Payload
        const payload = {
            assets: totalAssets,
            debts: totalDebts,
            income: netMonthlyIncome, // Updated to Net Monthly
            grossIncome: grossAnnualIncome / 12, // Keep gross for reference if needed
            spending: monthlySpending,
            netWorth,
            monthlySavings,
            savingsRate,
            activeGoals,
            upcomingMilestones,
            // Phase 2 Extensions
            netAnnualIncome: incomeDetails.netAnnualIncome,
            federalTax: incomeDetails.federalTax,
            stateTax: incomeDetails.stateTax,
            totalBenefits: incomeDetails.totalBenefits
        };

        res.status(200).json({
            success: true,
            data: payload
        });

    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard summary',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
