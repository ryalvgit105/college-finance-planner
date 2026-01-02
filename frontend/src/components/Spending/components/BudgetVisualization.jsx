import React from 'react';
import { BUDGET_CATEGORIES } from '../constants';

const ProgressBar = ({ value, max, colorClass }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;

    const progressColor = percentage > 100 ? 'bg-rose-500' : colorClass;
    const glowStyle = percentage > 100 ? { filter: `drop-shadow(0 0 4px var(--glow-color-rose))` } : { filter: `drop-shadow(0 0 4px ${colorClass.replace('bg-', 'var(--glow-color-')})` }

    return (
        <div className="w-full bg-slate-700/50 rounded-full h-2.5 relative overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${Math.min(percentage, 100)}%`, ...glowStyle }}
            />
            {percentage > 100 && (
                <div
                    className="h-full rounded-full bg-rose-500/30 absolute top-0 left-0"
                    style={{ width: `100%` }}
                />
            )}
        </div>
    );
};


const BudgetVisualization = ({ budgetTotals, spentTotals, totalIncome }) => {
    return (
        <div className="bg-slate-900/50 rounded-2xl p-6 shadow-lg border border-slate-800 backdrop-blur-sm mb-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-100 tracking-tight">
                Expenses vs. Budget
            </h2>

            {/* Summary Section */}
            {(() => {
                const totalBudgeted = Object.values(budgetTotals).reduce((a, b) => a + b, 0);
                const totalSpent = Object.values(spentTotals).reduce((a, b) => a + b, 0);
                const remainingIncome = (totalIncome || 0) - totalBudgeted;
                // const remainingCash = (totalIncome || 0) - totalSpent; 

                return (
                    <div className="mb-8 space-y-6">
                        {/* Overall Spending Progress */}
                        <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50 shadow-inner">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <h3 className="text-slate-200 font-bold text-lg">Overall Spending</h3>
                                    <p className="text-xs text-slate-400">Actual Spend vs. Income Capacity</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-2xl font-bold tabular-nums ${totalSpent > totalIncome ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        ${totalSpent.toFixed(2)}
                                    </span>
                                    <span className="text-xs text-slate-500 block">
                                        of ${(totalIncome || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden relative shadow-inner">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out shadow-lg ${totalSpent > totalIncome ? 'bg-gradient-to-r from-rose-600 to-rose-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                                    style={{ width: `${Math.min(((totalSpent / Math.max(totalIncome || 1, 1)) * 100), 100)}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                                <p className="text-xs text-slate-400 mb-1">Total Budgeted</p>
                                <p className="text-xl font-bold text-sky-400 tabular-nums">${totalBudgeted.toFixed(2)}</p>
                                <div className="w-full bg-slate-700/30 rounded-full h-1.5 mt-2 overflow-hidden">
                                    <div className="bg-sky-500 h-full rounded-full" style={{ width: `${Math.min((totalBudgeted / (totalIncome || 1)) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                                <p className="text-xs text-slate-400 mb-1">Remaining Income</p>
                                <p className={`text-xl font-bold tabular-nums ${remainingIncome < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
                                    ${remainingIncome.toFixed(2)}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Unallocated for budget
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })()}
            <div className="space-y-5">
                {Object.keys(BUDGET_CATEGORIES).map(catStr => {
                    const category = catStr;
                    const budgeted = budgetTotals[category] || 0;
                    const spent = spentTotals[category] || 0;
                    const categoryInfo = BUDGET_CATEGORIES[category];

                    const colorClass = categoryInfo.chip.split(' ')[0].split('/')[0];

                    if (budgeted <= 0) {
                        return null;
                    }

                    return (
                        <div key={category}>
                            <div className="flex justify-between items-center mb-1.5 text-sm">
                                <span className="font-bold text-slate-300">{category}</span>
                                <span className="font-semibold text-slate-400 tabular-nums">
                                    ${spent.toFixed(2)} / <span className="text-slate-200">${budgeted.toFixed(2)}</span>
                                </span>
                            </div>
                            <ProgressBar value={spent} max={budgeted} colorClass={colorClass} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BudgetVisualization;
