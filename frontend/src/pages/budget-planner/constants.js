import { Category } from './types';

export const CATEGORY_CONFIG = {
    [Category.DEBT_PAYOFF]: {
        color: 'border-indigo-500',
        description: "Extra payments towards loans, credit cards, or other outstanding debts."
    },
    [Category.SAVINGS_INVESTMENTS]: {
        color: 'border-cyan-500',
        description: "Money set aside for future goals like retirement, a down payment, or other large purchases."
    },
    [Category.GIVING_DONATIONS]: {
        color: 'border-purple-500',
        description: "Contributions to charities, religious organizations, or causes you support."
    },
    [Category.FIXED_EXPENSES]: {
        color: 'border-slate-500',
        description: "Consistent, recurring expenses like rent/mortgage, utilities, and subscriptions."
    },
    [Category.VARIABLE_EXPENSES]: {
        color: 'border-sky-500',
        description: "Expenses that fluctuate month-to-month, such as groceries, gas, and shopping."
    },
    [Category.FUN_MONEY]: {
        color: 'border-pink-500',
        description: "Discretionary spending for entertainment, hobbies, and dining out."
    },
};
