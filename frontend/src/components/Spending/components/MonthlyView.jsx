import React, { useMemo } from 'react';
import { MONTH_NAMES, DAY_NAMES } from '../constants';
import BudgetVisualization from './BudgetVisualization';
import SpendingSummary from './SpendingSummary';

const MonthlyView = ({
    currentDate,
    expenses,
    budgetTotals,
    spentTotals,
    totalIncome,
    onSelectDay,
    onNavigateMonth,
    onBackToYearly,
    onEditBudget
}) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const { calendarDays, totalSpent } = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let totalMonthlySpending = 0;
        const days = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push({ date: null, total: 0 });
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const dailyExpenses = expenses.filter(e => e.date === dateString);
            const total = dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
            totalMonthlySpending += total;
            days.push({ date, total });
        }

        return { calendarDays: days, totalSpent: totalMonthlySpending };
    }, [year, month, expenses]);

    return (
        <div className="animate-subtle-fade-in">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl shadow-2xl border border-slate-800 p-4 md:p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onEditBudget}
                            className="bg-slate-800/80 hover:bg-slate-700 text-sky-400 font-semibold py-2 px-4 rounded-lg border border-slate-700 transition flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Edit Budget
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => onNavigateMonth('prev')} className="px-3 py-1 bg-slate-800 rounded-md hover:bg-slate-700 border border-slate-700 transition">&lt;</button>
                        <h2 className="text-2xl font-bold text-center text-slate-100 w-48">
                            {MONTH_NAMES[month]} {year}
                        </h2>
                        <button onClick={() => onNavigateMonth('next')} className="px-3 py-1 bg-slate-800 rounded-md hover:bg-slate-700 border border-slate-700 transition">&gt;</button>
                    </div>
                    <div className="w-36"></div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Calendar Grid */}
                    <div className="flex-grow">
                        <p className="text-center text-slate-400 mb-4 text-sm font-semibold tracking-wider">🗓️ CALENDAR VIEW</p>
                        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-slate-500 mb-2">
                            {DAY_NAMES.map(day => <div key={day}>{day}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1.5">
                            {calendarDays.map((day, index) => (
                                <div
                                    key={index}
                                    className={`h-28 md:h-32 rounded-lg transition-all duration-200 ${day.date ? 'bg-slate-900/70 border border-slate-800 cursor-pointer hover:bg-slate-800/80 hover:border-sky-500/60' : 'bg-slate-900/30'
                                        }`}
                                    onClick={() => day.date && onSelectDay(day.date)}
                                >
                                    {day.date && (
                                        <div className="p-2 flex flex-col h-full">
                                            <span className="font-bold text-slate-400 self-start">{day.date.getDate()}</span>
                                            <div className="flex-grow flex items-end justify-center">
                                                {day.total > 0 && (
                                                    <span className={`pb-1 text-sm font-bold tabular-nums ${day.total > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                        ${day.total.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Budget Visualization Sidebar */}
                    <div className="lg:w-80 flex-shrink-0">
                        <p className="text-center text-slate-400 mb-4 text-sm font-semibold tracking-wider">📊 BUDGET VS. SPENDING</p>
                        <BudgetVisualization
                            budgetTotals={budgetTotals}
                            spentTotals={spentTotals}
                        />
                    </div>
                </div>
            </div>

            <SpendingSummary
                budgetTotals={budgetTotals}
                spentTotals={spentTotals}
                totalIncome={totalIncome}
                totalSpent={totalSpent}
            />
        </div>
    );
};

export default MonthlyView;
