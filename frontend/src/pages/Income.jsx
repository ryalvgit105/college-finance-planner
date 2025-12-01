import React, { useState, useEffect } from 'react';
import { createIncome, getIncome } from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';

const Income = () => {
    const { currentProfile } = useProfile();
    const [formData, setFormData] = useState({
        source: '',
        amount: '',
        notes: ''
    });
    const [incomeEntries, setIncomeEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingIncome, setFetchingIncome] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch income entries when currentProfile changes
    useEffect(() => {
        if (currentProfile) {
            fetchIncomeEntries();
        } else {
            setIncomeEntries([]);
            setFetchingIncome(false);
        }
    }, [currentProfile]);

    const fetchIncomeEntries = async () => {
        try {
            setFetchingIncome(true);
            const response = await getIncome(currentProfile._id);
            setIncomeEntries(response.data || []);
        } catch (err) {
            console.error('Error fetching income:', err);
        } finally {
            setFetchingIncome(false);
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
        if (!formData.source) {
            setError('Income source is required');
            return;
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError('Monthly amount must be a positive number');
            return;
        }

        try {
            setLoading(true);
            const incomeData = {
                profileId: currentProfile._id,
                currentIncome: parseFloat(formData.amount),
                careerGoal: formData.source, // Using careerGoal field to store source
                incomeSources: [formData.source],
                notes: formData.notes.trim()
            };

            await createIncome(incomeData);
            setSuccess('Income entry added successfully!');

            // Reset form
            setFormData({
                source: '',
                amount: '',
                notes: ''
            });

            // Refresh income list
            await fetchIncomeEntries();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.message || 'Failed to add income. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const totalIncome = incomeEntries.reduce((sum, entry) => sum + (entry.currentIncome || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Income</h2>
                <p className="text-gray-600">Track your monthly income sources</p>
            </div>

            {/* Add Income Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Add Income Entry</h3>

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Income Source */}
                        <div>
                            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
                                Income Source <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="source"
                                name="source"
                                value={formData.source}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                required
                            >
                                <option value="">Select income source...</option>
                                <option value="Job">Job</option>
                                <option value="Side Hustle">Side Hustle</option>
                                <option value="Scholarships">Scholarships</option>
                                <option value="Grants">Grants</option>
                                <option value="Family Support">Family Support</option>
                                <option value="Internship">Internship</option>
                                <option value="Freelance">Freelance</option>
                                <option value="Investments">Investments</option>
                                <option value="Rental Income">Rental Income</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Monthly Amount */}
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                                Monthly Amount ($) <span className="text-red-500">*</span>
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Additional details about this income source..."
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Adding Income...' : 'Add Income'}
                    </button>
                </form>
            </div>

            {/* Income List */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Your Income Sources</h3>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Total Monthly Income</p>
                        <p className="text-2xl font-bold text-blue-600">
                            ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {fetchingIncome ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                ) : incomeEntries.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="mt-2 text-gray-600">No income sources yet. Add your first income entry!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Income Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Source
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Monthly Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Notes
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date Added
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {incomeEntries.map((entry, index) => (
                                        <tr key={entry._id || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                        {entry.careerGoal || entry.incomeSources?.[0] || 'Unknown'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    ${entry.currentIncome?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600 max-w-xs truncate">
                                                    {entry.notes || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Cards for Future Visualization */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Total Sources</p>
                                <p className="text-2xl font-bold text-blue-600">{incomeEntries.length}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Average per Source</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ${incomeEntries.length > 0 ? (totalIncome / incomeEntries.length).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                </p>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Highest Source</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    ${incomeEntries.length > 0 ? Math.max(...incomeEntries.map(e => e.currentIncome || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Income;
