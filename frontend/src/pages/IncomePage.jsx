import React, { useState, useEffect, useCallback } from 'react';
import {
    createIncome, getIncome, updateIncome, deleteIncome,
    getSnapshotDetail, captureSnapshot
} from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';
import { useFinance } from '../context/FinanceContext';
import TrackerLayout from '../components/TrackerLayout';
import { LuPlus, LuPencil, LuTrash2, LuX, LuInfo, LuBriefcase } from 'react-icons/lu';
import { Link } from 'react-router-dom';

const Income = () => {
    // Force re-compile
    // Contexts
    const { currentProfile, updateProfile } = useProfile();
    const {
        snapshotHistory,
        fetchSnapshotHistory,
        currentMonth,
        setCurrentMonth,
        currentYear,
        setCurrentYear,
        fetchLiveIncomeContext
    } = useFinance();

    // Local State
    const [localIncomes, setLocalIncomes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSnapshotView, setIsSnapshotView] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSourceManagerOpen, setIsSourceManagerOpen] = useState(false);
    const [newSource, setNewSource] = useState('');
    const [editingIncome, setEditingIncome] = useState(null);
    const [formData, setFormData] = useState({
        currentIncome: '',
        incomeSources: '',
        educationRequired: '',
        notes: ''
    });

    const REAL_MONTH = new Date().getMonth();
    const REAL_YEAR = new Date().getFullYear();

    // -- Data Fetching --

    const fetchLiveIncome = useCallback(async () => {
        if (!currentProfile) return;
        setLoading(true);
        try {
            const res = await getIncome(currentProfile._id);
            // getIncome returns sorted list.
            const list = Array.isArray(res.data?.data) ? res.data?.data : (res.data?.data ? [res.data?.data] : []);
            setLocalIncomes(list);
            // Sync global context for other pages
            if (currentProfile?._id) {
                fetchLiveIncomeContext(currentProfile._id);
            }
            setIsSnapshotView(false);
        } catch (err) {
            console.error('Error fetching live income:', err);
            setError('Failed to load income.');
        } finally {
            setLoading(false);
        }
    }, [currentProfile]);

    const fetchSnapshotData = useCallback(async (month, year) => {
        if (!currentProfile) return;
        setLoading(true);
        try {
            const res = await getSnapshotDetail(currentProfile._id, month + 1, year, 'income');
            if (res.data && res.data.items) {
                setLocalIncomes(res.data.items);
                setIsSnapshotView(true);
            } else {
                setLocalIncomes([]);
                setIsSnapshotView(true);
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setLocalIncomes([]);
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

    // Reset to current year on mount
    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, [setCurrentYear]);

    useEffect(() => {
        if (currentProfile) {
            fetchSnapshotHistory('income', currentYear, currentProfile._id);
        }
    }, [currentProfile, currentYear, fetchSnapshotHistory]);

    useEffect(() => {
        if (!currentProfile) return;

        if (currentMonth === null) {
            fetchSnapshotHistory('income', currentYear, currentProfile._id);
            if (currentYear === REAL_YEAR) {
                fetchLiveIncome();
            }
        } else {
            const isPast = (currentYear < REAL_YEAR) || (currentYear === REAL_YEAR && currentMonth < REAL_MONTH);
            if (isPast) {
                fetchSnapshotData(currentMonth, currentYear);
            } else {
                fetchLiveIncome();
            }
        }
    }, [currentProfile, currentMonth, currentYear, fetchSnapshotHistory, fetchLiveIncome, fetchSnapshotData, REAL_MONTH, REAL_YEAR]);


    // -- Handlers --

    // Manage Sources Handlers
    const handleAddSource = async () => {
        if (!newSource.trim() || !currentProfile) return;

        // Clean and deduplicate existing sources
        const currentSources = [...new Set(currentProfile.incomeSources || [])];
        const sourceToAdd = newSource.trim();

        if (currentSources.includes(sourceToAdd)) return;

        const updatedSources = [...currentSources, sourceToAdd];
        const res = await updateProfile(currentProfile._id, { incomeSources: updatedSources });

        if (res.success) {
            setNewSource('');
            setSuccess('Source added.');
            setTimeout(() => setSuccess(null), 2000);
        } else {
            setError('Failed to add source.');
        }
    };

    const handleDeleteSource = async (sourceToDelete) => {
        if (!currentProfile) return;

        // Clean and deduplicate existing sources before filtering
        const currentSources = [...new Set(currentProfile.incomeSources || [])];
        const updatedSources = currentSources.filter(s => s !== sourceToDelete);

        const res = await updateProfile(currentProfile._id, { incomeSources: updatedSources });
        if (res.success) {
            setSuccess('Source removed.');
            setTimeout(() => setSuccess(null), 2000);
        } else {
            setError('Failed to remove source.');
        }
    };

    const handleCloseMonth = async () => {
        if (!currentProfile) return;
        if (!window.confirm('Save snapshot of current income setup?')) return;

        try {
            await captureSnapshot({
                profileId: currentProfile._id,
                month: currentMonth + 1,
                year: currentYear,
                type: 'income'
            });
            setSuccess('Income snapshot saved!');
            setTimeout(() => setSuccess(null), 3000);
            // Refresh history
            fetchSnapshotHistory('income', currentYear, currentProfile._id);
        } catch (err) {
            setError('Failed to save snapshot.');
        }
    };

    const handleOpenModal = (income = null) => {
        if (income) {
            setEditingIncome(income);
            setFormData({
                currentIncome: income.currentIncome || '',
                incomeSources: income.incomeSources ? income.incomeSources.join(', ') : '',
                educationRequired: income.educationRequired || '',
                notes: income.notes || ''
            });
        } else {
            setEditingIncome(null);
            setFormData({
                currentIncome: '',
                incomeSources: '',
                educationRequired: '',
                notes: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingIncome(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentProfile) return;
        setLoading(true);
        try {
            const incomeData = {
                profileId: currentProfile._id,
                currentIncome: parseFloat(formData.currentIncome),
                incomeSources: formData.incomeSources.split(',').map(s => s.trim()).filter(s => s),
                educationRequired: formData.educationRequired.trim(),
                notes: formData.notes.trim()
            };

            if (editingIncome) {
                await updateIncome(editingIncome._id, incomeData);
            } else {
                await createIncome(incomeData);
            }
            handleCloseModal();
            fetchLiveIncome();
            fetchLiveIncomeContext(currentProfile._id);
            setSuccess('Saved!');
        } catch (err) {
            setError('Failed to save.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        console.log('Attempting to delete income with ID:', id);
        // Temporarily removing confirm to debug user issue
        // if (!window.confirm('Delete this record?')) return;

        try {
            await deleteIncome(id);
            console.log('Delete successful for ID:', id);
            fetchLiveIncome();
            fetchLiveIncomeContext(currentProfile._id);
            setSuccess('Deleted.');
        } catch (err) {
            console.error('Delete failed:', err);
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

    const handleMonthClick = useCallback((m) => setCurrentMonth(m), []);
    const handleBackToYearly = useCallback(() => setCurrentMonth(null), []);

    // Calculate Totals for Display
    const currentTotalValue = localIncomes.reduce((sum, item) => sum + (Number(item.currentIncome) || 0), 0);

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
            title="Income"
            subtitle="Track your earnings and career growth"
            type="income"
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
            {/* Actions */}
            {!isSnapshotView && (
                <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-6">
                    <div className="text-sm text-slate-400">
                        Manage your income records. Only the latest record is typically used for snapshots.
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCloseMonth}
                            className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 shadow-sm"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => setIsSourceManagerOpen(true)}
                            className="inline-flex items-center px-3 py-2 bg-slate-700 text-white rounded text-sm hover:bg-slate-600 shadow-sm border border-slate-600"
                        >
                            Manage Sources
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 shadow-sm"
                        >
                            <LuPlus className="mr-1" /> Add Income
                        </button>
                    </div>
                </div>
            )}

            {isSnapshotView && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow-sm mb-6 flex">
                    <LuInfo className="h-5 w-5 text-yellow-400 mr-3" />
                    <p className="text-sm text-yellow-700">Historical Snapshot View (Read-only)</p>
                </div>
            )}

            {success && <div className="p-3 bg-green-100 text-green-700 rounded mb-4">{success}</div>}
            {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

            <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h3 className="font-semibold text-slate-100">
                        {isSnapshotView ? 'Historical Income' : 'Income Records'}
                    </h3>
                    <span className="font-bold text-emerald-400 text-lg">
                        ${currentTotalValue.toLocaleString()}
                    </span>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading...</div>
                ) : localIncomes.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <LuBriefcase className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                        No income records found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-800">
                            <thead className="bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Sources/Description</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Monthly Amount</th>
                                    {!isSnapshotView && <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="bg-slate-900 divide-y divide-slate-800">
                                {localIncomes.map((item, idx) => (
                                    <tr key={item._id || idx} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {/* Logic for handling Source vs Description vs Name from snapshot */}
                                            {isSnapshotView ? (
                                                <div>
                                                    <div className="font-medium text-slate-200">{item.name}</div>
                                                    <div className="text-xs text-slate-500">{item.description}</div>
                                                </div>
                                            ) : (
                                                <div>
                                                    {(item.incomeSources && item.incomeSources.length > 0) ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {item.incomeSources.map((s, i) => (
                                                                <span key={i} className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700">{s}</span>
                                                            ))}
                                                        </div>
                                                    ) : '-'}
                                                    {item.notes && <div className="text-xs text-slate-500 mt-1">{item.notes}</div>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-emerald-400">
                                            ${(item.currentIncome || item.value || 0).toLocaleString()}
                                        </td>
                                        {!isSnapshotView && (
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="text-sky-400 hover:text-sky-300 mr-3"
                                                    disabled={!item._id}
                                                >
                                                    <LuPencil />
                                                </button>
                                                {item._id ? (
                                                    <button onClick={() => handleDelete(item._id)} className="text-rose-400 hover:text-rose-300"><LuTrash2 /></button>
                                                ) : (
                                                    <span className="text-slate-600 cursor-not-allowed"><LuTrash2 /></span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-gray-800 text-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">{editingIncome ? 'Edit Income' : 'Add Income'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-white"><LuX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Monthly Income ($)</label>
                                    <input type="number" name="currentIncome" value={formData.currentIncome} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Sources</label>
                                    <input type="text" name="incomeSources" value={formData.incomeSources} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Job, Freelance..." />
                                    {/* Saved Sources Chips */}
                                    {currentProfile?.incomeSources?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {[...new Set(currentProfile.incomeSources)].map(source => (
                                                <button
                                                    key={source}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = formData.incomeSources ? formData.incomeSources.split(',').map(s => s.trim()) : [];
                                                        if (!current.includes(source)) {
                                                            const newValue = current.length > 0 && current[0] !== '' ? [...current, source].join(', ') : source;
                                                            setFormData(prev => ({ ...prev, incomeSources: newValue }));
                                                        }
                                                    }}
                                                    className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full border border-slate-600 transition-colors"
                                                >
                                                    + {source}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-300">Notes</label>
                                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Sources Modal */}
            {isSourceManagerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-slate-900 border border-slate-700 text-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                            <h3 className="text-lg font-bold">Manage Sources</h3>
                            <button onClick={() => setIsSourceManagerOpen(false)} className="text-gray-400 hover:text-white"><LuX /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSource}
                                    onChange={(e) => setNewSource(e.target.value)}
                                    placeholder="New Source Name..."
                                    className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddSource()}
                                />
                                <button
                                    onClick={handleAddSource}
                                    disabled={!newSource.trim()}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm font-medium"
                                >
                                    Add
                                </button>
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {currentProfile?.incomeSources?.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No saved sources yet.</p>}
                                {[...new Set(currentProfile?.incomeSources || [])].map(source => (
                                    <div key={source} className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700">
                                        <span className="text-sm text-slate-300">{source}</span>
                                        <button onClick={() => handleDeleteSource(source)} className="text-xs text-rose-400 hover:text-rose-300 p-1 hover:bg-slate-700 rounded"><LuTrash2 /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </TrackerLayout>
    );
};

export default Income;
