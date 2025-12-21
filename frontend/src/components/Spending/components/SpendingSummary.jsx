import React from 'react';
import { BUDGET_CATEGORIES } from '../constants';

const SpendingSummary = ({
    budgetTotals,
    spentTotals,
    totalIncome,
    totalSpent,
}) => {
    const chartData = Object.entries(spentTotals)
        .filter(([, value]) => Number(value || 0) > 0)
        .map(([key, value]) => {
            const category = key;
            const colorClass = BUDGET_CATEGORIES[category].chip.split(' ')[0].split('/')[0]; // e.g., bg-sky-500
            return {
                category,
                value: Number(value || 0),
                color: colorClass,
            };
        })
        .sort((a, b) => b.value - a.value); // Sort for consistent bar order

    const netCashFlow = totalIncome - totalSpent;
    // FIX: Operator '+' cannot be applied to types 'unknown' and 'number'. Explicitly cast 'item' to a number to prevent type errors.
    const totalBudgeted = Object.values(budgetTotals).reduce((sum, item) => sum + Number(item || 0), 0);

    return (
        <div className="mt-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-2xl font-bold mb-6 text-slate-100 text-center tracking-tight">Monthly Financial Summary</h3>

            <div className="max-w-2xl mx-auto">
                {/* Stacked Progress Bar */}
                <div title={`Total Spent: $${totalSpent.toFixed(2)}`} className="w-full bg-slate-800 rounded-full h-4 flex overflow-hidden my-4 border border-slate-700 shadow-inner">
                    {chartData.map(({ category, value, color }) => {
                        const percentage = totalSpent > 0 ? (value / totalSpent) * 100 : 0;
                        return (
                            <div
                                key={category}
                                className={`${color} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                                title={`${category}: $${value.toFixed(2)} (${percentage.toFixed(1)}%)`}
                            />
                        );
                    })}
                </div>

                {/* Breakdown List / Legend */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {Object.entries(BUDGET_CATEGORIES).map(([key, details]) => {
                        const category = key;
                        const spent = spentTotals[category] || 0;
                        const budgeted = budgetTotals[category] || 0;

                        if (spent === 0 && budgeted === 0) return null;

                        const colorDotClass = details.chip.split(' ')[0].split('/')[0];

                        return (
                            <div key={category} className="flex justify-between items-center p-2 bg-slate-800/50 rounded-md border border-slate-800/80">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full ${colorDotClass}`}></div>
                                    <span className="text-slate-300 font-semibold">{category}</span>
                                </div>
                                <div className="text-right tabular-nums">
                                    <span className="font-bold text-slate-100">${spent.toFixed(2)}</span>
                                    <p className="text-xs text-slate-500">of ${budgeted.toFixed(2)}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t-2 border-slate-800 space-y-3 text-lg max-w-sm mx-auto tabular-nums">
                <div className="flex justify-between font-semibold">
                    <span className="text-slate-200">Total Income:</span>
                    <span className="font-bold text-emerald-400">${totalIncome.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                    <span className="text-slate-200">Total Budgeted:</span>
                    <span className="font-bold text-amber-400">${totalBudgeted.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                    <span className="text-slate-200">Total Spent:</span>
                    <span className="font-bold text-rose-400">${totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-xl mt-3 pt-3 border-t border-sky-500/30">
                    <span className="text-slate-100">Net Cash Flow:</span>
                    {/* FIX: This `toFixed` call is now safe because all upstream calculations produce numbers. */}
                    <span className={netCashFlow >= 0 ? 'text-emerald-300' : 'text-rose-300'}>${netCashFlow.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default SpendingSummary;
