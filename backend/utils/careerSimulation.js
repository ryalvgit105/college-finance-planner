const simulationCache = new Map();

/**
 * Simulates a career path based on user inputs and a specific path template.
 * 
 * @param {Object} userInputs - User provided inputs
 * @param {number} userInputs.age - Current age
 * @param {number} userInputs.startingSavings - Initial savings
 * @param {number} userInputs.monthlyLifestyleCost - Monthly living expenses
 * @param {Object} pathTemplate - The career path template to simulate
 * @param {number} horizonYears - Number of years to simulate (default 10)
 * @returns {Object} Simulation results including yearly breakdowns and summary
 */
function simulateCareerPath(userInputs, pathTemplate, horizonYears = 10) {
    const cacheKey = JSON.stringify({ userInputs, pathId: pathTemplate.id, horizonYears });

    if (simulationCache.has(cacheKey)) {
        return simulationCache.get(cacheKey);
    }

    const {
        educationCost, // Total cost (can be negative for paid paths like military)
        yearsOfSchool,
        startingSalary,
        salaryGrowthRate,
        livingCost: pathLivingCost // Monthly living cost during school/training
    } = pathTemplate;

    const {
        startingSavings,
        monthlyLifestyleCost // Baseline monthly living cost (used after school)
    } = userInputs;

    const yearlyIncome = [];
    const yearlyEducationCost = [];
    const yearlyLivingCost = [];
    const yearlyNetCash = [];
    const cumulativeNetCash = [];
    const yearlyDebt = [];

    let currentCash = startingSavings;
    let currentDebt = 0;
    let breakEvenYear = null;
    let peakDebt = 0;

    // Annualize education cost (simple distribution)
    const annualEducationCost = yearsOfSchool > 0 ? educationCost / yearsOfSchool : 0;

    for (let year = 1; year <= horizonYears; year++) {
        let income = 0;
        let eduCost = 0;
        let livCost = 0;

        if (year <= yearsOfSchool) {
            // School Phase
            income = 0; // Simplified: No income during school unless modeled via negative eduCost
            eduCost = annualEducationCost;
            livCost = (pathLivingCost || monthlyLifestyleCost) * 12;
        } else {
            // Work Phase
            const yearsWorking = year - yearsOfSchool;
            // Salary grows from year 1 of work
            income = startingSalary * Math.pow(1 + salaryGrowthRate, yearsWorking - 1);
            eduCost = 0;
            livCost = monthlyLifestyleCost * 12;
        }

        // Net Cash Flow for this year
        // Note: If eduCost is negative (e.g. military income), it adds to cash
        const netFlow = income - livCost - eduCost;

        // Update Cash / Debt State
        // Simple model: Shortfall comes from cash first, then debt. Surplus pays debt first, then cash.

        if (netFlow >= 0) {
            // Surplus
            if (currentDebt > 0) {
                const debtPayment = Math.min(currentDebt, netFlow);
                currentDebt -= debtPayment;
                currentCash += (netFlow - debtPayment);
            } else {
                currentCash += netFlow;
            }
        } else {
            // Shortfall
            const shortfall = Math.abs(netFlow);
            if (currentCash >= shortfall) {
                currentCash -= shortfall;
            } else {
                const remainingShortfall = shortfall - currentCash;
                currentCash = 0;
                currentDebt += remainingShortfall;
            }
        }

        // Track Peak Debt
        if (currentDebt > peakDebt) {
            peakDebt = currentDebt;
        }

        // Calculate Net Worth (Cash - Debt) for Cumulative Net Cash metric
        // The prompt defines cumulativeNetCash as "running total". 
        // "breakEvenYear = first year cumulativeNetCash becomes positive (relative to baseline...)"
        // Let's use Net Worth (Cash - Debt) as the cumulative metric.
        const currentNetWorth = currentCash - currentDebt;

        // Check Break Even (first year Net Worth > Starting Savings? Or just > 0?)
        // "breakEvenYear = first year cumulativeNetCash becomes positive"
        // Usually implies recovering the investment. If we start with 0, it's when we go positive.
        // If we start with savings, it's when we exceed starting savings? 
        // Let's assume > 0 for now, or > startingSavings if we want "return on investment".
        // Given "Debt accumulates...", likely means when we are debt free and positive.
        if (breakEvenYear === null && currentNetWorth >= startingSavings) {
            breakEvenYear = year;
        }

        // Store Yearly Data
        yearlyIncome.push(Math.round(income));
        yearlyEducationCost.push(Math.round(eduCost));
        yearlyLivingCost.push(Math.round(livCost));
        yearlyNetCash.push(Math.round(netFlow));
        cumulativeNetCash.push(Math.round(currentNetWorth));
        yearlyDebt.push(Math.round(currentDebt));
    }

    const result = {
        yearlyIncome,
        yearlyEducationCost,
        yearlyLivingCost,
        yearlyNetCash,
        cumulativeNetCash,
        yearlyDebt,
        breakEvenYear,
        summary: {
            totalEarnings: yearlyIncome.reduce((a, b) => a + b, 0),
            totalCost: yearlyEducationCost.reduce((a, b) => a + b, 0) + yearlyLivingCost.reduce((a, b) => a + b, 0),
            peakDebt: Math.round(peakDebt),
            netCashAtHorizon: cumulativeNetCash[cumulativeNetCash.length - 1]
        }
    };

    simulationCache.set(cacheKey, result);
    return result;
}

module.exports = { simulateCareerPath };
