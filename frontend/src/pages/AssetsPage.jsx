import React, { useState, useEffect } from 'react';
import { createAsset, getAssets, updateAsset, deleteAsset, getInvestments, deleteInvestment } from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';
import { Link } from 'react-router-dom';
import { LuArrowLeft, LuPlus, LuPencil, LuTrash2, LuX, LuDollarSign } from 'react-icons/lu';

const Assets = () => {
    const { currentProfile } = useProfile();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingAssets, setFetchingAssets] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Debug log
    useEffect(() => {
        console.log("AssetsPage mounted");
    }, []);



    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [formData, setFormData] = useState({
        type: '',
        value: '',
        description: ''
    });

    // Fetch assets when currentProfile changes
    useEffect(() => {
        if (currentProfile) {
            fetchAssets();
        } else {
            setAssets([]);
            setFetchingAssets(false);
        }
    }, [currentProfile]);

    const fetchAssets = async () => {
        try {
            setFetchingAssets(true);
            const [assetsRes, investmentsRes] = await Promise.all([
                getAssets(currentProfile._id),
                getInvestments(currentProfile._id)
            ]);

            const assetsList = assetsRes.data || [];
            // Map investments to match asset structure for unified display
            const investmentsList = (investmentsRes.data || []).map(inv => ({
                ...inv,
                type: inv.assetType || inv.type, // Handle both naming conventions
                value: inv.currentValue,
                description: `Investment: ${inv.name}`,
                isInvestment: true // Flag to distinguish
            }));

            // Combine and sort by value (descending)
            const unified = [...assetsList, ...investmentsList].sort((a, b) => b.value - a.value);
            setAssets(unified);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load assets and portfolio.');
        } finally {
            setFetchingAssets(false);
        }
    };

    const handleOpenModal = (asset = null) => {
        if (asset) {
            setEditingAsset(asset);
            setFormData({
                type: asset.type,
                value: asset.value,
                description: asset.description || ''
            });
        } else {
            setEditingAsset(null);
            setFormData({
                type: '',
                value: '',
                description: ''
            });
        }
        setIsModalOpen(true);
        setError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAsset(null);
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
            setError('Asset type is required');
            return;
        }
        if (!formData.value || parseFloat(formData.value) < 0) {
            setError('Asset value must be a positive number');
            return;
        }

        try {
            setLoading(true);
            const assetData = {
                profileId: currentProfile._id,
                type: formData.type.trim(),
                value: parseFloat(formData.value),
                description: formData.description.trim()
            };

            if (editingAsset) {
                await updateAsset(editingAsset._id, assetData);
                setSuccess('Asset updated successfully!');
            } else {
                await createAsset(assetData);
                setSuccess('Asset added successfully!');
            }

            handleCloseModal();
            await fetchAssets();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.message || 'Failed to save asset. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, isInvestment) => {
        if (!id) return;

        const typeLabel = isInvestment ? 'investment' : 'asset';
        if (!window.confirm(`Are you sure you want to delete this ${typeLabel}?`)) return;

        try {
            if (isInvestment) {
                await deleteInvestment(id);
            } else {
                await deleteAsset(id);
            }
            setSuccess(`${isInvestment ? 'Investment' : 'Asset'} deleted successfully!`);
            await fetchAssets();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error(`Error deleting ${typeLabel}:`, err);
            setError(`Failed to delete ${typeLabel}.`);
        }
    };

    // Safety check
    if (assets === undefined) {
        return <div className="p-6">Loading assets...</div>;
    }

    const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header & Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link to="/projection-v4" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2 transition-colors">
                        <LuArrowLeft className="mr-1" /> Back to Projection Sandbox
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-800">Assets</h2>
                    <p className="text-gray-600">Track your savings, investments, and valuable possessions</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        to="/investments"
                        className="inline-flex items-center px-4 py-2 bg-white text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                    >
                        <LuDollarSign className="mr-2" /> Manage Investments
                    </Link>
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <LuPlus className="mr-2" /> Add Simple Asset
                    </button>
                </div>
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

            {/* Assets Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-800">Your Assets</h3>
                    <div className="text-right">
                        <span className="text-sm text-gray-500 mr-2">Total Value:</span>
                        <span className="text-lg font-bold text-green-600">
                            ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                {fetchingAssets ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-green-600"></div>
                        <p className="mt-2 text-gray-500">Loading assets...</p>
                    </div>
                ) : assets.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                            <LuDollarSign className="w-full h-full" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No assets yet</h3>
                        <p className="mt-1 text-gray-500">Get started by adding your first asset.</p>
                        <button
                            onClick={() => handleOpenModal()}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <LuPlus className="mr-2" /> Add Asset
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {assets.map((item) => (
                                    <tr key={item._id} className={item.isInvestment ? "bg-indigo-50/30 hover:bg-indigo-50 transition-colors" : "hover:bg-gray-50 transition-colors"}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isInvestment ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'} capitalize`}>
                                                {item.type}
                                            </span>
                                            {item.isInvestment && <span className="ml-2 text-[10px] text-indigo-600 font-semibold tracking-wider uppercase">INV</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {item.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                            ${item.value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {item.isInvestment ? (
                                                <Link
                                                    to="/investments"
                                                    className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors inline-block"
                                                    title="Manage in Investments"
                                                >
                                                    <LuPencil className="w-4 h-4" />
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                                                    title="Edit"
                                                >
                                                    <LuPencil className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(item._id, item.isInvestment)}
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
                                        {editingAsset ? 'Edit Asset' : 'Add New Asset'}
                                    </h3>
                                    <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                                        <LuX className="w-5 h-5" />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                            Asset Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="type"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                            required
                                        >
                                            <option value="">Select type...</option>
                                            <option value="Savings Account">Savings Account</option>
                                            <option value="Checking Account">Checking Account</option>
                                            <option value="Money Market">Money Market</option>
                                            <option value="CD (Certificate of Deposit)">CD</option>
                                            <option value="Brokerage Account">Brokerage Account</option>
                                            <option value="Real Estate">Real Estate</option>
                                            <option value="Vehicle">Vehicle</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">
                                            Value ($) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="value"
                                            name="value"
                                            value={formData.value}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                            required
                                        />
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                        />
                                    </div>
                                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : (editingAsset ? 'Update Asset' : 'Add Asset')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:mt-0 sm:col-start-1 sm:text-sm"
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

export default Assets;
