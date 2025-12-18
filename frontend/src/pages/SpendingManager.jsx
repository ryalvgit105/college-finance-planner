import React, { useState, useMemo, useCallback } from 'react';
import YearlyView from './spending-tracker/components/YearlyView';
import MonthlyView from './spending-tracker/components/MonthlyView';
import DayModal from './spending-tracker/components/DayModal';
import { INITIAL_EXPENSES, MONTH_NAMES, INITIAL_BUDGET_ITEMS, INITIAL_INCOME_ITEMS } from './spending-tracker/constants';

const SpendingManager = () => {
    const [currentView, setCurrentView] = useState('yearly');
    const [currentDate, setCurrentDate] = useState(new Date('2025-01-01T00:00:00'));
    const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
    const [budgetItems, setBudgetItems] = useState(INITIAL_BUDGET_ITEMS);
    const [selectedDay, setSelectedDay] = useState(null);
    const [incomeItems, setIncomeItems] = useState(INITIAL_INCOME_ITEMS);
    const [isBudgetEditing, setIsBudgetEditing] = useState(false);

    const totalIncome = useMemo(() => incomeItems.reduce((sum, item) => sum + item.amount, 0), [incomeItems]);

    const toggleBudgetEditing = useCallback(() => {
        setIsBudgetEditing(prev => !prev);
    }, []);

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

    const handleAddExpense = useCallback((newExpense) => {
        setExpenses(prev => [...prev, { ...newExpense, id: Date.now().toString() }]);
    }, []);

    const handleDeleteExpense = useCallback((expenseId) => {
        setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    }, []);

    const handleAddBudgetItem = useCallback((newItem) => {
        setBudgetItems(prev => [...prev, { ...newItem, id: `b-${Date.now()}` }]);
    }, []);

    const handleDeleteBudgetItem = useCallback((itemId) => {
        setBudgetItems(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const handleAddIncomeItem = useCallback((newItem) => {
        setIncomeItems(prev => [...prev, { ...newItem, id: `i-${Date.now()}` }]);
    }, []);

    const handleDeleteIncomeItem = useCallback((itemId) => {
        setIncomeItems(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const handleBackToYearly = useCallback(() => {
        setCurrentView('yearly');
        setIsBudgetEditing(false); // Exit editing mode when leaving monthly view
    }, []);

    const expensesByYear = useMemo(() => {
        const yearlyData = {};
        const currentYear = currentDate.getFullYear();
        MONTH_NAMES.forEach((_, index) => {
            yearlyData[index] = 0;
        });
        expenses.forEach(expense => {
            // Ensure date string is parsed correctly across timezones by treating it as UTC
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

    return (
        <div className="min-h-screen p-4 md:p-8 font-inter bg-[#0C0C0D] overflow-auto">
            <header className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-violet-400">
                    Spending/ Budget Tracker
                </h1>
                <p className="text-slate-400 mt-2 text-lg">Your visual guide to financial clarity.</p>
            </header>

            <style>{`
        :root {
            --glow-color-sky: rgba(56, 189, 248, 0.5);
            --glow-color-emerald: rgba(16, 185, 129, 0.5);
            --glow-color-rose: rgba(244, 63, 94, 0.5);
        }
        .card-glow-sky:hover {
            box-shadow: 0 0 20px var(--glow-color-sky);
        }
        .card-glow-emerald:hover {
            box-shadow: 0 0 15px var(--glow-color-emerald);
        }
        .button-glow-sky:hover {
            box-shadow: 0 0 15px var(--glow-color-sky);
        }
        .tabular-nums {
            font-variant-numeric: tabular-nums;
        }
        @keyframes subtle-fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-subtle-fade-in {
            animation: subtle-fade-in 0.5s ease-out forwards;
        }
      `}</style>

            {currentView === 'yearly' && (
                <div className="flex justify-center items-center gap-4 mb-8">
                    <button
                        onClick={() => handleYearChange('prev')}
                        className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 border border-slate-700 transition-all text-xl font-bold button-glow-sky text-white"
                        aria-label="Previous year"
                    >
                        &lt;
                    </button>
                    <h2 className="text-3xl font-bold text-slate-100 w-32 text-center tabular-nums">{currentDate.getFullYear()}</h2>
                    <button
                        onClick={() => handleYearChange('next')}
                        className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 border border-slate-700 transition-all text-xl font-bold button-glow-sky text-white"
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
                        onSelectMonth={handleSelectMonth}
                        year={currentDate.getFullYear()}
                    />
                )}

                {currentView === 'monthly' && (
                    <MonthlyView
                        currentDate={currentDate}
                        expenses={expenses}
                        budgetItems={budgetItems}
                        incomeItems={incomeItems}
                        totalIncome={totalIncome}
                        onSelectDay={handleSelectDay}
                        onNavigateMonth={handleNavigateMonth}
                        onBackToYearly={handleBackToYearly}
                        onAddBudgetItem={handleAddBudgetItem}
                        onDeleteBudgetItem={handleDeleteBudgetItem}
                        onAddIncomeItem={handleAddIncomeItem}
                        onDeleteIncomeItem={handleDeleteIncomeItem}
                        isBudgetEditing={isBudgetEditing}
                        toggleBudgetEditing={toggleBudgetEditing}
                    />
                )}

                {selectedDay && (
                    <DayModal
                        date={selectedDay}
                        expenses={expensesForSelectedDay}
                        onClose={handleCloseModal}
                        onAddExpense={handleAddExpense}
                        onDeleteExpense={handleDeleteExpense}
                    />
                )}
            </main>
        </div>
    );
};

export default SpendingManager;
