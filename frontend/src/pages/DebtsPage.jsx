
import React, { useState, useEffect } from 'react';
import { createDebt, getDebts, updateDebt, deleteDebt } from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';
import { Link } from 'react-router-dom';
import { LuArrowLeft, LuPlus, LuPencil, LuTrash2, LuX, LuCreditCard } from 'react-icons/lu';

const Debts = () => {
    const { currentProfile } = useProfile();
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingDebts, setFetchingDebts] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Debug log
    useEffect(() => {
        console.log("DebtsPage mounted");
    }, []);



    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState(null);
    const [formData, setFormData] = useState({
        type: '',
        balance: '',
        interestRate: '',
        monthlyPayment: '',
        description: ''
    });

    // Fetch debts when currentProfile changes
    useEffect(() => {
        if (currentProfile) {
            fetchDebts();
        } else {
            setDebts([]);
            setFetchingDebts(false);
        }
    }, [currentProfile]);

    const fetchDebts = async () => {
        try {
            setFetchingDebts(true);
            const response = await getDebts(currentProfile._id);
            setDebts(response.data || []);
        } catch (err) {
            console.error('Error fetching debts:', err);
            setError('Failed to load debts.');
        } finally {
            setFetchingDebts(false);
        }
    };

    const handleOpenModal = (debt = null) => {
        if (debt) {
            setEditingDebt(debt);
            setFormData({
                type: debt.type,
                balance: debt.balance,
                interestRate: debt.interestRate || '',
                monthlyPayment: debt.monthlyPayment || '',
                description: debt.description || ''
            });
        } else {
            setEditingDebt(null);
            setFormData({
                type: '',
                balance: '',
                interestRate: '',
                monthlyPayment: '',
                description: ''
            });
        }
        setIsModalOpen(true);
        setError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDebt(null);
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
        if (!formData.type.trim()) {
            setError('Debt type is required');
            return;
        }
        if (!formData.balance || parseFloat(formData.balance) < 0) {
            setError('Balance must be a positive number');
            return;
        }

        try {
            setLoading(true);
            const debtData = {
                profileId: currentProfile._id,
                type: formData.type.trim(),
                balance: parseFloat(formData.balance),
                interestRate: formData.interestRate ? parseFloat(formData.interestRate) : 0,
                monthlyPayment: formData.monthlyPayment ? parseFloat(formData.monthlyPayment) : 0,
                description: formData.description.trim()
            };

            if (editingDebt) {
                await updateDebt(editingDebt._id, debtData);
                setSuccess('Debt updated successfully!');
            } else {
                await createDebt(debtData);
                setSuccess('Debt added successfully!');
            }

            handleCloseModal();
            await fetchDebts();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.message || 'Failed to save debt. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        console.log('DebtsPage: handleDelete called with ID:', id); // DEBUG
        if (!id) {
            console.error('Error: No ID provided to handleDelete');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this debt?')) {
            console.log('Delete cancelled by user');
            return;
        }

        try {
            console.log('Calling deleteDebt API...');
            await deleteDebt(id);
            console.log('Debt deleted successfully, fetching new list...');
            setSuccess('Debt deleted successfully!');
            await fetchDebts();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error deleting debt:', err);
            setError('Failed to delete debt.');
        }
    };

    // Safety check
    if (debts === undefined) {
        return <div className="p-6">Loading debts...</div>;
    }

    const totalDebt = debts.reduce((sum, debt) => sum + (debt.balance || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header & Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link to="/projection-v4" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2 transition-colors">
                        <LuArrowLeft className="mr-1" /> Back to Projection Sandbox
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-800">Debts</h2>
                    <p className="text-gray-600">Track your loans, credit cards, and other liabilities</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                    <LuPlus className="mr-2" /> Add New Debt
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

            {/* Debts Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Your Debts</h3>
                    <div className="text-right">
                        <span className="text-sm text-gray-500 mr-2">Total Debt:</span>
                        <span className="text-lg font-bold text-red-600">
                            ${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {fetchingDebts ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-red-600"></div>
                        <p className="mt-2 text-gray-500">Loading debts...</p>
                    </div>
                ) : debts.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                            <LuCreditCard className="w-full h-full" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No debts yet</h3>
                        <p className="mt-1 text-gray-500">Great job! You have no recorded debts.</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <LuPlus className="mr-2" /> Add Debt
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Rate</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Payment</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {debts.map((debt) => (
                                    <tr key={debt._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {debt.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {debt.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                            ${debt.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                            {debt.interestRate}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                            ${debt.monthlyPayment?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleOpenModal(debt)}
                                                className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                                                title="Edit"
                                            >
                                                <LuPencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(debt._id)}
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
                                        {editingDebt ? 'Edit Debt' : 'Add New Debt'}
                                    </h3>
                                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                                        <LuX className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                            Debt Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="type"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                            required
                                        >
                                            <option value="">Select type...</option>
                                            <option value="Student Loan">Student Loan</option>
                                            <option value="Credit Card">Credit Card</option>
                                            <option value="Car Loan">Car Loan</option>
                                            <option value="Mortgage">Mortgage</option>
                                            <option value="Personal Loan">Personal Loan</option>
                                            <option value="Medical Debt">Medical Debt</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1">
                                                Interest Rate (%)
                                            </label>
                                            <input
                                                type="number"
                                                id="interestRate"
                                                name="interestRate"
                                                value={formData.interestRate}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="monthlyPayment" className="block text-sm font-medium text-gray-700 mb-1">
                                                Min. Payment ($)
                                            </label>
                                            <input
                                                type="number"
                                                id="monthlyPayment"
                                                name="monthlyPayment"
                                                value={formData.monthlyPayment}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                                        />
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : (editingDebt ? 'Update Debt' : 'Add Debt')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:col-start-1 sm:text-sm"
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

export default Debts;

