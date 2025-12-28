import React, { useState, useEffect, useCallback } from 'react';
import {
    createDebt, getDebts, updateDebt, deleteDebt,
    getSnapshotDetail
} from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';
import { useFinance } from '../context/FinanceContext';
import TrackerLayout from '../components/TrackerLayout';
import { LuPlus, LuPencil, LuTrash2, LuX, LuInfo } from 'react-icons/lu';
import { Link } from 'react-router-dom';

const Debts = () => {
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
    const [localDebts, setLocalDebts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSnapshotView, setIsSnapshotView] = useState(false);

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

    // Time constants
    const REAL_MONTH = new Date().getMonth();
    const REAL_YEAR = new Date().getFullYear();

    // -- Data Fetching --

    const fetchLiveDebts = useCallback(async () => {
        if (!currentProfile) return;
        setLoading(true);
        try {
            const res = await getDebts(currentProfile._id);
            const list = res.data?.data || [];
            // Sort by balance desc
            list.sort((a, b) => b.balance - a.balance);
            setLocalDebts(list);
            setIsSnapshotView(false);
        } catch (err) {
            console.error('Error fetching live debts:', err);
            setError('Failed to load debts.');
        } finally {
            setLoading(false);
        }
    }, [currentProfile]);

    const fetchSnapshotData = useCallback(async (month, year) => {
        if (!currentProfile) return;
        setLoading(true);
        try {
            const res = await getSnapshotDetail(currentProfile._id, month + 1, year, 'debt');
            if (res.data && res.data.items) {
                setLocalDebts(res.data.items);
                setIsSnapshotView(true);
            } else {
                setLocalDebts([]);
                setIsSnapshotView(true);
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setLocalDebts([]);
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

    // 1. Load History
    useEffect(() => {
        if (currentProfile) {
            fetchSnapshotHistory('debt', currentYear, currentProfile._id);
        }
    }, [currentProfile, currentYear, fetchSnapshotHistory]);

    // 2. Load View Data
    useEffect(() => {
        if (!currentProfile) return;

        if (currentMonth === null) {
            // Yearly View - refresh history AND live data for overlay
            fetchSnapshotHistory('debt', currentYear, currentProfile._id);
            if (currentYear === REAL_YEAR) {
                fetchLiveDebts();
            }
        } else {
            const isPast = (currentYear < REAL_YEAR) || (currentYear === REAL_YEAR && currentMonth < REAL_MONTH);
            if (isPast) {
                fetchSnapshotData(currentMonth, currentYear);
            } else {
                fetchLiveDebts();
            }
        }
    }, [currentProfile, currentMonth, currentYear, fetchSnapshotHistory, fetchLiveDebts, fetchSnapshotData, REAL_MONTH, REAL_YEAR]);

    // -- Handlers --

    const handleCloseMonth = async () => {
        if (!currentProfile) return;
        if (!window.confirm('Save snapshot of current debts?')) return;

        try {
            await captureSnapshot('debt', currentProfile._id);
            setSuccess('Snapshot saved!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to save snapshot.');
        }
    };

    const handleOpenModal = (debt = null) => {
        if (debt) {
            setEditingDebt(debt);
            setFormData({
                type: debt.type,
                balance: debt.balance || debt.value, // Handle snapshot field mapping if needed
                interestRate: debt.interestRate || '',
                monthlyPayment: debt.monthlyPayment || '',
                description: debt.description || debt.name || ''
            });
        } else {
            setEditingDebt(null);
            setFormData({ type: '', balance: '', interestRate: '', monthlyPayment: '', description: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDebt(null);
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentProfile) return;
        setLoading(true);
        try {
            const data = {
                profileId: currentProfile._id,
                type: formData.type,
                balance: parseFloat(formData.balance),
                interestRate: formData.interestRate ? parseFloat(formData.interestRate) : 0,
                monthlyPayment: formData.monthlyPayment ? parseFloat(formData.monthlyPayment) : 0,
                description: formData.description
            };

            if (editingDebt) {
                await updateDebt(editingDebt._id, data);
            } else {
                await createDebt(data);
            }
            handleCloseModal();
            fetchLiveDebts();
            setSuccess('Saved!');
        } catch (err) {
            setError('Failed to save.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete debt?')) return;
        try {
            await deleteDebt(id);
            fetchLiveDebts();
            setSuccess('Deleted.');
        } catch (err) {
            setError('Failed to delete.');
        }
    };

    const handleNavigateMonth = (direction) => {
        if (direction === 'prev') {
            if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        } else {
            if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        }
    };

    const handleNavigateYear = (direction) => {
        setCurrentYear(direction === 'next' ? currentYear + 1 : currentYear - 1);
    };

    const handleMonthClick = (m) => setCurrentMonth(m);
    const handleBackToYearly = () => setCurrentMonth(null);

    // Calculate Totals for Display
    const currentTotalValue = localDebts.reduce((sum, item) => sum + (Number(item.balance) || Number(item.value) || 0), 0);

    // Merge Live Data into History for Visualization
    const displayHistory = [...snapshotHistory];
    if (currentYear === REAL_YEAR) {
        displayHistory[REAL_MONTH] = currentTotalValue;
    }

    // Restriction Logic
    const allowNextYear = currentYear < REAL_YEAR;
    const allowNextMonth = currentYear < REAL_YEAR || (currentYear === REAL_YEAR && currentMonth < REAL_MONTH);

    return (
        <TrackerLayout
            title="Debts"
            subtitle="Manage and track your liabilities"
            type="debt"
            year={currentYear}
            month={currentMonth}
            onNavigateMonth={handleNavigateMonth}
            onNavigateYear={handleNavigateYear}
            allowNextYear={allowNextYear}
            allowNextMonth={allowNextMonth}
            onMonthClick={handleMonthClick}
            onBackToYearly={handleBackToYearly}
            totalAnnualValue={currentTotalValue}
            monthlyHistory={displayHistory}
        >
            {/* MONTHLY DETAIL CONTENT */}
            <div className="space-y-6">
                {/* Actions */}
                {!isSnapshotView && (
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-600">
                            Manage your current debts. Close the month to save history.
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleCloseMonth}
                                className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 shadow-sm"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => handleOpenModal()}
                                className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 shadow-sm"
                            >
                                <LuPlus className="mr-1" /> Add Debt
                            </button>
                        </div>
                    </div>
                )}

                {/* Info Alert */}
                {isSnapshotView && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm flex">
                        <LuInfo className="h-5 w-5 text-yellow-400 mr-3" />
                        <p className="text-sm text-yellow-700">Historical Snapshot View (Read-only)</p>
                    </div>
                )}

                {/* Feedback */}
                {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}
                {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-gray-800">
                            {isSnapshotView ? 'Historical Debts' : 'Current Debts'}
                        </h3>
                        <span className="font-bold text-red-600 text-lg">
                            ${currentTotalValue.toLocaleString()}
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading...</div>
                    ) : localDebts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No debts found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Payment</th>
                                        {!isSnapshotView && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {localDebts.map((item, idx) => (
                                        <tr key={item._id || idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                {item.description || item.name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                                                ${(item.balance || item.value || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-500">
                                                {item.interestRate || 0}%
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-500">
                                                ${(item.monthlyPayment || 0).toLocaleString()}
                                            </td>
                                            {!isSnapshotView && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-900 mr-3"><LuPencil /></button>
                                                    <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900"><LuTrash2 /></button>
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-gray-800 text-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">{editingDebt ? 'Edit Debt' : 'Add Debt'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-white"><LuX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" required>
                                    <option value="">Select...</option>
                                    <option value="Student Loan">Student Loan</option>
                                    <option value="Credit Card">Credit Card</option>
                                    <option value="Car Loan">Car Loan</option>
                                    <option value="Mortgage">Mortgage</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Balance</label>
                                    <input type="number" name="balance" value={formData.balance} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Rate (%)</label>
                                    <input type="number" name="interestRate" value={formData.interestRate} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" step="0.01" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Min Payment</label>
                                <input type="number" name="monthlyPayment" value={formData.monthlyPayment} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
                                <input type="text" name="description" value={formData.description} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </TrackerLayout>
    );
};

export default Debts;
