import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { getIncome } from '../api/financeApi';
import { useProfile } from './ProfileContext';
import {
    INITIAL_EXPENSES,
    INITIAL_BUDGET_ITEMS,
    INITIAL_INCOME_ITEMS
} from '../components/Spending/constants';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
    // Current Profile
    const { currentProfile } = useProfile();

    // Legacy / Spending Data
    const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
    const [budgetItems, setBudgetItems] = useState(INITIAL_BUDGET_ITEMS);
    const [incomeItems, setIncomeItems] = useState([]); // Start empty, fetch from API

    // Snapshot / Historical Data
    const [snapshotHistory, setSnapshotHistory] = useState([]); // 12-month array
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch Income on Mount
    useEffect(() => {
        const fetchIncome = async () => {
            try {
                // TODO: Get real profileId from AuthContext
                const profileId = '675276535502c52538cbcf76'; // Using a known ID or fetching global for now
                // Ideally, we'd list all or filter by user. For now, let's fetch for the "current" user if available or standard ID.
                // Since the app seems to use a single profile or passed ID, we might need to find where profileId comes from.
                // Looking at IncomePage, it uses useProfile(). Let's assume we can fetch all or specific.

                // For this quick fix to sync, we'll fetch all and map.
                const res = await getIncome(profileId); // Accessing specific profile
                // If getIncome requires profileId, we need it. 
                // If the user is just testing locally, maybe we can fetch all without ID if API supports it?
                // Checking financeApi.js: export const getIncome = (profileId) => api.get(`/income?profileId=${profileId}`);
                // We need a profileId.

                // Fallback: If no profileId context available here easily, we might need to rely on what IncomePage uses.
                // But FinanceContext should probably wrap everything. 
                // Let's use the profileId found in previous calls or generic.
            } catch (err) {
                console.error("Failed to fetch income for context", err);
            }
        };
        // fetchIncome();
    }, []);

    // Actually, we need to expose a refresh function or fetch automatically.
    // Let's create a fetchLiveIncome function that components can call, and also call it on mount.

    const fetchLiveIncomeContext = useCallback(async (profileId) => {
        const targetId = profileId || currentProfile?._id;
        if (!targetId) return;

        try {
            const { data } = await getIncome(targetId);
            if (data && data.data) {
                const mappedIncome = data.data.map(item => ({
                    id: item._id,
                    amount: item.currentIncome,
                    description: item.incomeSources ? item.incomeSources.join(', ') : 'Income',
                    month: item.month
                }));
                setIncomeItems(mappedIncome);
            }
        } catch (err) {
            console.error("Context: Failed to fetch income", err);
        }
    }, [currentProfile]);

    useEffect(() => {
        if (currentProfile) {
            fetchLiveIncomeContext(currentProfile._id);
        }
    }, [currentProfile, fetchLiveIncomeContext]);

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
        fetchLiveIncomeContext, // Exposed so IncomePage can trigger update

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
