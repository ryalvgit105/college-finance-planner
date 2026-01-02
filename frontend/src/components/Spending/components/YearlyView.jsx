import React, { useMemo } from 'react';
import { MONTH_NAMES } from '../constants';

const YearlyView = ({ expensesByMonth, totalIncome, budgetItems, onSelectMonth, year }) => {

    // Calculate budget for each month specifically
    const monthlyBudgets = useMemo(() => {
        return MONTH_NAMES.map((_, index) => {
            const monthKey = `${year}-${String(index + 1).padStart(2, '0')}`;
            // Sum items that are either global (no month) OR match this month
            const monthlyTotal = budgetItems
                .filter(item => !item.month || item.month === monthKey)
                .reduce((sum, item) => sum + item.amount, 0);
            return monthlyTotal;
        });
    }, [budgetItems, year]);

    const totalAnnualBudget = monthlyBudgets.reduce((sum, val) => sum + val, 0);

    return (
        <div className="bg-gradient-to-b from-slate-900 to-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-2xl animate-subtle-fade-in">
            {/* Yearly Outlook header and summary removed */}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {MONTH_NAMES.map((month, index) => {
                    const totalExpenses = expensesByMonth[index] || 0;
                    const currentMonthlyBudget = monthlyBudgets[index];

                    const isOverBudget = totalExpenses > currentMonthlyBudget && currentMonthlyBudget > 0;
                    const statusColor = isOverBudget ? 'border-rose-500/50' : 'border-slate-700/80';

                    return (
                        <button
                            key={month}
                            onClick={() => onSelectMonth(index)}
                            className={`bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border ${statusColor} hover:border-sky-500/50 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-sky-500/50 card-glow-sky text-left`}
                        >
                            <h3 className="font-bold text-lg text-slate-100">{month}</h3>
                            <div className="mt-2 text-sm tabular-nums">
                                <p className="text-slate-400">
                                    Spent: <span className={`font-semibold ${isOverBudget ? 'text-rose-400' : 'text-slate-200'}`}>${totalExpenses.toFixed(2)}</span>
                                </p>
                                <p className="text-slate-400">
                                    Budget: <span className="font-semibold text-slate-200">${currentMonthlyBudget.toFixed(2)}</span>
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>


        </div>
    );
};

export default YearlyView;
