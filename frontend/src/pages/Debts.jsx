import React, { useState, useEffect } from 'react';
import { createDebt, getDebts } from '../api/financeApi';

const Debts = () => {
    const [formData, setFormData] = useState({
        type: '',
        balance: '',
        description: ''
    });
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingDebts, setFetchingDebts] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch debts on component mount
    useEffect(() => {
        fetchDebts();
    }, []);

    const fetchDebts = async () => {
        try {
            setFetchingDebts(true);
            const response = await getDebts();
            setDebts(response.data || []);
        } catch (err) {
            console.error('Error fetching debts:', err);
        } finally {
            setFetchingDebts(false);
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

        // Validation
        if (!formData.type) {
            setError('Debt type is required');
            return;
        }
        if (!formData.balance || parseFloat(formData.balance) <= 0) {
            setError('Balance must be a positive number');
            return;
        }

        try {
            setLoading(true);
            const debtData = {
                type: formData.type,
                amount: parseFloat(formData.balance),
                description: formData.description.trim()
            };

            await createDebt(debtData);
            setSuccess('Debt added successfully!');

            // Reset form
            setFormData({
                type: '',
                balance: '',
                description: ''
            });

            // Refresh debts list
            await fetchDebts();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.message || 'Failed to add debt. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const totalDebts = debts.reduce((sum, debt) => sum + (debt.amount || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Debts</h2>
                <p className="text-gray-600">Track and manage your debts and liabilities</p>
            </div>

            {/* Add Debt Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Debt</h3>

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
                        {/* Debt Type */}
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                Debt Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                                required
                            >
                                <option value="">Select debt type...</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Student Loan">Student Loan</option>
                                <option value="Mortgage">Mortgage</option>
                                <option value="Car Loan">Car Loan</option>
                                <option value="Personal Loan">Personal Loan</option>
                                <option value="Medical Debt">Medical Debt</option>
                                <option value="Business Loan">Business Loan</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Balance */}
                        <div>
                            <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-2">
                                Balance ($) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="balance"
                                name="balance"
                                value={formData.balance}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Additional details about this debt..."
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Adding Debt...' : 'Add Debt'}
                    </button>
                </form>
            </div>

            {/* Debts List */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Your Debts</h3>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Total Debt</p>
                        <p className="text-2xl font-bold text-red-600">
                            ${totalDebts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {fetchingDebts ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : debts.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <p className="mt-2 text-gray-600">No debts yet. Great job staying debt-free!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {debts.map((debt, index) => (
                            <div key={debt._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-gray-800">{debt.type}</h4>
                                    <span className="text-red-600 font-bold">
                                        ${debt.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                {debt.description && (
                                    <p className="text-sm text-gray-600">{debt.description}</p>
                                )}
                                {debt.createdAt && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        Added {new Date(debt.createdAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Debts;
