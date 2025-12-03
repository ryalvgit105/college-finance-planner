/**
 * PathFinder V4 Projection Engine
 * Pure functional projection engine for long-horizon financial modeling (up to 100 years)
 * No database dependencies - all data passed in via parameters
 */

/**
 * Run a multi-year financial projection
 * @param {Object} config - Projection configuration
 * @param {number} config.baseYear - Starting year (e.g., 2025)
 * @param {number} config.years - Number of years to project (max 100)
 * @param {Object} config.startingState - Initial financial state
 * @param {Array} config.timelineEvents - Timeline events to apply
 * @param {Object} config.settings - Projection settings (inflation, tax rates, etc.)
 * @returns {Object} Projection results with yearly series
 */
function runProjection({
    baseYear,
    years,
    startingState,
    timelineEvents = [],
    settings = {}
}) {
    // Cap years to maximum 100
    const projectYears = Math.min(Math.max(1, years), 100);

    // Extract settings with defaults
    const {
        inflationRate = 0.02,
        defaultInvestmentReturn = 0.07,
        taxRate = 0.20,
        debtInterestRate = 0.05
    } = settings;

    // Initialize result arrays
    const yearLabels = [];
    const incomeArray = [];
    const spendingArray = [];
    const cashflowArray = [];
    const totalInvestmentsArray = [];
    const totalDebtsArray = [];
    const netWorthArray = [];
    const yearlyStates = [];

    // Initialize state from starting state
    let currentState = initializeState(startingState);

    // Simulate each year
    for (let yearIndex = 0; yearIndex <= projectYears; yearIndex++) {
        const currentYear = baseYear + yearIndex;

        // Apply timeline events for this year
        const eventsThisYear = timelineEvents.filter(e => e.yearOffset === yearIndex);
        currentState = applyTimelineEvents(currentState, eventsThisYear);

        // Calculate financial flows for this year
        const grossIncome = currentState.income || 0;
        const spending = currentState.spending || 0;
        const taxes = grossIncome * taxRate;

        // Calculate required debt payments
        const requiredDebtPayments = calculateDebtPayments(currentState.debts);

        // Calculate cashflow
        const cashflow = grossIncome - spending - taxes - requiredDebtPayments;

        // Update investments
        const investmentResult = updateInvestments(currentState, cashflow, yearIndex);
        currentState = investmentResult.newState;
        const totalContributed = investmentResult.totalContributed;

        // Add surplus cashflow to assets (cash savings)
        // If cashflow was positive, any amount not contributed to investments is added to assets
        // If cashflow was negative, we might need to withdraw from assets (simplified: assets decrease)
        // For now, just add (cashflow - totalContributed) to assets
        // Note: totalContributed is always >= 0
        const surplusCash = cashflow - totalContributed;
        currentState.assets = (currentState.assets || 0) + surplusCash;

        // Update debts (interest accrual and payments)
        currentState = updateDebts(currentState, requiredDebtPayments, debtInterestRate);

        // Calculate totals
        const totalAssets = currentState.assets || 0;
        const totalInvestments = calculateTotalInvestments(currentState.investments);
        const totalDebts = calculateTotalDebts(currentState.debts);
        const netWorth = totalAssets + totalInvestments - totalDebts;

        // Record yearly data
        yearLabels.push(currentYear);
        incomeArray.push(Math.round(grossIncome));
        spendingArray.push(Math.round(spending));
        cashflowArray.push(Math.round(cashflow));
        totalInvestmentsArray.push(Math.round(totalInvestments));
        totalDebtsArray.push(Math.round(totalDebts));
        netWorthArray.push(Math.round(netWorth));

        // Store state snapshot for debugging
        yearlyStates.push({
            year: currentYear,
            yearIndex,
            income: grossIncome,
            spending,
            taxes,
            cashflow,
            surplusCash,
            assets: totalAssets,
            investments: totalInvestments,
            debts: totalDebts,
            netWorth
        });
    }

    return {
        years: yearLabels,
        income: incomeArray,
        spending: spendingArray,
        cashflow: cashflowArray,
        totalInvestments: totalInvestmentsArray,
        totalDebts: totalDebtsArray,
        netWorth: netWorthArray,
        debug: {
            yearlyStates
        }
    };
}

/**
 * Initialize state from starting configuration
 */
function initializeState(startingState) {
    return {
        assets: startingState.assets || 0,
        debts: startingState.debts || [],
        income: startingState.income || 0,
        spending: startingState.spending || 0,
        investments: startingState.investments || [],
        careerPath: startingState.careerPath || null
    };
}

/**
 * Apply timeline events to current state
 */
