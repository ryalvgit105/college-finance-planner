import { BudgetCategory } from './types';

export const BUDGET_CATEGORIES = {
    [BudgetCategory.DebtPayoff]: {
        description: 'Extra payments towards loans, credit cards, or other outstanding debts.',
        emoji: '💳',
        chip: 'bg-indigo-500/20 text-indigo-300',
    },
    [BudgetCategory.Savings]: {
        description: 'Money set aside for future goals like retirement, a down payment, or other large purchases.',
        emoji: '💰',
        chip: 'bg-emerald-500/20 text-emerald-300',
    },
    [BudgetCategory.Giving]: {
        description: 'Contributions to charities, religious organizations, or causes you support.',
        emoji: '❤️',
        chip: 'bg-rose-500/20 text-rose-300',
    },
    [BudgetCategory.Fixed]: {
        description: 'Consistent, recurring expenses like rent/mortgage, utilities, and subscriptions.',
        emoji: '🧾',
        chip: 'bg-amber-500/20 text-amber-300',
    },
    [BudgetCategory.FunMoney]: {
        description: 'Discretionary spending for entertainment, hobbies, and dining out.',
        emoji: '🎉',
        chip: 'bg-sky-500/20 text-sky-300',
    },
};

export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export const INCOME_DETAILS = {
    title: 'Income',
    description: 'Your monthly take-home pay from all sources.',
};

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const INITIAL_INCOME_ITEMS = [
    { id: 'i1', description: 'Fixed Income (Salary)', amount: 2500 },
];

export const INITIAL_BUDGET_ITEMS = [
    { id: 'b1', category: BudgetCategory.Savings, description: 'Charles Schwab - Mortgage', amount: 500 },
    { id: 'b2', category: BudgetCategory.Giving, description: 'Church', amount: 80 },
    { id: 'b3', category: BudgetCategory.Fixed, description: 'Apple Storage - Fidel.Cre', amount: 10 },
];

export const INITIAL_EXPENSES = [
    // December 2025
    { id: '1', date: '2025-12-01', description: 'Groceries', category: BudgetCategory.FunMoney, amount: 85.50 },
    { id: '2', date: '2025-12-03', description: 'Gasoline', category: BudgetCategory.FunMoney, amount: 55.00 },
    { id: '3', date: '2025-12-03', description: 'Movie tickets', category: BudgetCategory.FunMoney, amount: 32.00 },
    { id: '4', date: '2025-12-05', description: 'Winter coat', category: BudgetCategory.FunMoney, amount: 150.00 },
    { id: '5', date: '2025-12-05', description: 'Dinner out', category: BudgetCategory.FunMoney, amount: 75.00 },
    { id: '6', date: '2025-12-10', description: 'Internet Bill', category: BudgetCategory.Fixed, amount: 65.00 },
    { id: '7', date: '2025-12-12', description: 'New headphones', category: BudgetCategory.FunMoney, amount: 120.00 },
    { id: '8', date: '2025-12-15', description: 'Coffee', category: BudgetCategory.FunMoney, amount: 5.25 },
    { id: '9', date: '2025-12-18', description: 'Train ticket', category: BudgetCategory.FunMoney, amount: 22.75 },
    { id: '10', date: '2025-12-20', description: 'Holiday gifts', category: BudgetCategory.FunMoney, amount: 250.30 },
    { id: '11', date: '2025-12-22', description: 'Lunch with friends', category: BudgetCategory.FunMoney, amount: 45.00 },
    { id: '12', date: '2025-12-22', description: 'Electricity Bill', category: BudgetCategory.Fixed, amount: 95.00 },
    { id: '13', date: '2025-12-28', description: 'Concert', category: BudgetCategory.FunMoney, amount: 90.00 },
    { id: '14', date: '2025-12-30', description: 'New shoes', category: BudgetCategory.FunMoney, amount: 89.99 },
    // November 2025
    { id: '15', date: '2025-11-05', description: 'Groceries', category: BudgetCategory.FunMoney, amount: 120.10 },
    { id: '16', date: '2025-11-15', description: 'Video Game', category: BudgetCategory.FunMoney, amount: 59.99 },
    { id: '17', date: '2025-11-25', description: 'Thanksgiving Dinner Supplies', category: BudgetCategory.FunMoney, amount: 150.75 },
    // October 2025
    { id: '18', date: '2025-10-10', description: 'Jacket', category: BudgetCategory.FunMoney, amount: 75.00 },
    { id: '19', date: '2025-10-31', description: 'Halloween Party', category: BudgetCategory.FunMoney, amount: 60.00 },
    // 2024 Expenses for demonstration
    { id: '20', date: '2024-12-24', description: 'Christmas Dinner', category: BudgetCategory.FunMoney, amount: 200.00 },
    { id: '21', date: '2024-12-15', description: 'Office Secret Santa', category: BudgetCategory.FunMoney, amount: 25.00 },
    { id: '22', date: '2024-11-10', description: 'New Monitor', category: BudgetCategory.FunMoney, amount: 350.00 },
];
