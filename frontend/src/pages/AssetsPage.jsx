import React, { useState, useEffect, useCallback } from 'react';
import {
    createAsset, getAssets, updateAsset, deleteAsset,
    getInvestments, deleteInvestment, getSnapshotDetail
} from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';
import { useFinance } from '../context/FinanceContext';
import TrackerLayout from '../components/TrackerLayout';
import { LuPlus, LuPencil, LuTrash2, LuX, LuInfo } from 'react-icons/lu';
import { Link } from 'react-router-dom';

const Assets = () => {
    // Contexts
    const { currentProfile } = useProfile();
    const {
        snapshotHistory,
        fetchSnapshotHistory,
        captureSnapshot,
        currentMonth,
        setCurrentMonth,
        currentYear,
        setCurrentYear
    } = useFinance();

    // Local State
    const [localAssets, setLocalAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSnapshotView, setIsSnapshotView] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [formData, setFormData] = useState({ type: '', value: '', description: '' });

    // Determine current real time
    const REAL_MONTH = new Date().getMonth();
    const REAL_YEAR = new Date().getFullYear();

    // -- Data Fetching --

    const fetchLiveAssets = useCallback(async () => {
        if (!currentProfile) return;
        setLoading(true);
        try {
            const [assetsRes, investmentsRes] = await Promise.all([
                getAssets(currentProfile._id),
                getInvestments(currentProfile._id)
            ]);

            const assetsList = assetsRes.data?.data || [];
            const investmentsList = (investmentsRes.data?.data || []).map(inv => ({
                ...inv,
                type: inv.assetType || inv.type,
                value: inv.currentValue,
                description: `Investment: ${inv.name}`,
                isInvestment: true
            }));

            // Combine and sort
            const unified = [...assetsList, ...investmentsList].sort((a, b) => b.value - a.value);
            setLocalAssets(unified);
            setIsSnapshotView(false);
        } catch (err) {
            console.error('Error fetching live assets:', err);
            setError('Failed to load assets.');
        } finally {
            setLoading(false);
        }
    }, [currentProfile]);

    const fetchSnapshotData = useCallback(async (month, year) => {
        if (!currentProfile) return;
        setLoading(true);
        try {
            const res = await getSnapshotDetail(currentProfile._id, month + 1, year, 'asset'); // API: 1-12
            if (res.data && res.data.items) {
                setLocalAssets(res.data.items); // Items already structured
                setIsSnapshotView(true);
            } else {
                setLocalAssets([]); // No snapshot found
                setIsSnapshotView(true);
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setLocalAssets([]); // Expected if no snapshot
                setIsSnapshotView(true);
            } else {
                console.error('Error fetching snapshot:', err);
                setError('Failed to load historical data.');
            }
        } finally {
            setLoading(false);
        }
    }, [currentProfile]);

    // -- Effects --

    // 1. Load History on Mount or Profile Change
    useEffect(() => {
        if (currentProfile) {
            fetchSnapshotHistory('asset', currentYear, currentProfile._id);
            // Default to Yearly view if fresh load? Or persist?
            // Context persists state, so we respect currentMonth
        }
    }, [currentProfile, currentYear, fetchSnapshotHistory]);

    // 2. Load Table Data based on Month Selection
    useEffect(() => {
        if (!currentProfile) return;

        if (currentMonth === null) {
            // Yearly View - fetch history AND live data for overlay
            fetchSnapshotHistory('asset', currentYear, currentProfile._id);
            if (currentYear === REAL_YEAR) {
                fetchLiveAssets();
            }
        } else {
            // Check if we are viewing "Live" (Current Month/Year)
            // OR Future (Live, but maybe projected later. For now, Future = Live)
            // Past = Snapshot.

            // Logic: If (Year < RealYear) OR (Year == RealYear AND Month < RealMonth) -> SNAPSHOT
            // Else -> LIVE

            const isPast = (currentYear < REAL_YEAR) || (currentYear === REAL_YEAR && currentMonth < REAL_MONTH);

            if (isPast) {
                fetchSnapshotData(currentMonth, currentYear);
            } else {
                fetchLiveAssets();
            }
        }
    }, [currentProfile, currentMonth, currentYear, fetchSnapshotHistory, fetchLiveAssets, fetchSnapshotData, REAL_MONTH, REAL_YEAR]);


    // -- Handlers --

    const handleCloseMonth = async () => {
        if (!currentProfile) return;
        if (!window.confirm('Are you sure you want to close this month? This will save a snapshot of your current assets.')) return;

        try {
            await captureSnapshot('asset', currentProfile._id);
            setSuccess('Month closed and snapshot saved!');
            setTimeout(() => setSuccess(null), 3000);
            // Optionally switch to next month?
            // setCurrentMonth(currentMonth + 1); // logic for December rollover needed
        } catch (err) {
            setError('Failed to close month.');
        }
    };

    // Modal Handlers (CRUD)
    const handleOpenModal = (asset = null) => {
        if (asset) {
            setEditingAsset(asset);
            setFormData({
                type: asset.type || asset.category, // Handle snapshot structure variation if needed (though live uses type)
                value: asset.value,
                description: asset.description || asset.name || ''
            });
        } else {
            setEditingAsset(null);
            setFormData({ type: '', value: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAsset(null);
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentProfile) {
            alert('Error: No profile selected. Please create a profile first.');
            return;
        }
        setLoading(true);
        try {
            const assetData = {
                profileId: currentProfile._id,
                type: formData.type,
                value: parseFloat(formData.value),
                description: formData.description
            };

            if (editingAsset) {
                // Determine if updating Asset or Investment?
                // For simplicity, this modal only handles 'Asset' type creation/updates for now.
                // Investments are managed separately.
                if (editingAsset.isInvestment) {
                    alert('Please manage investments in the Investment module.');
                } else {
                    await updateAsset(editingAsset._id, assetData);
                }
            } else {
                await createAsset(assetData);
            }
            fetchLiveAssets();
            handleCloseModal();
            fetchLiveAssets();
            setSuccess('Saved successfully!');
        } catch (err) {
            setError('Failed to save.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, isInvestment) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            if (isInvestment) await deleteInvestment(id);
            else await deleteAsset(id);
            fetchLiveAssets();
            setSuccess('Deleted.');
        } catch (err) {
            setError('Failed to delete.');
        }
    };

    // Helper for Navigation
    const handleNavigateMonth = (direction) => {
        if (direction === 'prev') {
            if (currentMonth === 0) {
                // Determine if we should go back a year? For now just loop or stop
                // Simple logic: Go to Dec of previous year
                setCurrentMonth(11);
                setCurrentYear(prev => prev - 1);
            } else {
                setCurrentMonth(prev => prev - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(prev => prev + 1);
            } else {
                setCurrentMonth(prev => prev + 1);
            }
        }
    };

    const handleNavigateYear = (direction) => {
        setCurrentYear(direction === 'next' ? currentYear + 1 : currentYear - 1);
    };

    const handleMonthClick = (monthIndex) => {
        setCurrentMonth(monthIndex);
    };

    const handleBackToYearly = () => {
        setCurrentMonth(null); // Switch to yearly view
        // Maybe refresh history?
        fetchSnapshotHistory('asset', currentYear, currentProfile._id);
    };

    // Calculate Totals for Display
    const currentTotalValue = localAssets.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

    // Merge Live Data into History for Visualization
    // If we are in the current year, show the LIVE value for the current month
    // instead of the (likely empty) snapshot value.
    // Merge Live Data into History for Visualization
    // If we are in the current year, show the LIVE value for the current month
    // instead of the (likely empty) snapshot value.
    const displayHistory = [...snapshotHistory];
    if (currentYear === REAL_YEAR) {
        displayHistory[REAL_MONTH] = currentTotalValue;
    }

    // Restriction Logic
    // Allow Next Year only if currentYear < REAL_YEAR
    const allowNextYear = currentYear < REAL_YEAR;

    // Allow Next Month only if:
    // 1. We are in a past year (e.g., 2023) -> Always allow
    // 2. We are in the current year AND currentMonth < REAL_MONTH -> Allow
    // 3. If we are in the current year AND currentMonth >= REAL_MONTH -> Block
    const allowNextMonth = currentYear < REAL_YEAR || (currentYear === REAL_YEAR && currentMonth < REAL_MONTH);

    return (
        <TrackerLayout
            title="Assets"
            subtitle="Track your savings, investments, and valuable possessions"
            type="asset"
            year={currentYear}
            month={currentMonth}
            onNavigateMonth={handleNavigateMonth}
            onNavigateYear={handleNavigateYear}
            allowNextYear={allowNextYear}
            allowNextMonth={allowNextMonth}
            onMonthClick={handleMonthClick}
            onBackToYearly={handleBackToYearly}
            totalAnnualValue={currentTotalValue} // Show current total in header
            monthlyHistory={displayHistory}
        >
            {/* MONTHLY DETAIL CONTENT */}
            <div className="space-y-6">

                {/* Actions Bar - Only show if NOT snapshot view (Live) */}
                {!isSnapshotView && (
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-600">
                            Create a snapshot of this month to lock in history.
                        </div>
                        <div className="flex gap-2">
                            <Link
                                to="/investments"
                                className="inline-flex items-center px-3 py-2 bg-white text-indigo-700 border border-indigo-200 rounded text-sm hover:bg-indigo-50 shadow-sm"
                            >
                                Manage Investments
                            </Link>
                            <button
                                onClick={handleCloseMonth}
                                className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 shadow-sm"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => handleOpenModal()}
                                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 shadow-sm"
                            >
                                <LuPlus className="mr-1" /> Add Asset
                            </button>
                        </div>
                    </div>
                )}

                {/* Info Alert for Snapshot View */}
                {isSnapshotView && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <LuInfo className="h-5 w-5 text-yellow-400" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    You are viewing a historical snapshot. Data is read-only.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages */}
                {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}
                {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-gray-800">
                            {isSnapshotView ? 'Historical Assets' : 'Current Assets'}
                        </h3>
                        <span className="font-bold text-green-600 text-lg">
                            ${currentTotalValue.toLocaleString()}
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : localAssets.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No assets found for this period.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                        {!isSnapshotView && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {localAssets.map((item, idx) => (
                                        <tr key={item._id || idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.isInvestment || item.category === 'investment' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'} capitalize`}>
                                                    {item.type || item.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {item.description || item.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                ${item.value?.toLocaleString()}
                                            </td>
                                            {!isSnapshotView && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-900 mr-3"><LuPencil /></button>
                                                    <button onClick={() => handleDelete(item._id, item.isInvestment)} className="text-red-600 hover:text-red-900"><LuTrash2 /></button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - Only available locally in this component not TrackerLayout */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-gray-800 text-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">{editingAsset ? 'Edit Asset' : 'Add Asset'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-white"><LuX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required>
                                    <option value="">Select...</option>
                                    <option value="Savings Account">Savings Account</option>
                                    <option value="Checking Account">Checking Account</option>
                                    <option value="Vehicle">Vehicle</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Value</label>
                                <input type="number" name="value" value={formData.value} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
                                <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </TrackerLayout>
    );
};

export default Assets;
