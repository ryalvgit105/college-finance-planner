import React from 'react';
import { MONTH_NAMES } from '../constants';
import YearlySummary from './YearlySummary';

const YearlyView = ({ expensesByMonth, totalIncome, onSelectMonth, year }) => {
    return (
        <div className="bg-gradient-to-b from-slate-900 to-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-2xl animate-subtle-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8 text-slate-100 tracking-tight">
                Yearly Outlook <span className="text-slate-400">{year}</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {MONTH_NAMES.map((month, index) => {
                    const totalExpenses = expensesByMonth[index] || 0;
                    const balance = totalIncome - totalExpenses;
                    const balanceColor = balance >= 0 ? 'text-emerald-400' : 'text-rose-400';

                    return (
                        <button
                            key={month}
                            onClick={() => onSelectMonth(index)}
                            className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700/80 hover:border-sky-500/50 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-sky-500/50 card-glow-sky text-left"
                        >
                            <h3 className="font-bold text-lg text-slate-100">{month}</h3>
                            <div className="mt-2 text-sm tabular-nums">
                                <p className="text-slate-400">
                                    Spent: <span className="font-semibold text-slate-200">${totalExpenses.toFixed(2)}</span>
                                </p>
                                <p className={balanceColor}>
                                    Balance: <span className="font-semibold">${balance.toFixed(2)}</span>
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <YearlySummary
                expensesByMonth={expensesByMonth}
                totalIncome={totalIncome}
                year={year}
            />
        </div>
    );
};

export default YearlyView;
