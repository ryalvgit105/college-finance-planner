import React, { useState, useEffect } from 'react';
import { createAsset, getAssets } from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';

const Assets = () => {
    const { currentProfile } = useProfile();
    const [formData, setFormData] = useState({
        type: '',
        value: '',
        description: ''
    });
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingAssets, setFetchingAssets] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

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
            const response = await getAssets(currentProfile._id);
            setAssets(response.data || []);
        } catch (err) {
            console.error('Error fetching assets:', err);
        } finally {
            setFetchingAssets(false);
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
        if (!formData.type.trim()) {
            setError('Asset type is required');
            return;
        }
        if (!formData.value || parseFloat(formData.value) <= 0) {
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

            await createAsset(assetData);
            setSuccess('Asset added successfully!');

            // Reset form
            setFormData({
                type: '',
                value: '',
                description: ''
            });

            // Refresh assets list
            await fetchAssets();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.message || 'Failed to add asset. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const totalAssets = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Assets</h2>
                <p className="text-gray-600">Track your savings, investments, and valuable possessions</p>
            </div>

            {/* Add Asset Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Asset</h3>

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
                        {/* Asset Type */}
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                                Asset Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                                required
                            >
                                <option value="">Select asset type...</option>
                                <option value="Roth IRA">Roth IRA</option>
                                <option value="Traditional IRA">Traditional IRA</option>
                                <option value="401(k)">401(k)</option>
                                <option value="403(b)">403(b)</option>
                                <option value="Savings Account">Savings Account</option>
                                <option value="Checking Account">Checking Account</option>
                                <option value="Money Market">Money Market</option>
                                <option value="CD (Certificate of Deposit)">CD (Certificate of Deposit)</option>
                                <option value="Brokerage Account">Brokerage Account</option>
                                <option value="Real Estate">Real Estate</option>
                                <option value="Stocks">Stocks</option>
                                <option value="Bonds">Bonds</option>
                                <option value="Mutual Funds">Mutual Funds</option>
                                <option value="ETFs">ETFs</option>
                                <option value="Cryptocurrency">Cryptocurrency</option>
                                <option value="Vehicle">Vehicle</option>
                                <option value="Jewelry">Jewelry</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Asset Value */}
                        <div>
                            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                            placeholder="Additional details about this asset..."
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Adding Asset...' : 'Add Asset'}
                    </button>
                </form>
            </div>

            {/* Assets List */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Your Assets</h3>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold text-green-600">
                            ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

                {fetchingAssets ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600"></div>
                    </div>
                ) : assets.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="mt-2 text-gray-600">No assets yet. Add your first asset above!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assets.map((asset, index) => (
                            <div key={asset._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-gray-800">{asset.type}</h4>
                                    <span className="text-green-600 font-bold">
                                        ${asset.value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                </div>
                                {asset.description && (
                                    <p className="text-sm text-gray-600">{asset.description}</p>
                                )}
                                {asset.createdAt && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        Added {new Date(asset.createdAt).toLocaleDateString()}
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

export default Assets;
