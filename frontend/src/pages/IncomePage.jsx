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
    // Contexts
    const { currentProfile } = useProfile();
    const {
        snapshotHistory,
        fetchSnapshotHistory,
        currentMonth,
        setCurrentMonth,
        currentYear,
        setCurrentYear
    } = useFinance();

    // Local State
    const [localIncomes, setLocalIncomes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSnapshotView, setIsSnapshotView] = useState(false);

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

    const REAL_MONTH = new Date().getMonth();
    const REAL_YEAR = new Date().getFullYear();

    // -- Data Fetching --

    const fetchLiveIncome = useCallback(async () => {
        if (!currentProfile) return;
        setLoading(true);
        try {
            const res = await getIncome(currentProfile._id);
            // getIncome returns sorted list.
            const list = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
            setLocalIncomes(list);
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

    useEffect(() => {
        if (currentProfile) {
            fetchSnapshotHistory('income', currentYear, currentProfile._id);
        }
    }, [currentProfile, currentYear, fetchSnapshotHistory]);

    useEffect(() => {
        if (!currentProfile) return;

        if (currentMonth === null) {
            fetchSnapshotHistory('income', currentYear, currentProfile._id);
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
                careerGoal: formData.careerGoal.trim(),
                projectedSalary: formData.projectedSalary ? parseFloat(formData.projectedSalary) : 0,
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
            setSuccess('Saved!');
        } catch (err) {
            setError('Failed to save.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this record?')) return;
        try {
            await deleteIncome(id);
            fetchLiveIncome();
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

    // Calculate Total for Header (Live: Sum of currentIncomes? Snapshot: Sum of values)
    // For live income, if we have multiple entries, usually just the latest matters, but here we sum list for generic table logic.
    const totalIncome = localIncomes.reduce((sum, item) => sum + (item.currentIncome || item.value || 0), 0);

    return (
        <TrackerLayout
            title="Income"
            subtitle="Track your earnings and career goals"
            type="income"
            year={currentYear}
            month={currentMonth}
            onNavigateMonth={handleNavigateMonth}
            onMonthClick={(m) => setCurrentMonth(m)}
            onBackToYearly={() => setCurrentMonth(null)}
            totalAnnualValue={totalIncome}
            monthlyHistory={snapshotHistory}
        >
            {/* Actions */}
            {!isSnapshotView && (
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <div className="text-sm text-gray-600">
                        Manage your income records. Only the latest record is typically used for snapshots.
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCloseMonth}
                            className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 shadow-sm"
                        >
                            Close Month
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-semibold text-gray-800">
                        {isSnapshotView ? 'Historical Income' : 'Income Records'}
                    </h3>
                    <span className="font-bold text-blue-600 text-lg">
                        ${totalIncome.toLocaleString()}
                    </span>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : localIncomes.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <LuBriefcase className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        No income records found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sources/Description</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Annual Amount</th>
                                    {!isSnapshotView && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {localIncomes.map((item, idx) => (
                                    <tr key={item._id || idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            {/* Logic for handling Source vs Description vs Name from snapshot */}
                                            {isSnapshotView ? (
                                                <div>
                                                    <div className="font-medium text-gray-900">{item.name}</div>
                                                    <div className="text-xs text-gray-500">{item.description}</div>
                                                </div>
                                            ) : (
                                                <div>
                                                    {(item.incomeSources && item.incomeSources.length > 0) ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {item.incomeSources.map((s, i) => (
                                                                <span key={i} className="px-2 py-0.5 rounded text-xs bg-gray-100">{s}</span>
                                                            ))}
                                                        </div>
                                                    ) : '-'}
                                                    {item.notes && <div className="text-xs text-gray-500 mt-1">{item.notes}</div>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-green-600">
                                            ${(item.currentIncome || item.value || 0).toLocaleString()}
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">{editingIncome ? 'Edit Income' : 'Add Income'}</h3>
                            <button onClick={handleCloseModal}><LuX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Current Annual Income ($)</label>
                                    <input type="number" name="currentIncome" value={formData.currentIncome} onChange={handleChange} className="w-full border rounded p-2" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Sources (comma separated)</label>
                                    <input type="text" name="incomeSources" value={formData.incomeSources} onChange={handleChange} className="w-full border rounded p-2" placeholder="Job, Freelance..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Projected Salary ($)</label>
                                    <input type="number" name="projectedSalary" value={formData.projectedSalary} onChange={handleChange} className="w-full border rounded p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Career Goal</label>
                                    <input type="text" name="careerGoal" value={formData.careerGoal} onChange={handleChange} className="w-full border rounded p-2" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full border rounded p-2"></textarea>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </TrackerLayout>
    );
};

export default Income;
