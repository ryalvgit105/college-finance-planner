import React, { useState, useEffect } from 'react';
import { createSpending, getSpending, updateSpending, deleteSpending } from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';
import { Link } from 'react-router-dom';
import { LuArrowLeft, LuPlus, LuPencil, LuTrash2, LuX, LuShoppingCart } from 'react-icons/lu';

const SpendingPage = () => {
    const { currentProfile } = useProfile();
    const [spending, setSpending] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingSpending, setFetchingSpending] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Debug log
    useEffect(() => {
        console.log("SpendingPage mounted");
    }, []);



    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSpending, setEditingSpending] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        category: '',
        amount: '',
        notes: ''
    });

    // Fetch spending when currentProfile changes
    useEffect(() => {
        if (currentProfile) {
            fetchSpending();
        } else {
            setSpending([]);
            setFetchingSpending(false);
        }
    }, [currentProfile]);

    const fetchSpending = async () => {
        try {
            setFetchingSpending(true);
            const response = await getSpending(currentProfile._id);
            setSpending(response.data || []);
        } catch (err) {
            console.error('Error fetching spending:', err);
            setError('Failed to load spending.');
        } finally {
            setFetchingSpending(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingSpending(item);
            setFormData({
                date: item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0],
                category: item.category || '',
                amount: item.amount || '',
                notes: item.notes || ''
            });
        } else {
            setEditingSpending(null);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                category: '',
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

        // Validation
        if (!formData.category.trim()) {
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
                date: formData.date,
                category: formData.category.trim(),
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
            await fetchSpending();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.message || 'Failed to save spending. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;

        try {
            await deleteSpending(id);
            setSuccess('Spending deleted successfully!');
            await fetchSpending();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error deleting spending:', err);
            setError('Failed to delete spending.');
        }
    };

    // Safety check
    if (spending === undefined) {
        return <div className="p-6">Loading spending...</div>;
    }

    const totalSpending = spending.reduce((sum, item) => sum + (item.amount || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header & Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link to="/projection-v4" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2 transition-colors">
                        <LuArrowLeft className="mr-1" /> Back to Projection Sandbox
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-800">Spending</h2>
                    <p className="text-gray-600">Track your daily expenses and budget</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                >
                    <LuPlus className="mr-2" /> Log Expense
                </button>
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-sm animate-fade-in">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">{success}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm animate-fade-in">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Spending Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
                    <div className="text-right">
                        <span className="text-sm text-gray-500 mr-2">Total Spending:</span>
                        <span className="text-lg font-bold text-orange-600">
                            ${totalSpending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {fetchingSpending ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-orange-600"></div>
                        <p className="mt-2 text-gray-500">Loading spending...</p>
                    </div>
                ) : spending.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                            <LuShoppingCart className="w-full h-full" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No expenses yet</h3>
                        <p className="mt-1 text-gray-500">Log your first expense to start tracking.</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            <LuPlus className="mr-2" /> Log Expense
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {spending.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(item.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {item.notes || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                            ${item.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleOpenModal(item)}
                                                className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                                                title="Edit"
                                            >
                                                <LuPencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="text-red-600 hover:text-red-900 transition-colors"
                                                title="Delete"
                                            >
                                                <LuTrash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={handleCloseModal}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {editingSpending ? 'Edit Expense' : 'Log New Expense'}
                                    </h3>
                                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                                        <LuX className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                                            Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                            required
                                        >
                                            <option value="">Select category...</option>
                                            <option value="Housing">Housing</option>
                                            <option value="Food">Food</option>
                                            <option value="Transportation">Transportation</option>
                                            <option value="Utilities">Utilities</option>
                                            <option value="Insurance">Insurance</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Entertainment">Entertainment</option>
                                            <option value="Shopping">Shopping</option>
                                            <option value="Education">Education</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes
                                        </label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : (editingSpending ? 'Update Expense' : 'Log Expense')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                                        >
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
