import React, { useState, useMemo, useCallback } from 'react';
import { Category } from './types';
import CategoryCard from './components/CategoryCard';
import SummaryCard from './components/SummaryCard';
import { CATEGORY_CONFIG } from './constants';
import { v4 as uuidv4 } from 'uuid';

const initialItems = {
    [Category.SAVINGS_INVESTMENTS]: [
        { id: 'si1', name: 'Charles Schwab - Mortgage', amount: 500 },
    ],
    [Category.DEBT_PAYOFF]: [],
    [Category.GIVING_DONATIONS]: [
        { id: 'gd1', name: 'Church', amount: 80 },
    ],
    [Category.FIXED_EXPENSES]: [
        { id: 'fe1', name: 'Apple Storage - Fidel.Cre', amount: 10 },
    ],
    [Category.VARIABLE_EXPENSES]: [],
    [Category.FUN_MONEY]: [],
};


function BudgetPlanner() {
    const [income, setIncome] = useState(2500);
    const [items, setItems] = useState(initialItems);

    const handleIncomeChange = (e) => {
        const value = parseFloat(e.target.value);
        setIncome(isNaN(value) ? 0 : value);
    };

    const handleAddItem = useCallback((category) => {
        setItems(prevItems => ({
            ...prevItems,
            [category]: [
                ...prevItems[category],
                { id: uuidv4(), name: '', amount: 0 }
            ]
        }));
    }, []);

    const handleRemoveItem = useCallback((category, id) => {
        setItems(prevItems => ({
            ...prevItems,
            [category]: prevItems[category].filter(item => item.id !== id)
        }));
    }, []);

    const handleUpdateItem = useCallback((category, id, updatedItem) => {
        setItems(prevItems => ({
            ...prevItems,
            [category]: prevItems[category].map(item =>
                item.id === id ? { ...item, ...updatedItem } : item
            )
        }));
    }, []);

    const categoryTotals = useMemo(() => {
        return Object.entries(items).reduce((acc, [category, categoryItems]) => {
            const total = categoryItems.reduce((sum, item) => sum + item.amount, 0);
            return { ...acc, [category]: total };
        }, {});
    }, [items]);

    const totalExpenses = useMemo(() => {
        return Object.values(categoryTotals).reduce((sum, total) => sum + total, 0);
    }, [categoryTotals]);

    const cashFlow = useMemo(() => income - totalExpenses, [income, totalExpenses]);

    return (
        <div className="bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8 h-full">
            <div className="max-w-7xl mx-auto">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">Financial Spending Plan</h1>
                    <p className="text-lg text-gray-500 mt-2">A clear path to your financial goals starts here.</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {Object.values(Category).map((category) => (
                            <CategoryCard
                                key={category}
                                category={category}
                                items={items[category]}
                                config={CATEGORY_CONFIG[category]}
                                onAddItem={() => handleAddItem(category)}
                                onRemoveItem={(id) => handleRemoveItem(category, id)}
                                onUpdateItem={(id, updatedItem) => handleUpdateItem(category, id, updatedItem)}
                            />
                        ))}
                    </div>

                    <div className="lg:col-span-1 mt-6 lg:mt-0">
                        <div className="sticky top-8 space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <h2 className="text-lg font-semibold mb-3 text-gray-600">Monthly Income</h2>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 text-lg">$</span>
                                    <input
                                        type="number"
                                        value={income}
                                        onChange={handleIncomeChange}
                                        className="w-full pl-8 pr-4 py-2.5 text-2xl font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                                        placeholder="2500"
                                    />
                                </div>
                            </div>
                            <SummaryCard
                                categoryTotals={categoryTotals}
                                totalExpenses={totalExpenses}
                                cashFlow={cashFlow}
                                income={income}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default BudgetPlanner;
