const Asset = require('../models/Asset');
const Debt = require('../models/Debt');
const Income = require('../models/Income');
const Goal = require('../models/Goal');

// @desc    Generate financial projection
// @route   GET /api/projection
// @access  Public (will add auth later)
exports.getProjection = async (req, res) => {
    try {
        const { profileId } = req.query;

        if (!profileId) {
            return res.status(400).json({
                success: false,
                message: 'Profile ID is required'
            });
        }

        // Fetch all financial data scoped by profileId
        const assets = await Asset.find({ profileId });
        const debts = await Debt.find({ profileId });
        const incomeRecords = await Income.find({ profileId }).sort({ createdAt: -1 }).limit(1);
        const goals = await Goal.find({ profileId });

        // Get the most recent income record
        const currentIncome = incomeRecords.length > 0 ? incomeRecords[0] : null;

        // Calculate total assets
        const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);

        // Calculate total debts
        const totalDebts = debts.reduce((sum, debt) => sum + debt.balance, 0);

        // Calculate net worth
        const netWorth = totalAssets - totalDebts;

        // Calculate monthly debt payments
        const monthlyDebtPayments = debts.reduce((sum, debt) => {
            return sum + (debt.monthlyPayment || 0);
        }, 0);

        // Calculate savings rate (if income data exists)
        let savingsRate = null;
        let monthlySavings = null;
        let monthlyIncome = null;

        if (currentIncome) {
            monthlyIncome = currentIncome.currentIncome / 12;

            // Calculate total monthly expenses from goals
            const totalMonthlyBudget = goals.reduce((sum, goal) => sum + goal.monthlyBudget, 0);

            // Monthly savings = income - debt payments - budget expenses
            monthlySavings = monthlyIncome - monthlyDebtPayments - totalMonthlyBudget;

            // Savings rate as percentage
            savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
        }

        // Goal tracking analysis
        const goalAnalysis = goals.map(goal => {
            const today = new Date();
            const targetDate = new Date(goal.targetDate);
            const monthsRemaining = Math.max(0, (targetDate - today) / (1000 * 60 * 60 * 24 * 30));

            // How much needs to be saved per month to reach goal
            const monthlySavingsNeeded = monthsRemaining > 0 ? goal.targetAmount / monthsRemaining : goal.targetAmount;

            // Is the goal achievable with current savings?
            const isAchievable = monthlySavings !== null ? monthlySavings >= monthlySavingsNeeded : null;

            return {
                goalName: goal.goalName,
                targetAmount: goal.targetAmount,
                targetDate: goal.targetDate,
                monthsRemaining: Math.round(monthsRemaining),
                monthlySavingsNeeded: Math.round(monthlySavingsNeeded),
                currentMonthlySavings: monthlySavings ? Math.round(monthlySavings) : null,
                isAchievable,
                status: monthsRemaining <= 0 ? 'overdue' : isAchievable ? 'on-track' : 'at-risk'
            };
        });

        // Investment growth projection (6% annual return)
        const annualReturnRate = 0.06;
        const monthlyReturnRate = annualReturnRate / 12;

        // Project 1, 5, and 10 year growth
        const projectionYears = [1, 5, 10];
        const investmentProjections = projectionYears.map(years => {
            const months = years * 12;
            let futureValue = totalAssets;

            // Compound growth with monthly contributions
            for (let i = 0; i < months; i++) {
                futureValue = futureValue * (1 + monthlyReturnRate);
                if (monthlySavings && monthlySavings > 0) {
                    futureValue += monthlySavings;
                }
            }

            return {
                years,
                projectedValue: Math.round(futureValue),
                totalContributions: Math.round(totalAssets + (monthlySavings || 0) * months),
                investmentGains: Math.round(futureValue - totalAssets - (monthlySavings || 0) * months)
            };
        });

        // Summary statistics
        const summary = {
            netWorth,
            totalAssets,
            totalDebts,
            monthlyIncome: monthlyIncome ? Math.round(monthlyIncome) : null,
            monthlyDebtPayments: Math.round(monthlyDebtPayments),
            monthlySavings: monthlySavings ? Math.round(monthlySavings) : null,
            savingsRate: savingsRate ? Math.round(savingsRate * 100) / 100 : null,
            activeGoals: goals.length,
            assetsCount: assets.length,
            debtsCount: debts.length
        };

        res.status(200).json({
            success: true,
            data: {
                summary,
                goalAnalysis,
                investmentProjections,
                recommendations: generateRecommendations(summary, goalAnalysis)
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error while generating projection',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper function to generate recommendations
function generateRecommendations(summary, goalAnalysis) {
    const recommendations = [];

    // Net worth recommendations
    if (summary.netWorth < 0) {
        recommendations.push({
            category: 'Net Worth',
            priority: 'high',
            message: 'Your net worth is negative. Focus on paying down high-interest debt first.'
        });
    }

    // Savings rate recommendations
    if (summary.savingsRate !== null) {
        if (summary.savingsRate < 10) {
            recommendations.push({
                category: 'Savings Rate',
                priority: 'high',
                message: 'Your savings rate is below 10%. Try to reduce expenses or increase income to save more.'
            });
        } else if (summary.savingsRate >= 20) {
            recommendations.push({
                category: 'Savings Rate',
                priority: 'low',
                message: 'Great job! Your savings rate is healthy at ' + summary.savingsRate.toFixed(1) + '%.'
            });
        }
    }

    // Goal recommendations
    const atRiskGoals = goalAnalysis.filter(g => g.status === 'at-risk');
    if (atRiskGoals.length > 0) {
        recommendations.push({
            category: 'Goals',
            priority: 'medium',
            message: `${atRiskGoals.length} goal(s) are at risk. Consider adjusting target dates or increasing savings.`
        });
    }

    // Debt recommendations
    if (summary.monthlyDebtPayments > 0 && summary.monthlyIncome) {
        const debtToIncomeRatio = (summary.monthlyDebtPayments / summary.monthlyIncome) * 100;
        if (debtToIncomeRatio > 40) {
            recommendations.push({
                category: 'Debt',
                priority: 'high',
                message: 'Your debt-to-income ratio is high. Consider debt consolidation or refinancing.'
            });
        }
    }

    return recommendations;
}
