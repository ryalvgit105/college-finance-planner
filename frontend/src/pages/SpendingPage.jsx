import React, { useState, useEffect } from 'react';
import { createSpending, getSpending, updateSpending, deleteSpending, getIncome } from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';
import { Link } from 'react-router-dom';
import { LuArrowLeft, LuPlus, LuPencil, LuTrash2, LuX, LuShoppingCart, LuDollarSign, LuCalendar, LuTrendingUp, LuChevronLeft, LuChevronRight, LuChevronDown, LuChevronUp } from 'react-icons/lu';

const SpendingPage = () => {
    const { currentProfile, updateProfile } = useProfile();
    const [spending, setSpending] = useState([]);
    const [income, setIncome] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Budget State
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState({ category: '', amount: '' });

    // Month Commander Helper
    const [currentDate, setCurrentDate] = useState(new Date());

    // Filtered lists
    const [fixedExpenses, setFixedExpenses] = useState([]);
    const [variableExpenses, setVariableExpenses] = useState([]);

    // Weekly Grouping
    const [weeklyGroups, setWeeklyGroups] = useState({});
    const [expandedWeeks, setExpandedWeeks] = useState({ 1: true, 2: true, 3: true, 4: true, 5: true });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSpending, setEditingSpending] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        category: '',
        type: 'variable',
        amount: '',
        notes: ''
    });

    // Fetch data when currentProfile or Month changes
    useEffect(() => {
        if (currentProfile) {
            fetchData();
        } else {
            setSpending([]);
            setIncome(null);
            setFetchingData(false);
        }
    }, [currentProfile, currentDate]);

    // Split spending into categories and weekly groups
    useEffect(() => {
        const fixed = spending.filter(item => item.type === 'fixed');
        const variable = spending.filter(item => item.type === 'variable' || !item.type);
        setFixedExpenses(fixed);
        setVariableExpenses(variable);

        // Group Variable Expenses by Week
        const groups = {};
        variable.forEach(item => {
            const date = new Date(item.date);
            const weekNum = Math.ceil(date.getDate() / 7); // Simple 1-4 week logic
            if (!groups[weekNum]) groups[weekNum] = [];
            groups[weekNum].push(item);
        });
        setWeeklyGroups(groups);

    }, [spending]);

    const fetchData = async () => {
        try {
            setFetchingData(true);
            const monthStr = currentDate.toISOString().slice(0, 7); // YYYY-MM

            const [spendingRes, incomeRes] = await Promise.all([
                getSpending(currentProfile._id, monthStr),
                getIncome(currentProfile._id).catch(() => ({ data: null }))
            ]);

            setSpending(spendingRes.data || []);
            // Backend returns an array of income records, take the most recent one (first item)
            // stored in .data property of the response object
            const incomeData = incomeRes.data;
            setIncome(Array.isArray(incomeData) ? incomeData[0] : incomeData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load financial data.');
        } finally {
            setFetchingData(false);
        }
    };

    // Month Navigation
    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const toggleWeek = (weekNum) => {
        setExpandedWeeks(prev => ({ ...prev, [weekNum]: !prev[weekNum] }));
    };

    const handleOpenModal = (item = null, type = 'variable') => {
        if (item) {
            setEditingSpending(item);
            setFormData({
                date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
                category: item.category || '',
                type: item.type || 'variable',
                amount: item.amount || '',
                notes: item.notes || ''
            });
        } else {
            setEditingSpending(null);
            setFormData({
                date: new Date().toISOString().split('T')[0], // Default to today
                category: '',
                type: type,
                amount: '',
                notes: ''
            });
        }
        setIsModalOpen(true);
        setError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSpending(null);
        setError(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!currentProfile) {
            setError('Please select a profile first');
            return;
        }

        try {
            setLoading(true);
            const spendingData = {
                profileId: currentProfile._id,
                date: formData.date,
                category: formData.category.trim(),
                type: formData.type,
                amount: parseFloat(formData.amount),
                notes: formData.notes.trim()
            };

            if (editingSpending) {
                await updateSpending(editingSpending._id, spendingData);
                setSuccess('Spending updated successfully!');
            } else {
                await createSpending(spendingData);
                setSuccess('Spending logged successfully!');
            }

            handleCloseModal();
            await fetchData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.message || 'Failed to save spending.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            await deleteSpending(id);
            setSuccess('Spending deleted successfully!');
            await fetchData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to delete spending.');
        }
    };

    // Budget Handlers
    const handleOpenBudgetModal = (category, currentAmount) => {
        setEditingBudget({ category, amount: currentAmount || '' });
        setIsBudgetModalOpen(true);
    };

    const handleSaveBudget = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const newBudgets = {
                ...currentProfile.budgets,
                [editingBudget.category]: parseFloat(editingBudget.amount)
            };

            const result = await updateProfile(currentProfile._id, { budgets: newBudgets });
            if (result.success) {
                setSuccess(`Budget for ${editingBudget.category} updated!`);
                setIsBudgetModalOpen(false);
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError('Failed to update budget.');
            }
        } catch (err) {
            console.error(err);
            setError('Error saving budget.');
        } finally {
            setLoading(false);
        }
    };

    // Calculations
    const monthlyIncome = income ? (income.currentIncome / 12) : 0;
    const totalFixed = fixedExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalVariable = variableExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalSpending = totalFixed + totalVariable;
    const unallocated = monthlyIncome - totalSpending;

    // Weekly Pulse Logic
    const currentWeekNum = Math.ceil(new Date().getDate() / 7);
    const currentWeekSpend = weeklyGroups[currentWeekNum]?.reduce((sum, item) => sum + item.amount, 0) || 0;
    // Calculate simple weekly limit: (Income - Fixed - SavingsGoal) / 4
    // For now assuming 20% savings goal
    const estimatedWeeklyLimit = Math.max((monthlyIncome - totalFixed - (monthlyIncome * 0.2)) / 4, 1);

    if (fetchingData) {
        return <div className="p-6 text-center text-gray-500">Loading financial data...</div>;
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header & Month Commander */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Budget Planner</h1>
                    <Link to="/projection-v4" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center mt-1">
                        <LuArrowLeft className="mr-1" /> Back to Projections
                    </Link>
                </div>

                {/* Month Commander Navigator */}
                <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
                        <LuChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-4 py-1 text-center min-w-[160px]">
                        <span className="text-lg font-bold text-gray-900 block">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-md text-gray-600">
                        <LuChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Zero-Based Summary Card */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-xl p-6 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <LuDollarSign className="w-48 h-48" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <p className="text-sm text-gray-400">Total Income</p>
                        <p className="text-2xl font-bold text-green-400">+${monthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="text-xl text-gray-500">-</div>
                    <div className="text-center md:text-left">
                        <p className="text-sm text-gray-400">Expenses</p>
                        <p className="text-2xl font-bold text-red-400">-${totalSpending.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div className="text-xl text-gray-500">=</div>
                    <div className="bg-gray-700/50 rounded-xl p-3 min-w-[180px] text-center backdrop-blur-sm border border-gray-600">
                        <p className="text-sm text-gray-300">Unallocated</p>
                        <p className={`text-2xl font-bold ${unallocated >= 0 ? 'text-blue-400' : 'text-red-500'}`}>
                            ${unallocated.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Layout: Fixed vs Variable */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Fixed Expenses Column */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <LuCalendar className="text-blue-600" /> Fixed Bills
                        </h2>
                        <button onClick={() => handleOpenModal(null, 'fixed')} className="text-sm text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md font-medium">
                            + Add Bill
                        </button>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between">
                            <span className="font-medium text-gray-500">Total Fixed</span>
                            <span className="font-bold text-gray-900">${totalFixed.toLocaleString()}</span>
                        </div>
                        <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                            {fixedExpenses.map(item => (
                                <li key={item._id} className="p-4 hover:bg-gray-50 flex justify-between group">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.category}</p>
                                        <p className="text-xs text-gray-500">{item.notes}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">${item.amount.toLocaleString()}</span>
                                        <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100">
                                            <LuTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                            {fixedExpenses.length === 0 && <li className="p-6 text-center text-gray-400 text-sm">No fixed bills for this month.</li>}
                        </ul>
                    </div>
                </div>

                {/* Variable Spending Column (With Weekly Pulse & Accordion) */}
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <LuShoppingCart className="text-orange-600" /> Variable Spending
                        </h2>
                        <button onClick={() => handleOpenModal(null, 'variable')} className="text-sm text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-md font-medium">
                            + Add Expense
                        </button>
                    </div>

                    {/* Category Budget Performance (Reality Check) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Category Budgets (Reality Check)</h3>
                        <div className="space-y-4">
                            {/* Sort by percent used desc, showing top 3 or all */}
                            {currentProfile?.categories?.map(cat => {
                                const limit = currentProfile.budgets?.[cat] || 0;
                                const spend = variableExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);

                                // Only show if there is a limit set OR spending exists
                                if (limit === 0 && spend === 0) return null;

                                const percent = limit > 0 ? (spend / limit) * 100 : 0;
                                let color = 'bg-green-500';
                                if (percent > 80) color = 'bg-yellow-500';
                                if (percent > 100) color = 'bg-red-500';
                                if (limit === 0 && spend > 0) color = 'bg-gray-400'; // Unbudgeted spend

                                return (
                                    <div key={cat} className="group">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700 flex items-center gap-2">
                                                {cat}
                                                <button onClick={() => handleOpenBudgetModal(cat, limit)} className="text-gray-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <LuPencil className="w-3 h-3" />
                                                </button>
                                            </span>
                                            <span className="text-gray-500">
                                                ${spend.toLocaleString()} <span className="text-gray-300">/ ${limit > 0 ? limit.toLocaleString() : '—'}</span>
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {(!currentProfile?.budgets || Object.keys(currentProfile.budgets).length === 0) && variableExpenses.length === 0 && (
                                <p className="text-xs text-gray-400 italic text-center py-2">Start adding expenses or set budgets to see tracking here.</p>
                            )}
                        </div>
                    </div>

                    {/* Weekly Pulse Card */}
                    <div className="bg-gray-900 rounded-xl p-5 mb-6 text-white shadow-lg">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Weekly Pulse (Week {currentWeekNum})</p>
                                <p className="text-2xl font-bold mt-1">${currentWeekSpend.toLocaleString()} <span className="text-sm text-gray-500 font-normal">/ ${estimatedWeeklyLimit.toFixed(0)} limit</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Remaining</p>
                                <p className={`text-lg font-bold ${estimatedWeeklyLimit - currentWeekSpend < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    ${(estimatedWeeklyLimit - currentWeekSpend).toFixed(0)}
                                </p>
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full ${currentWeekSpend > estimatedWeeklyLimit ? 'bg-red-500' : 'bg-gradient-to-r from-orange-400 to-pink-500'}`}
                                style={{ width: `${Math.min((currentWeekSpend / estimatedWeeklyLimit) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Weekly Accordion List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1">
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between">
                            <span className="font-medium text-gray-500">Total Variable</span>
                            <span className="font-bold text-gray-900">${totalVariable.toLocaleString()}</span>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            {[1, 2, 3, 4, 5].map(week => {
                                const weekTotal = weeklyGroups[week]?.reduce((sum, i) => sum + i.amount, 0) || 0;
                                if (!weeklyGroups[week] && week > 1) return null; // Hide empty future weeks, show Week 1 always or if has data

                                return (
                                    <div key={week} className="border-b border-gray-100 last:border-0">
                                        <button
                                            onClick={() => toggleWeek(week)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                {expandedWeeks[week] ? <LuChevronDown className="text-gray-400" /> : <LuChevronRight className="text-gray-400" />}
                                                <span className="font-medium text-gray-800">Week {week}</span>
                                                <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full">
                                                    {weeklyGroups[week]?.length || 0} transactions
                                                </span>
                                            </div>
                                            <span className="font-bold text-gray-900">${weekTotal.toLocaleString()}</span>
                                        </button>

                                        {expandedWeeks[week] && (
                                            <ul className="bg-gray-50/50 divide-y divide-gray-100 px-4 pb-2">
                                                {weeklyGroups[week]?.map(item => (
                                                    <li key={item._id} className="py-3 flex justify-between items-center group pl-8">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-gray-900 text-sm">{item.category}</span>
                                                                <span className="text-xs text-gray-400">{new Date(item.date).getDate()}th</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500">{item.notes}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-semibold">${item.amount}</span>
                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => handleOpenModal(item)} className="text-blue-400 hover:text-blue-600"><LuPencil className="w-3 h-3" /></button>
                                                                <button onClick={() => handleDelete(item._id)} className="text-red-400 hover:text-red-600"><LuTrash2 className="w-3 h-3" /></button>
                                                            </div>
                                                        </div>
                                                    </li>
                                                )) || <li className="pl-8 py-2 text-xs text-gray-400 italic">No spending this week.</li>}
                                            </ul>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {isBudgetModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsBudgetModalOpen(false)}></div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Set Budget for {editingBudget.category}</h3>
                                <form onSubmit={handleSaveBudget}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit ($)</label>
                                        <input
                                            type="number"
                                            value={editingBudget.amount}
                                            onChange={(e) => setEditingBudget({ ...editingBudget, amount: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Example: 500"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsBudgetModalOpen(false)}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Save Limit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {editingSpending ? 'Edit Expense' : (formData.type === 'fixed' ? 'Add Fixed Bill' : 'Log New Expense')}
                                    </h3>
                                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                                        <LuX className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                            <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                                <option value="variable">Variable Spending</option>
                                                <option value="fixed">Fixed Bill</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                                            <option value="">Select category...</option>
                                            {formData.type === 'fixed' ? (
                                                <>
                                                    <option value="Rent/Mortgage">Rent/Mortgage</option>
                                                    <option value="Utilities">Utilities</option>
                                                    <option value="Internet">Internet</option>
                                                    <option value="Phone">Phone</option>
                                                    <option value="Insurance">Insurance</option>
                                                    <option value="Subscriptions">Subscriptions</option>
                                                    <option value="Debt Payment">Debt Payment</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="Food">Food / Groceries</option>
                                                    <option value="Dining Out">Dining Out</option>
                                                    <option value="Transportation">Transportation</option>
                                                    <option value="Entertainment">Entertainment</option>
                                                    <option value="Shopping">Shopping</option>
                                                    <option value="Healthcare">Healthcare</option>
                                                    <option value="Education">Education</option>
                                                    <option value="Other">Other</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                                        <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="0.00" step="0.01" min="0" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Optional details..." />
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                                        <button type="submit" disabled={loading} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:col-start-2 sm:text-sm">
                                            {loading ? 'Saving...' : 'Save Expense'}
                                        </button>
                                        <button type="button" onClick={handleCloseModal} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:col-start-1 sm:text-sm">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpendingPage;
