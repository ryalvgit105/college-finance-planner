import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    INITIAL_EXPENSES,
    INITIAL_BUDGET_ITEMS,
    INITIAL_INCOME_ITEMS
} from '../components/Spending/constants';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
    const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
    const [budgetItems, setBudgetItems] = useState(INITIAL_BUDGET_ITEMS);
    const [incomeItems, setIncomeItems] = useState(INITIAL_INCOME_ITEMS);

    const addExpense = useCallback((newExpense) => {
        setExpenses(prev => [...prev, { ...newExpense, id: Date.now().toString() }]);
    }, []);

    const deleteExpense = useCallback((expenseId) => {
        setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    }, []);

    const addBudgetItem = useCallback((newItem) => {
        setBudgetItems(prev => [...prev, { ...newItem, id: Date.now().toString() }]);
    }, []);

    const deleteBudgetItem = useCallback((itemId) => {
        setBudgetItems(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const addIncomeItem = useCallback((newItem) => {
        setIncomeItems(prev => [...prev, { ...newItem, id: Date.now().toString() }]);
    }, []);

    const deleteIncomeItem = useCallback((itemId) => {
        setIncomeItems(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const value = {
        expenses,
        budgetItems,
        incomeItems,
        addExpense,
        deleteExpense,
        addBudgetItem,
        deleteBudgetItem,
        addIncomeItem,
        deleteIncomeItem
    };

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    );
};
