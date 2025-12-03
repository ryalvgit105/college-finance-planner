import React, { useState, useEffect } from 'react';
import { createIncome, getIncome, updateIncome, deleteIncome } from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';
import { Link } from 'react-router-dom';
import { LuArrowLeft, LuPlus, LuPencil, LuTrash2, LuX, LuBriefcase } from 'react-icons/lu';

const Income = () => {
    const { currentProfile } = useProfile();
    const [incomes, setIncomes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingIncome, setFetchingIncome] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Debug log
    useEffect(() => {
        console.log("IncomePage mounted");
    }, []);



    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState(null);
    const [formData, setFormData] = useState({
        currentIncome: '',
        incomeSources: '',
        careerGoal: '',
        projectedSalary: '',
        educationRequired: '',
        notes: ''
    });

    // Fetch income when currentProfile changes
    useEffect(() => {
        if (currentProfile) {
            fetchIncome();
        } else {
            setIncomes([]);
            setFetchingIncome(false);
        }
    }, [currentProfile]);

    const fetchIncome = async () => {
        try {
            setFetchingIncome(true);
            const response = await getIncome(currentProfile._id);
            const data = response.data;
            if (Array.isArray(data)) {
                setIncomes(data);
            } else if (data) {
                setIncomes([data]);
            } else {
                setIncomes([]);
            }
        } catch (err) {
            console.error('Error fetching income:', err);
            setError('Failed to load income data.');
        } finally {
            setFetchingIncome(false);
        }
    };

    const handleOpenModal = (income = null) => {
        if (income) {
            setEditingIncome(income);
            setFormData({
                currentIncome: income.currentIncome || '',
                incomeSources: income.incomeSources ? income.incomeSources.join(', ') : '',
                careerGoal: income.careerGoal || '',
                projectedSalary: income.projectedSalary || '',
                educationRequired: income.educationRequired || '',
                notes: income.notes || ''
            });
        } else {
            setEditingIncome(null);
            setFormData({
                currentIncome: '',
                incomeSources: '',
                careerGoal: '',
                projectedSalary: '',
                educationRequired: '',
                notes: ''
            });
        }
        setIsModalOpen(true);
        setError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingIncome(null);
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
        if (!formData.currentIncome || parseFloat(formData.currentIncome) < 0) {
            setError('Current Income must be a positive number');
            return;
        }

        try {
            setLoading(true);
            const incomeData = {
                profileId: currentProfile._id,
                currentIncome: parseFloat(formData.currentIncome),
                incomeSources: formData.incomeSources.split(',').map(s => s.trim()).filter(s => s),
                careerGoal: formData.careerGoal.trim(),
                projectedSalary: formData.projectedSalary ? parseFloat(formData.projectedSalary) : 0,
                educationRequired: formData.educationRequired.trim(),
                notes: formData.notes.trim()
            };

            if (editingIncome) {
                await updateIncome(editingIncome._id, incomeData);
                setSuccess('Income updated successfully!');
            } else {
                await createIncome(incomeData);
                setSuccess('Income added successfully!');
            }

            handleCloseModal();
            await fetchIncome();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.message || 'Failed to save income. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this income record?')) return;

        try {
            await deleteIncome(id);
            setSuccess('Income deleted successfully!');
            await fetchIncome();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error deleting income:', err);
            setError('Failed to delete income.');
        }
    };

    // Safety check
    if (incomes === undefined) {
        return <div className="p-6">Loading income data...</div>;
    }

    const totalIncome = incomes.reduce((sum, inc) => sum + (inc.currentIncome || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header & Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link to="/projection-v4" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2 transition-colors">
                        <LuArrowLeft className="mr-1" /> Back to Projection Sandbox
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-800">Income & Career</h2>
                    <p className="text-gray-600">Track your earnings and plan your career trajectory</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    <LuPlus className="mr-2" /> Add Income Record
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

            {/* Income Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Income Records</h3>
                    <div className="text-right">
                        <span className="text-sm text-gray-500 mr-2">Total Annual Income:</span>
                        <span className="text-lg font-bold text-blue-600">
                            ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {fetchingIncome ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
                        <p className="mt-2 text-gray-500">Loading income data...</p>
                    </div>
                ) : incomes.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                            <LuBriefcase className="w-full h-full" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No income records yet</h3>
                        <p className="mt-1 text-gray-500">Add your current income and career goals.</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <LuPlus className="mr-2" /> Add Income
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Career Goal</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sources</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Income</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Projected Salary</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {incomes.map((income) => (
                                    <tr key={income._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{income.careerGoal || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">{income.educationRequired}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {income.incomeSources && income.incomeSources.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {income.incomeSources.map((source, idx) => (
                                                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                            {source}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                                            ${income.currentIncome?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                            ${income.projectedSalary?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleOpenModal(income)}
                                                className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                                                title="Edit"
                                            >
                                                <LuPencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(income._id)}
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
                                        {editingIncome ? 'Edit Income Record' : 'Add New Income Record'}
                                    </h3>
                                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                                        <LuX className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="currentIncome" className="block text-sm font-medium text-gray-700 mb-1">
                                                Current Annual Income ($) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                id="currentIncome"
                                                name="currentIncome"
                                                value={formData.currentIncome}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="projectedSalary" className="block text-sm font-medium text-gray-700 mb-1">
                                                Projected Future Salary ($)
                                            </label>
                                            <input
                                                type="number"
                                                id="projectedSalary"
                                                name="projectedSalary"
                                                value={formData.projectedSalary}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="incomeSources" className="block text-sm font-medium text-gray-700 mb-1">
                                            Income Sources (comma separated)
                                        </label>
                                        <input
                                            type="text"
                                            id="incomeSources"
                                            name="incomeSources"
                                            value={formData.incomeSources}
                                            onChange={handleChange}
                                            placeholder="e.g. Job, Freelance, Dividends"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="careerGoal" className="block text-sm font-medium text-gray-700 mb-1">
                                                Career Goal
                                            </label>
                                            <input
                                                type="text"
                                                id="careerGoal"
                                                name="careerGoal"
                                                value={formData.careerGoal}
                                                onChange={handleChange}
                                                placeholder="e.g. Software Engineer"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="educationRequired" className="block text-sm font-medium text-gray-700 mb-1">
                                                Education Required
                                            </label>
                                            <input
                                                type="text"
                                                id="educationRequired"
                                                name="educationRequired"
                                                value={formData.educationRequired}
                                                onChange={handleChange}
                                                placeholder="e.g. BS in Computer Science"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : (editingIncome ? 'Update Income' : 'Add Income')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
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

export default Income;
