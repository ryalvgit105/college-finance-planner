import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import {
    INITIAL_EXPENSES,
    INITIAL_BUDGET_ITEMS,
    INITIAL_INCOME_ITEMS
} from '../components/Spending/constants';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
    // Legacy / Spending Data
    const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
    const [budgetItems, setBudgetItems] = useState(INITIAL_BUDGET_ITEMS);
    const [incomeItems, setIncomeItems] = useState(INITIAL_INCOME_ITEMS);

    // Snapshot / Historical Data
    const [snapshotHistory, setSnapshotHistory] = useState([]); // 12-month array
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Helper to get history
    const fetchSnapshotHistory = useCallback(async (type, year = currentYear, profileId) => {
        if (!profileId) return; // Need profileId (can come from AuthContext later)

        setLoading(true);
        try {
            // Need to handle API URL. Assuming proxy or direct.
            const API_URL = 'http://localhost:5000/api';
            const res = await axios.get(`${API_URL}/snapshots/${type}/history`, {
                params: { year, profileId }
            });

            // Transform to 12-element array
            const history = new Array(12).fill(0);
            res.data.forEach(snap => {
                if (snap.month >= 1 && snap.month <= 12) {
                    history[snap.month - 1] = snap.totalValue;
                }
            });
            setSnapshotHistory(history);
            setError(null);
            return history;
        } catch (err) {
            console.error('Error fetching snapshots:', err);
            setError('Failed to load history');
        } finally {
            setLoading(false);
        }
    }, [currentYear]);

    // Helper to capture snapshot
    const captureSnapshot = useCallback(async (type, profileId) => {
        if (!profileId) return;

        setLoading(true);
        try {
            const API_URL = 'http://localhost:5000/api';
            await axios.post(`${API_URL}/snapshots/capture`, {
                profileId,
                month: currentMonth + 1, // API expects 1-12
                year: currentYear,
                type
            });

            // Refresh history
            await fetchSnapshotHistory(type, currentYear, profileId);
        } catch (err) {
            console.error('Error capturing snapshot:', err);
            setError('Failed to save snapshot');
        } finally {
            setLoading(false);
        }
    }, [currentMonth, currentYear, fetchSnapshotHistory]);

    // --- Legacy Actions ---
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
        // State
        expenses,
        budgetItems,
        incomeItems,
        snapshotHistory,
        currentYear,
        currentMonth,
        loading,
        error,

        // Actions
        setExpenses,
        setBudgetItems,
        setIncomeItems,
        setCurrentYear,
        setCurrentMonth,
        fetchSnapshotHistory, // Exposed
        captureSnapshot,      // Exposed

        // Legacy Actions
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
