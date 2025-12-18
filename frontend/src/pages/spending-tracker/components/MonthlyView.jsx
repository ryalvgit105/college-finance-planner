import React, { useMemo, useState } from 'react';
import { BudgetCategory } from '../types';
import { MONTH_NAMES, DAY_NAMES, BUDGET_CATEGORIES, INCOME_DETAILS } from '../constants';
import BudgetSection from './BudgetSection';
import BudgetVisualization from './BudgetVisualization';
import IncomeSection from './IncomeSection';
import SpendingSummary from './SpendingSummary';

const getCategoryColor = (category) => {
    const chipStyle = BUDGET_CATEGORIES[category]?.chip || 'bg-slate-500/20 text-slate-300';
    const bgColorClass = chipStyle.split(' ')[0]; // e.g., "bg-indigo-500/20"
    return bgColorClass.split('/')[0]; // e.g., "bg-indigo-500"
};

const MonthlyView = ({
    currentDate,
    expenses,
    budgetItems,
    incomeItems,
    totalIncome,
    onSelectDay,
    onNavigateMonth,
    onBackToYearly,
    onAddBudgetItem,
    onDeleteBudgetItem,
    onAddIncomeItem,
    onDeleteIncomeItem,
    isBudgetEditing,
    toggleBudgetEditing,
}) => {
    const [expandedWeekIndex, setExpandedWeekIndex] = useState(null);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const handleWeekToggle = (index) => {
        setExpandedWeekIndex(prev => (prev === index ? null : index));
    };

    const monthlyExpenses = useMemo(() => {
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date + 'T00:00:00');
            return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
        });
    }, [expenses, year, month]);

    const spentTotals = useMemo(() => {
        const totals = {};
        for (const expense of monthlyExpenses) {
            totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
        }
        return totals;
    }, [monthlyExpenses]);

    const { calendarDays, weeklyTotals, monthTotal: totalActualExpenses } = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];

        // Previous month's padding
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push({ date: null, total: 0, dailyExpenses: [] });
        }
        // Current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const dailyExpenses = expenses.filter(e => e.date === dateString);
            const total = dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
            days.push({ date, total, dailyExpenses });
        }

        const weeklyTotals = [];
        for (let i = 0; i < days.length; i += 7) {
            const week = days.slice(i, i + 7);
            const weekTotal = week.reduce((sum, day) => sum + day.total, 0);
            weeklyTotals.push(weekTotal);
        }

        const monthTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        return { calendarDays: days, weeklyTotals, monthTotal };
    }, [year, month, expenses, monthlyExpenses]);

    const budgetTotals = useMemo(() => {
        const totals = {
            [BudgetCategory.DebtPayoff]: 0,
            [BudgetCategory.Savings]: 0,
            [BudgetCategory.Giving]: 0,
            [BudgetCategory.Fixed]: 0,
            [BudgetCategory.FunMoney]: 0,
        };
        budgetItems.forEach(item => {
            if (totals[item.category] !== undefined) {
                totals[item.category] += item.amount;
            }
        });
        return totals;
    }, [budgetItems]);

    return (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl shadow-2xl border border-slate-800 p-4 md:p-6 animate-subtle-fade-in">
            <div className="flex justify-between items-center mb-6">
                <button onClick={onBackToYearly} className="text-sky-400 hover:text-sky-300 transition text-sm font-semibold">&larr; Back to Yearly</button>
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigateMonth('prev')} className="px-3 py-1 bg-slate-800 rounded-md hover:bg-slate-700 border border-slate-700 transition">&lt;</button>
                    <h2 className="text-2xl font-bold text-center text-slate-100 w-48">
                        {MONTH_NAMES[month]} {year}
                    </h2>
                    <button onClick={() => onNavigateMonth('next')} className="px-3 py-1 bg-slate-800 rounded-md hover:bg-slate-700 border border-slate-700 transition">&gt;</button>
                </div>
                <div className="w-36"></div>
            </div>

            {/* Budget Section */}
            <div className="mb-8">
                <div className="flex justify-center items-center gap-4 mb-6">
                    <h2 className="text-3xl font-bold text-slate-100 tracking-tight">Monthly Budget Plan</h2>
                    <button
                        onClick={toggleBudgetEditing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 border ${isBudgetEditing
                                ? 'bg-emerald-600/90 hover:bg-emerald-600 border-emerald-500 text-white card-glow-emerald'
                                : 'bg-sky-600/90 hover:bg-sky-600 border-sky-500 text-white button-glow-sky'
                            }`}
                    >
                        <span>{isBudgetEditing ? 'Set Budget' : 'Edit Budget'}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isBudgetEditing ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isBudgetEditing ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                        <IncomeSection
                            title={INCOME_DETAILS.title}
                            description={INCOME_DETAILS.description}
                            items={incomeItems}
                            onAddItem={onAddIncomeItem}
                            onDeleteItem={onDeleteIncomeItem}
                            isEditing={isBudgetEditing}
                        />
                        {Object.entries(BUDGET_CATEGORIES).map(([key, value]) => (
                            <BudgetSection
                                key={key}
                                category={key}
                                title={key}
                                description={value.description}
                                items={budgetItems.filter(item => item.category === key)}
                                onAddItem={onAddBudgetItem}
                                onDeleteItem={onDeleteBudgetItem}
                                isEditing={isBudgetEditing}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <BudgetVisualization
                budgetTotals={budgetTotals}
                spentTotals={spentTotals}
            />

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
                                        <span className="font-bold text-slate-400 self-end">{day.date.getDate()}</span>

                                        {day.total > 0 && (
                                            <div className="flex-grow space-y-1 overflow-y-auto pr-1 custom-scrollbar-thin mt-1">
                                                {day.dailyExpenses.map(exp => (
                                                    <div
                                                        key={exp.id}
                                                        className={`${getCategoryColor(exp.category)}/80 w-full h-1.5 rounded-full`}
                                                        title={`${exp.description}: $${exp.amount.toFixed(2)}`}
                                                    >
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {day.total > 0 && (
                                            <span className={`mt-auto text-sm font-bold text-right self-end tabular-nums ${day.total > 100 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                ${day.total.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Sidebar */}
                <div className="lg:w-72 flex-shrink-0 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <h3 className="text-xl font-bold mb-4 text-slate-100">Weekly Summary</h3>
                    <div className="space-y-2">
                        {weeklyTotals.map((total, i) => {
                            const weekSlice = calendarDays.slice(i * 7, i * 7 + 7);
                            const firstDay = weekSlice.find(d => d.date);
                            const lastDay = [...weekSlice].reverse().find(d => d.date);

                            if (!firstDay || !lastDay) {
                                return null;
                            }

                            const weekStartDate = firstDay.date.getDate();
                            const weekEndDate = lastDay.date.getDate();
                            const monthShort = MONTH_NAMES[month].substring(0, 3);
                            const isExpanded = expandedWeekIndex === i;
                            const weekExpenses = weekSlice.flatMap(day => day.dailyExpenses);

                            return (
                                <div key={i}>
                                    <button
                                        onClick={() => handleWeekToggle(i)}
                                        className="flex justify-between items-center w-full bg-slate-800/70 p-2 rounded-md hover:bg-slate-800 transition border border-transparent hover:border-slate-700"
                                        aria-expanded={isExpanded}
                                        aria-controls={`week-details-${i}`}
                                    >
                                        <span className="text-sm font-medium text-slate-400">{monthShort} {weekStartDate}-{weekEndDate}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-200 tabular-nums">${total.toFixed(2)}</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </button>
                                    {isExpanded && (
                                        <div id={`week-details-${i}`} className="bg-slate-800/30 rounded-b-md p-3 mt-0 border-x border-b border-slate-700/50 animate-slide-down overflow-hidden">
                                            {weekExpenses.length > 0 ? (
                                                <>
                                                    <div className="space-y-2">
                                                        {weekExpenses.map(exp => (
                                                            <div key={exp.id} className="flex items-center justify-between text-xs">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-base">{BUDGET_CATEGORIES[exp.category]?.emoji}</span>
                                                                    <div>
                                                                        <p className="font-semibold text-slate-300 truncate max-w-[120px]" title={exp.description}>{exp.description}</p>
                                                                        <p className="text-slate-400">{new Date(exp.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}</p>
                                                                    </div>
                                                                </div>
                                                                <p className="font-bold text-slate-200 tabular-nums">${exp.amount.toFixed(2)}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-slate-700">
                                                        <div className="flex justify-between font-semibold text-sm">
                                                            <span className="text-slate-300">Week Total:</span>
                                                            <span className="text-rose-400 tabular-nums">${total.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-center text-slate-500 text-xs py-2">No expenses this week.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <SpendingSummary
                budgetTotals={budgetTotals}
                spentTotals={spentTotals}
                totalIncome={totalIncome}
                totalSpent={totalActualExpenses}
            />

            <style>{`
        .custom-scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #475569; }
        .animate-slide-down { animation: slideDown 0.3s ease-in-out; }
        @keyframes slideDown { 
            from { opacity: 0; transform: translateY(-10px); max-height: 0; } 
            to { opacity: 1; transform: translateY(0); max-height: 500px; } 
        }
      `}</style>
        </div>
    );
};

export default MonthlyView;
