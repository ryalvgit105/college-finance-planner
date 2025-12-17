/**
 * @typedef {'houseHack' | 'fullRental'} Strategy
 */

/**
 * @typedef {'occupied' | 'vacant' | 'ownerOccupied'} OccupancyStatus
 */

/**
 * @typedef {Object} Unit
 * @property {string} id
 * @property {string} name
 * @property {number} rent
 * @property {number} rentFullRental
 * @property {OccupancyStatus} occupancy
 * @property {number} maintenance
 * @property {number} repairs
 * @property {number} vacancy
 */

/**
 * @typedef {Object} ExpenseItem
 * @property {string} id
 * @property {string} name
 * @property {number} amount
 */

/**
 * @typedef {Object} Property
 * @property {string} id
 * @property {string} address
 * @property {Strategy} strategy
 * @property {Unit[]} units
 * @property {number} mortgagePI
 * @property {number} propertyTaxes
 * @property {number} propertyInsurance
 * @property {ExpenseItem[]} opexHouseHackItems
 * @property {ExpenseItem[]} opexFullRentalItems
 */

/**
 * @typedef {Object} Settings
 * @property {number} personalMonthlySavings
 * @property {number} savingsTarget
 * @property {number} currentSavings
 * @property {number} grossRentMultiplier
 * @property {number} annualAppreciationRate
 */

/**
 * @typedef {Object} CashFlowByProperty
 * @property {string} name
 * @property {number} cashFlow
 */

/**
 * @typedef {Object} FinancialData
 * @property {Property[]} properties
 * @property {number} totalMonthlyCashFlow
 * @property {number} totalPortfolioValue
 * @property {CashFlowByProperty[]} cashFlowByProperty
 * @property {number} totalMonthlyIncome
 * @property {number} totalMonthlyExpenses
 * @property {number} portfolioOccupancy
 * @property {function(Property): void} addProperty
 * @property {function(string): void} deleteProperty
 * @property {function(Property): void} updateProperty
 */

/**
 * @typedef {Object} IncomeBreakdown
 * @property {string} name
 * @property {number} amount
 */

/**
 * @typedef {Object} ExpenseBreakdown
 * @property {string} name
 * @property {number} piti
 * @property {number} opex
 * @property {number} unitCosts
 * @property {number} total
 */

/**
 * @typedef {Object} TimelineMonth
 * @property {number} month
 * @property {number} start
 * @property {number} end
 * @property {number} incomeTotal
 * @property {number} expensesTotal
 * @property {number} personalSavings
 * @property {IncomeBreakdown[]} incomeBreakdown
 * @property {ExpenseBreakdown[]} expenseBreakdown
 */

export { };
