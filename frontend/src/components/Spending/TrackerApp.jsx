import React, { useState, useMemo, useCallback } from 'react';
import YearlyView from './components/YearlyView';
import MonthlyView from './components/MonthlyView';
import DayModal from './components/DayModal';
import { MONTH_NAMES } from './constants';

const TrackerApp = ({ expenses, incomeItems, budgetItems, onAddExpense, onDeleteExpense }) => {
    const [currentView, setCurrentView] = useState('yearly');
    const [currentDate, setCurrentDate] = useState(new Date('2025-01-01T00:00:00'));
    const [selectedDay, setSelectedDay] = useState(null);

    const totalIncome = useMemo(() => incomeItems.reduce((sum, item) => sum + item.amount, 0), [incomeItems]);

    const budgetTotals = useMemo(() => {
        return budgetItems.reduce((acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + item.amount;
            return acc;
        }, {});
    }, [budgetItems]);

    const handleYearChange = useCallback((direction) => {
        setCurrentDate(prevDate => {
            const newYear = direction === 'next' ? prevDate.getFullYear() + 1 : prevDate.getFullYear() - 1;
            return new Date(newYear, prevDate.getMonth(), 1);
        });
    }, []);

    const handleSelectMonth = useCallback((monthIndex) => {
        setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
        setCurrentView('monthly');
    }, [currentDate]);

    const handleNavigateMonth = useCallback((direction) => {
        setCurrentDate(prevDate => {
            const newMonth = direction === 'next' ? prevDate.getMonth() + 1 : prevDate.getMonth() - 1;
            return new Date(prevDate.getFullYear(), newMonth, 1);
        });
    }, []);

    const handleSelectDay = useCallback((day) => {
        setSelectedDay(day);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedDay(null);
    }, []);

    const handleBackToYearly = useCallback(() => {
        setCurrentView('yearly');
    }, []);

    const expensesByYear = useMemo(() => {
        const yearlyData = {};
        const currentYear = currentDate.getFullYear();
        MONTH_NAMES.forEach((_, index) => {
            yearlyData[index] = 0;
        });
        expenses.forEach(expense => {
            const expenseDate = new Date(expense.date + 'T00:00:00');
            if (expenseDate.getFullYear() === currentYear) {
                const month = expenseDate.getMonth();
                yearlyData[month] += expense.amount;
            }
        });
        return yearlyData;
    }, [expenses, currentDate]);

    const expensesForSelectedDay = useMemo(() => {
        if (!selectedDay) return [];
        const selectedDateString = selectedDay.toISOString().split('T')[0];
        return expenses.filter(exp => exp.date === selectedDateString);
    }, [selectedDay, expenses]);

    const monthlySpentTotals = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const monthlyExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date + 'T00:00:00');
            return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
        });

        return monthlyExpenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});
    }, [currentDate, expenses]);

    return (
        <>
            {currentView === 'yearly' && (
                <div className="flex justify-center items-center gap-4 mb-8">
                    <button
                        onClick={() => handleYearChange('prev')}
                        className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 border border-slate-700 transition-all text-xl font-bold button-glow-sky"
                        aria-label="Previous year"
                    >
                        &lt;
                    </button>
                    <h2 className="text-3xl font-bold text-slate-100 w-32 text-center tabular-nums">{currentDate.getFullYear()}</h2>
                    <button
                        onClick={() => handleYearChange('next')}
                        className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 border border-slate-700 transition-all text-xl font-bold button-glow-sky"
                        aria-label="Next year"
                    >
                        &gt;
                    </button>
                </div>
            )}

            <main className="max-w-7xl mx-auto">
                {currentView === 'yearly' && (
                    <YearlyView
                        expensesByMonth={expensesByYear}
                        totalIncome={totalIncome}
                        budgetItems={budgetItems}
                        onSelectMonth={handleSelectMonth}
                        year={currentDate.getFullYear()}
                    />
                )}

                {currentView === 'monthly' && (
                    <MonthlyView
                        currentDate={currentDate}
                        expenses={expenses}
                        budgetTotals={budgetTotals}
                        spentTotals={monthlySpentTotals}
                        totalIncome={totalIncome}
                        onSelectDay={handleSelectDay}
                        onNavigateMonth={handleNavigateMonth}
                        onBackToYearly={handleBackToYearly}
                    />
                )}

                {selectedDay && (
                    <DayModal
                        date={selectedDay}
                        expenses={expensesForSelectedDay}
                        onClose={handleCloseModal}
                        onAddExpense={onAddExpense}
                        onDeleteExpense={onDeleteExpense}
                    />
                )}
            </main>
        </>
    );
};

export default TrackerApp;
