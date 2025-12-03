import React, { useState, useEffect } from 'react';
import { createInvestment, getInvestments, updateInvestment, deleteInvestment } from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';
import { Link } from 'react-router-dom';
import { LuArrowLeft, LuPlus, LuPencil, LuTrash2, LuX, LuTrendingUp } from 'react-icons/lu';

const InvestmentsPage = () => {
    const { currentProfile } = useProfile();
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingInvestments, setFetchingInvestments] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Debug log
    useEffect(() => {
        console.log("InvestmentsPage mounted");
    }, []);



    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Stock',
        currentValue: '',
        contributionPerMonth: '',
        expectedAnnualReturn: '7.0',
        taxTreatment: 'Taxable',
        startYearOffset: '0',
        endYearOffset: '30'
    });

    // Fetch investments when currentProfile changes
    useEffect(() => {
        if (currentProfile) {
            fetchInvestments();
        } else {
            setInvestments([]);
            setFetchingInvestments(false);
        }
    }, [currentProfile]);

    const fetchInvestments = async () => {
        try {
            setFetchingInvestments(true);
            const response = await getInvestments(currentProfile._id);
            setInvestments(response.data || []);
        } catch (err) {
            console.error('Error fetching investments:', err);
            setError('Failed to load investments.');
        } finally {
            setFetchingInvestments(false);
        }
    };

    const handleOpenModal = (investment = null) => {
        if (investment) {
            setEditingInvestment(investment);
            setFormData({
                name: investment.name || '',
                type: investment.type || 'Stock',
                currentValue: investment.currentValue || '',
                contributionPerMonth: investment.contributionPerMonth || '',
                expectedAnnualReturn: investment.expectedAnnualReturn || '7.0',
                taxTreatment: investment.taxTreatment || 'Taxable',
                startYearOffset: investment.startYearOffset || '0',
                endYearOffset: investment.endYearOffset || '30'
            });
        } else {
            setEditingInvestment(null);
            setFormData({
                name: '',
                type: 'Stock',
                currentValue: '',
                contributionPerMonth: '',
                expectedAnnualReturn: '7.0',
                taxTreatment: 'Taxable',
                startYearOffset: '0',
                endYearOffset: '30'
            });
        }
        setIsModalOpen(true);
        setError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingInvestment(null);
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
        if (!formData.name.trim()) {
            setError('Investment name is required');
            return;
        }
        if (parseFloat(formData.currentValue) < 0) {
            setError('Current Value cannot be negative');
            return;
        }

        try {
            setLoading(true);
            const investmentData = {
                profileId: currentProfile._id,
                name: formData.name.trim(),
                type: formData.type,
                currentValue: parseFloat(formData.currentValue) || 0,
                contributionPerMonth: parseFloat(formData.contributionPerMonth) || 0,
                expectedAnnualReturn: parseFloat(formData.expectedAnnualReturn) || 0,
                taxTreatment: formData.taxTreatment,
                startYearOffset: parseInt(formData.startYearOffset) || 0,
                endYearOffset: parseInt(formData.endYearOffset) || 0
            };

            if (editingInvestment) {
                await updateInvestment(editingInvestment._id, investmentData);
                setSuccess('Investment updated successfully!');
            } else {
                await createInvestment(investmentData);
                setSuccess('Investment added successfully!');
            }

            handleCloseModal();
            await fetchInvestments();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.message || 'Failed to save investment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this investment?')) return;

        try {
            await deleteInvestment(id);
            setSuccess('Investment deleted successfully!');
            await fetchInvestments();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error deleting investment:', err);
            setError('Failed to delete investment.');
        }
    };

    // Safety check
    if (investments === undefined) {
        return <div className="p-6">Loading investments...</div>;
    }

    const totalValue = investments.reduce((sum, item) => sum + (item.currentValue || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header & Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link to="/projection-v4" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2 transition-colors">
                        <LuArrowLeft className="mr-1" /> Back to Projection Sandbox
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-800">Investments</h2>
                    <p className="text-gray-600">Manage your investment portfolio and growth assumptions</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <LuPlus className="mr-2" /> Add Investment
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

            {/* Investments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Portfolio Holdings</h3>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Total Portfolio Value</div>
                        <div className="text-lg font-bold text-indigo-600">
                            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {fetchingInvestments ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
                        <p className="mt-2 text-gray-500">Loading investments...</p>
                    </div>
                ) : investments.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                            <LuTrendingUp className="w-full h-full" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No investments yet</h3>
                        <p className="mt-1 text-gray-500">Add your investment accounts to track growth.</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <LuPlus className="mr-2" /> Add Investment
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Contrib.</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Return (%)</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {investments.map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                            <div className="text-xs text-gray-500">{item.taxTreatment}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                            ${item.currentValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                            ${item.contributionPerMonth?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                            {item.expectedAnnualReturn}%
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
                                        {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
                                    </h3>
                                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                                        <LuX className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Investment Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="e.g. Vanguard S&P 500"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                                Type
                                            </label>
                                            <select
                                                id="type"
                                                name="type"
                                                value={formData.type}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="Stock">Stock</option>
                                                <option value="Bond">Bond</option>
                                                <option value="ETF">ETF</option>
                                                <option value="Mutual Fund">Mutual Fund</option>
                                                <option value="Crypto">Crypto</option>
                                                <option value="Real Estate">Real Estate</option>
                                                <option value="401k">401k</option>
                                                <option value="IRA">IRA</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="currentValue" className="block text-sm font-medium text-gray-700 mb-1">
                                                Current Value ($) <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                id="currentValue"
                                                name="currentValue"
                                                value={formData.currentValue}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="contributionPerMonth" className="block text-sm font-medium text-gray-700 mb-1">
                                                Monthly Contribution ($)
                                            </label>
                                            <input
                                                type="number"
                                                id="contributionPerMonth"
                                                name="contributionPerMonth"
                                                value={formData.contributionPerMonth}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                step="0.01"
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="expectedAnnualReturn" className="block text-sm font-medium text-gray-700 mb-1">
                                                Expected Annual Return (%)
                                            </label>
                                            <input
                                                type="number"
                                                id="expectedAnnualReturn"
                                                name="expectedAnnualReturn"
                                                value={formData.expectedAnnualReturn}
                                                onChange={handleChange}
                                                placeholder="7.0"
                                                step="0.1"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="taxTreatment" className="block text-sm font-medium text-gray-700 mb-1">
                                                Tax Treatment
                                            </label>
                                            <select
                                                id="taxTreatment"
                                                name="taxTreatment"
                                                value={formData.taxTreatment}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="Taxable">Taxable</option>
                                                <option value="Tax-Deferred">Tax-Deferred (401k/IRA)</option>
                                                <option value="Tax-Free">Tax-Free (Roth)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="startYearOffset" className="block text-sm font-medium text-gray-700 mb-1">
                                                Start Year (Offset from now)
                                            </label>
                                            <input
                                                type="number"
                                                id="startYearOffset"
                                                name="startYearOffset"
                                                value={formData.startYearOffset}
                                                onChange={handleChange}
                                                placeholder="0"
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="endYearOffset" className="block text-sm font-medium text-gray-700 mb-1">
                                                End Year (Offset from now)
                                            </label>
                                            <input
                                                type="number"
                                                id="endYearOffset"
                                                name="endYearOffset"
                                                value={formData.endYearOffset}
                                                onChange={handleChange}
                                                placeholder="30"
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : (editingInvestment ? 'Update Investment' : 'Add Investment')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
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

export default InvestmentsPage;
