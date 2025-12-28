import React, { useState, useEffect, useCallback } from 'react';
import {
    createInvestment, getInvestments, updateInvestment, deleteInvestment,
    getSnapshotDetail, captureSnapshot
} from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';
import { useFinance } from '../context/FinanceContext';
import TrackerLayout from '../components/TrackerLayout';
import { LuPlus, LuPencil, LuTrash2, LuX, LuInfo, LuTrendingUp } from 'react-icons/lu';
import { Link } from 'react-router-dom';

const InvestmentsPage = () => {
    // Force re-compile
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
    const [localInvestments, setLocalInvestments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSnapshotView, setIsSnapshotView] = useState(false);

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

    const REAL_MONTH = new Date().getMonth();
    const REAL_YEAR = new Date().getFullYear();

    // -- Data Fetching --

    const fetchLiveInvestments = useCallback(async () => {
        if (!currentProfile) return;
        setLoading(true);
        try {
            const res = await getInvestments(currentProfile._id);
            setLocalInvestments(res.data?.data || []);
            setIsSnapshotView(false);
        } catch (err) {
            console.error('Error fetching live investments:', err);
            setError('Failed to load investments.');
        } finally {
            setLoading(false);
        }
    }, [currentProfile]);

    const fetchSnapshotData = useCallback(async (month, year) => {
        if (!currentProfile) return;
        setLoading(true);
        try {
            const res = await getSnapshotDetail(currentProfile._id, month + 1, year, 'investment');
            if (res.data && res.data.items) {
                setLocalInvestments(res.data.items);
                setIsSnapshotView(true);
            } else {
                setLocalInvestments([]);
                setIsSnapshotView(true);
            }
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setLocalInvestments([]);
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
            fetchSnapshotHistory('investment', currentYear, currentProfile._id);
        }
    }, [currentProfile, currentYear, fetchSnapshotHistory]);

    useEffect(() => {
        if (!currentProfile) return;

        if (currentMonth === null) {
            fetchSnapshotHistory('investment', currentYear, currentProfile._id);
            if (currentYear === REAL_YEAR) {
                fetchLiveInvestments();
            }
        } else {
            const isPast = (currentYear < REAL_YEAR) || (currentYear === REAL_YEAR && currentMonth < REAL_MONTH);
            if (isPast) {
                fetchSnapshotData(currentMonth, currentYear);
            } else {
                fetchLiveInvestments();
            }
        }
    }, [currentProfile, currentMonth, currentYear, fetchSnapshotHistory, fetchLiveInvestments, fetchSnapshotData, REAL_MONTH, REAL_YEAR]);

    // -- Handlers --

    const handleCloseMonth = async () => {
        if (!currentProfile) return;
        if (!window.confirm('Save snapshot of current investments?')) return;

        try {
            await captureSnapshot({
                profileId: currentProfile._id,
                month: currentMonth + 1,
                year: currentYear,
                type: 'investment'
            });
            setSuccess('Investment snapshot saved!');
            setTimeout(() => setSuccess(null), 3000);
            fetchSnapshotHistory('investment', currentYear, currentProfile._id);
        } catch (err) {
            setError('Failed to save snapshot.');
        }
    };

    const handleOpenModal = (investment = null) => {
        if (investment) {
            setEditingInvestment(investment);
            setFormData({
                name: investment.name || '',
                type: investment.type || investment.assetType || 'Stock',
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
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingInvestment(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentProfile) return;

        // Validation
        if (!formData.name.trim()) { setError('Name required'); return; }
        if (parseFloat(formData.currentValue) < 0) { setError('Value cannot be negative'); return; }

        setLoading(true);
        try {
            const taxMapping = { 'Taxable': 'taxable', 'Tax-Deferred': 'tax_deferred', 'Tax-Free': 'tax_free' };
            const investmentData = {
                profileId: currentProfile._id,
                name: formData.name.trim(),
                assetType: formData.type, // Assuming FE select matches BE expectations or we map it
                currentValue: parseFloat(formData.currentValue) || 0,
                contributionPerMonth: parseFloat(formData.contributionPerMonth) || 0,
                expectedAnnualReturn: parseFloat(formData.expectedAnnualReturn) || 0,
                taxTreatment: taxMapping[formData.taxTreatment] || 'taxable',
                startYearOffset: parseInt(formData.startYearOffset) || 0,
                endYearOffset: parseInt(formData.endYearOffset) || 0
            };

            if (editingInvestment) {
                await updateInvestment(editingInvestment._id, investmentData);
            } else {
                await createInvestment(investmentData);
            }
            handleCloseModal();
            fetchLiveInvestments();
            setSuccess('Saved!');
        } catch (err) {
            setError('Failed to save.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this investment?')) return;
        try {
            await deleteInvestment(id);
            fetchLiveInvestments();
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

    const handleMonthClick = (m) => setCurrentMonth(m);
    const handleBackToYearly = () => setCurrentMonth(null);

    // Calculate Totals for Display
    const currentTotalValue = localInvestments.reduce((sum, item) => sum + (Number(item.currentValue) || 0), 0);

    // Merge Live Data into History for Visualization
    const displayHistory = [...snapshotHistory];
    if (currentYear === REAL_YEAR) {
        displayHistory[REAL_MONTH] = currentTotalValue;
    }

    return (
        <TrackerLayout
            title="Investments"
            subtitle="Watch your portfolio grow"
            type="investment"
            year={currentYear}
            month={currentMonth}
            onNavigateMonth={handleNavigateMonth}
            onMonthClick={handleMonthClick}
            onBackToYearly={handleBackToYearly}
            totalAnnualValue={currentTotalValue}
            monthlyHistory={displayHistory}
        >
            {/* Actions */}
            {!isSnapshotView && (
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                    <div className="text-sm text-gray-600">
                        Track your portfolio performance. Close the month to save a valuation snapshot.
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
                            className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 shadow-sm"
                        >
                            <LuPlus className="mr-1" /> Add Investment
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
                        {isSnapshotView ? 'Historical Portfolio' : 'Current Portfolio'}
                    </h3>
                    <div className="text-right">
                        <div className="text-sm text-gray-500">Total Value</div>
                        <div className="text-lg font-bold text-indigo-600">
                            ${currentTotalValue.toLocaleString()}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : localInvestments.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <LuTrendingUp className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        No investments found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                                    {!isSnapshotView && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Contrib./Mo</th>}
                                    {!isSnapshotView && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Return</th>}
                                    {!isSnapshotView && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {localInvestments.map((item, idx) => (
                                    <tr key={item._id || idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                                                {item.type || item.assetType || item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                            ${(item.currentValue || item.value || 0).toLocaleString()}
                                        </td>
                                        {!isSnapshotView && (
                                            <>
                                                <td className="px-6 py-4 text-right text-sm text-gray-500">
                                                    ${(item.contributionPerMonth || 0).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm text-gray-500">
                                                    {item.expectedAnnualReturn}%
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-900 mr-3"><LuPencil /></button>
                                                    <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900"><LuTrash2 /></button>
                                                </td>
                                            </>
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
                            <h3 className="text-lg font-bold">{editingInvestment ? 'Edit Investment' : 'Add Investment'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-white"><LuX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Type</label>
                                    <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
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
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Current Value ($)</label>
                                    <input type="number" name="currentValue" value={formData.currentValue} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Monthly Contribution ($)</label>
                                    <input type="number" name="contributionPerMonth" value={formData.contributionPerMonth} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Expected Return (%)</label>
                                    <input type="number" name="expectedAnnualReturn" value={formData.expectedAnnualReturn} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" step="0.1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-300">Tax Treatment</label>
                                    <select name="taxTreatment" value={formData.taxTreatment} onChange={handleChange} className="w-full border border-gray-600 bg-gray-700 text-white rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                        <option value="Taxable">Taxable</option>
                                        <option value="Tax-Deferred">Tax-Deferred</option>
                                        <option value="Tax-Free">Tax-Free</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </TrackerLayout>
    );
};

export default InvestmentsPage;