function applyTimelineEvents(state, events) {
    let newState = { ...state };

    events.forEach(event => {
        switch (event.type) {
            case 'income_change':
                newState.income = event.payload.newIncome || newState.income;
                break;

            case 'spending_change':
                newState.spending = event.payload.newSpending || newState.spending;
                break;

            case 'asset_add':
                newState.assets = (newState.assets || 0) + (event.payload.amount || 0);
                break;

            case 'asset_sale':
                newState.assets = (newState.assets || 0) - (event.payload.amount || 0);
                break;

            case 'debt_add':
                newState.debts = [...(newState.debts || []), {
                    amount: event.payload.amount || 0,
                    interestRate: event.payload.interestRate || 0.05,
                    monthlyPayment: event.payload.monthlyPayment || 0
                }];
                break;

            case 'debt_payoff':
                // Remove first debt matching amount (simplified)
                const payoffAmount = event.payload.amount || 0;
                newState.debts = (newState.debts || []).filter((debt, idx) => {
                    if (idx === 0 && debt.amount <= payoffAmount) {
                        return false; // Remove this debt
                    }
                    return true;
                });
                break;

            case 'investment_start':
                newState.investments = [...(newState.investments || []), {
                    value: event.payload.initialValue || 0,
                    monthlyContribution: event.payload.monthlyContribution || 0,
                    returnRate: event.payload.returnRate || 0.07,
                    active: true
                }];
                break;

            case 'investment_stop':
                // Mark investments as inactive (stop contributions)
                newState.investments = (newState.investments || []).map(inv => ({
                    ...inv,
                    active: false,
                    monthlyContribution: 0
                }));
                break;

            case 'lifestyle_change':
                if (event.payload.newSpending !== undefined) {
                    newState.spending = event.payload.newSpending;
                }
                break;

            case 'career_path_change':
                // Store career path change (minimal implementation for now)
                newState.careerPath = event.payload.careerPath || null;
                if (event.payload.newIncome !== undefined) {
                    newState.income = event.payload.newIncome;
                }
                break;

            default:
                // Unknown event type, ignore
                break;
        }
    });

    return newState;
}

/**
 * Calculate required debt payments for the year
 */
function calculateDebtPayments(debts) {
    if (!debts || debts.length === 0) return 0;

    return debts.reduce((total, debt) => {
        const annualPayment = (debt.monthlyPayment || 0) * 12;
        return total + annualPayment;
    }, 0);
}

/**
 * Update investment balances with contributions and growth
 * Returns { newState, totalContributed }
 */
function updateInvestments(state, cashflow, yearIndex) {
    const newState = { ...state };
    let totalContributed = 0;

    if (!newState.investments || newState.investments.length === 0) {
        newState.investments = [];
        return { newState, totalContributed: 0 };
    }

    // Calculate total desired contributions from active investments
    const activeInvestments = newState.investments.filter(inv => inv.active !== false);
    const totalDesiredContributions = activeInvestments.reduce((sum, inv) => {
        return sum + ((inv.monthlyContribution || 0) * 12);
    }, 0);

    // Determine how much can actually be contributed (limited by positive cashflow)
    const availableForContributions = Math.max(0, cashflow);
    const contributionRatio = totalDesiredContributions > 0
        ? Math.min(1, availableForContributions / totalDesiredContributions)
        : 0;

    // Update each investment
    newState.investments = newState.investments.map(inv => {
        // Apply annual return
        const returnRate = inv.returnRate || inv.expectedAnnualReturn || 0.07;
        let newValue = inv.value * (1 + returnRate);

        // Add contribution if investment is active
        if (inv.active !== false) {
            const desiredContribution = (inv.monthlyContribution || 0) * 12;
            const actualContribution = desiredContribution * contributionRatio;
            newValue += actualContribution;
            totalContributed += actualContribution;
        }

        return {
            ...inv,
            value: newValue
        };
    });

    return { newState, totalContributed };
}

/**
 * Update debt balances with interest and payments
 */
function updateDebts(state, payments, defaultInterestRate) {
    const newState = { ...state };

    if (!newState.debts || newState.debts.length === 0) {
        newState.debts = [];
        return newState;
    }

    let remainingPayments = payments;

    newState.debts = newState.debts.map(debt => {
        // Apply interest
        const interestRate = debt.interestRate || defaultInterestRate || 0.05;
        let newAmount = debt.amount * (1 + interestRate);

        // Apply payment
        const paymentToApply = Math.min(remainingPayments, newAmount);
        newAmount -= paymentToApply;
        remainingPayments -= paymentToApply;

        return {
            ...debt,
            amount: Math.max(0, newAmount) // Prevent negative debt
        };
    }).filter(debt => debt.amount > 0.01); // Remove paid-off debts

    return newState;
}

/**
 * Calculate total investment value
 */
function calculateTotalInvestments(investments) {
    if (!investments || investments.length === 0) return 0;

    return investments.reduce((total, inv) => total + (inv.value || 0), 0);
}

/**
 * Calculate total debt amount
 */
function calculateTotalDebts(debts) {
    if (!debts || debts.length === 0) return 0;

    return debts.reduce((total, debt) => total + (debt.amount || 0), 0);
}

module.exports = {
    runProjection
};
