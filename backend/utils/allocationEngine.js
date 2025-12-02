const calculateAllocations = (goals, netMonthlyIncome) => {
    const today = new Date();
    let remainingIncome = netMonthlyIncome || 0;
    let totalShortfall = 0;

    // 1. Calculate Needs per Goal
    const goalNeeds = goals.map(goal => {
        const targetDate = new Date(goal.targetDate);
        // Months remaining (approx)
        let monthsRemaining = (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth());
        if (monthsRemaining <= 0) monthsRemaining = 1; // Avoid division by zero, assume due now

        const amountNeeded = Math.max(0, goal.targetAmount - goal.currentAmount);

        // Simple FV formula if return rate > 0? 
        // Prompt says "Determine neededMonthlyContribution". 
        // For simplicity in allocation engine, let's use linear: Amount / Months.
        const neededMonthly = amountNeeded / monthsRemaining;

        return {
            ...goal.toObject(),
            monthsRemaining,
            amountNeeded,
            neededMonthlyContribution: neededMonthly,
            allocatedAmount: 0
        };
    });

    // 2. Sort by Priority (Descending: 5 is Highest, 1 is Lowest)
    // If priority is equal, sort by deadline (sooner is higher priority)
    goalNeeds.sort((a, b) => {
        if (b.priority !== a.priority) {
            return b.priority - a.priority;
        }
        return new Date(a.targetDate) - new Date(b.targetDate);
    });

    // 3. Allocate Income
    goalNeeds.forEach(goal => {
        if (remainingIncome > 0) {
            const allocation = Math.min(remainingIncome, goal.neededMonthlyContribution);
            goal.allocatedAmount = allocation;
            remainingIncome -= allocation;
        } else {
            goal.allocatedAmount = 0;
        }

        // Calculate Shortfall
        goal.shortfall = Math.max(0, goal.neededMonthlyContribution - goal.allocatedAmount);
        totalShortfall += goal.shortfall;
    });

    return {
        allocations: goalNeeds.map(g => ({
            goalId: g._id,
            goalName: g.goalName,
            needed: g.neededMonthlyContribution,
            allocated: g.allocatedAmount,
            shortfall: g.shortfall,
            priority: g.priority
        })),
        totalShortfall,
        remainingIncome // Surplus
    };
};

module.exports = { calculateAllocations };
