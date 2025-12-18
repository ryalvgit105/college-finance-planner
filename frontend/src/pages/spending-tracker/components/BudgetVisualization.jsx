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


const BudgetVisualization = ({ budgetTotals, spentTotals }) => {
    return (
        <div className="bg-slate-900/50 rounded-2xl p-6 shadow-lg border border-slate-800 backdrop-blur-sm mb-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-100 tracking-tight">
                Spending vs. Budget
            </h2>
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
