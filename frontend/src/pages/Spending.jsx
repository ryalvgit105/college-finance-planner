import React, { useState, useEffect } from 'react';
import { logSpending, getSpending, getWeeklySpending } from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';

const Spending = () => {
    const { currentProfile } = useProfile();
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [spendingEntries, setSpendingEntries] = useState([]);
    const [weeklyBreakdown, setWeeklyBreakdown] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch data when currentProfile changes
    useEffect(() => {
        if (currentProfile) {
            fetchSpendingData();
        } else {
            setSpendingEntries([]);
            setWeeklyBreakdown(null);
            setFetchingData(false);
        }
    }, [currentProfile]);

    const fetchSpendingData = async () => {
        try {
            setFetchingData(true);
            const [historyRes, weeklyRes] = await Promise.all([
                getSpending(currentProfile._id),
                getWeeklySpending(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0], currentProfile._id)
            ]);
            setSpendingEntries(historyRes.data || []);
            setWeeklyBreakdown(weeklyRes.data || null);
        } catch (err) {
            console.error('Error fetching spending data:', err);
        } finally {
            setFetchingData(false);
        }
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

        // Validation
        if (!formData.category) {
            setError('Category is required');
            return;
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError('Amount must be a positive number');
            return;
        }

        try {
            setLoading(true);
            const spendingData = {
                profileId: currentProfile._id,
                category: formData.category,
                amount: parseFloat(formData.amount),
                description: formData.description ? formData.description.trim() : '',
                date: new Date(formData.date)
            };

            await logSpending(spendingData);
            setSuccess('Spending logged successfully!');

            // Reset form (keep date as today)
            setFormData(prev => ({
                category: '',
                amount: '',
                description: '',
                date: new Date().toISOString().split('T')[0]
            }));

            // Refresh data
            await fetchSpendingData();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.message || 'Failed to log spending. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const totalSpending = spendingEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);

    // Group spending by category
    const spendingByCategory = spendingEntries.reduce((acc, entry) => {
        const category = entry.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += entry.amount || 0;
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Spending</h2>
                <p className="text-gray-600">Monitor your expenses and manage your budget</p>
            </div>

            {/* Add Spending Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Log Spending</h3>

                {/* Success Message */}
                {success && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-green-700 font-medium">{success}</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Date */}
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                                Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                                required
                            >
                                <option value="" disabled>Select a category</option>
                                <option value="Food">Food</option>
                                <option value="Rent">Rent</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Transportation">Transportation</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Amount */}
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                                Amount ($) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            id="notes"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Additional details about this expense..."
                            rows="2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Logging Spending...' : 'Log Spending'}
                    </button>
                </form>
            </div>

            {/* Spending Summary */}
            {spendingEntries.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Current Month Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-red-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Monthly Spending</p>
                            <p className="text-2xl font-bold text-red-600">
                                ${spendingEntries
                                    .filter(entry => {
                                        const entryDate = new Date(entry.date);
                                        const now = new Date();
                                        return entryDate.getMonth() === now.getMonth() &&
                                            entryDate.getFullYear() === now.getFullYear();
                                    })
                                    .reduce((sum, entry) => sum + (entry.amount || 0), 0)
                                    .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Total Entries</p>
                            <p className="text-2xl font-bold text-gray-800">{spendingEntries.length}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Categories</p>
                            <p className="text-2xl font-bold text-gray-800">{Object.keys(spendingByCategory).length}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Average</p>
                            <p className="text-2xl font-bold text-gray-800">
                                ${(totalSpending / spendingEntries.length).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {/* Category Breakdown */}
                    {Object.keys(spendingByCategory).length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-semibold text-gray-800 mb-3">By Category</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {Object.entries(spendingByCategory).map(([category, amount]) => (
                                    <div key={category} className="p-3 border border-gray-200 rounded-lg">
                                        <p className="text-sm text-gray-600 truncate">{category}</p>
                                        <p className="font-bold text-gray-800">
                                            ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Spending Entries List */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Spending</h3>

                {fetchingData ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : spendingEntries.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <p className="mt-2 text-gray-600">No spending entries yet. Log your first expense above!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {spendingEntries.slice().reverse().map((entry, index) => (
                            <div key={entry._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                                                {entry.category}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(entry.date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {entry.description && (
                                            <p className="text-sm text-gray-600 mt-2">{entry.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-xl font-bold text-red-600">
                                            ${entry.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Spending;
