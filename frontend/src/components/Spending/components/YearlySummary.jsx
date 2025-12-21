import React from 'react';
import { MONTH_NAMES } from '../constants';

const YearlySummary = ({ expensesByMonth, totalIncome, totalAnnualBudget, year }) => {
    // FIX: Operator '+' cannot be applied to types 'unknown' and 'number'. Cast 'spent' to a number to fix this and subsequent arithmetic and 'toFixed' errors.
    const totalAnnualSpending = Object.values(expensesByMonth).reduce((sum, spent) => sum + Number(spent || 0), 0);
    const totalAnnualIncome = totalIncome * 12;
    const annualNetFlow = totalAnnualIncome - totalAnnualSpending;

    const monthsWithSpending = Object.values(expensesByMonth).filter(spent => Number(spent || 0) > 0).length;
    // FIX: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type. This is fixed by ensuring totalAnnualSpending is a number.
    const averageMonthlySpending = monthsWithSpending > 0 ? totalAnnualSpending / monthsWithSpending : 0;

    const maxMonthlySpending = Math.max(...Object.values(expensesByMonth).map(v => Number(v || 0)), 1); // Avoid division by zero, min value 1

    return (
        <div className="mt-10 bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-2xl font-bold mb-6 text-slate-100 text-center tracking-tight">Yearly Financial Summary</h3>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                {/* Visualization */}
                <div className="lg:col-span-3">
                    <h4 className="font-semibold text-lg text-slate-300 mb-4 text-center">Monthly Spending Breakdown</h4>
                    <div className="flex justify-between items-end h-56 bg-slate-950/50 p-4 rounded-xl space-x-2 border border-slate-800">
                        {MONTH_NAMES.map((month, index) => {
                            const spent = expensesByMonth[index] || 0;
                            // FIX: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
                            const barHeight = maxMonthlySpending > 0 ? (Number(spent) / maxMonthlySpending) * 100 : 0;
                            return (
                                <div key={month} className="flex-1 flex flex-col items-center justify-end h-full group" title={`${month}: $${spent.toFixed(2)}`}>
                                    <div
                                        className="w-full bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-md hover:opacity-100 opacity-80 transition-all duration-300"
                                        style={{ height: `${barHeight}%` }}
                                    >
                                    </div>
                                    <span className="text-xs mt-2 text-slate-400 font-medium">{month.substring(0, 3)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Stats */}
                <div className="space-y-4 text-base lg:col-span-2 tabular-nums">
                    <div className="flex justify-between items-center p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
                        <span className="text-slate-300 font-medium">Total Annual Income:</span>
                        <span className="font-bold text-emerald-400">${totalAnnualIncome.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
                        <span className="text-slate-300 font-medium">Total Annual Budgeted:</span>
                        <span className="font-bold text-sky-400">${totalAnnualBudget.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
                        <span className="text-slate-300 font-medium">Total Annual Spending:</span>
                        <span className="font-bold text-rose-400">${totalAnnualSpending.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/60 rounded-lg border border-slate-700/50">
                        <span className="text-slate-300 font-medium">Avg Monthly Spending:</span>
                        <span className="font-bold text-amber-400">${averageMonthlySpending.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-700 to-transparent rounded-lg mt-2 border border-slate-600">
                        <span className="text-slate-100 font-bold text-lg">Annual Net Flow:</span>
                        <span className={`font-bold text-lg ${annualNetFlow >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {/* FIX: Property 'toFixed' does not exist on type 'unknown'. This is fixed by ensuring annualNetFlow is calculated from numbers. */}
                            ${annualNetFlow.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YearlySummary;
