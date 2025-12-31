import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    createInvestment, getInvestments, updateInvestment, deleteInvestment,
    getSnapshotDetail, captureSnapshot
} from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';
import { useFinance } from '../context/FinanceContext';
import TrackerLayout from '../components/TrackerLayout';
import { LuPlus, LuPencil, LuTrash2, LuX, LuInfo, LuTrendingUp, LuActivity } from 'react-icons/lu';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
                <p className="text-slate-200 font-medium">{payload[0].name}</p>
                <p className="text-emerald-400 font-bold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(payload[0].value)}
                </p>
            </div>
        );
    }
    return null;
};

const InvestmentsPage = () => {
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
            setTimeout(() => setSuccess(null), 3000);
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
            setTimeout(() => setSuccess(null), 3000);
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
    const currentTotalValue = localInvestments.reduce((sum, item) => sum + (Number(item.currentValue) || 0), 0);

    // Merge Live Data into History for Visualization
    const displayHistory = [...snapshotHistory];
    if (currentYear === REAL_YEAR) {
        displayHistory[REAL_MONTH] = currentTotalValue;
    }

    // Restriction Logic
    const allowNextYear = currentYear < REAL_YEAR;
    const allowNextMonth = currentYear < REAL_YEAR || (currentYear === REAL_YEAR && currentMonth < REAL_MONTH);

    // -- Derived Data for Charts --
    const allocationData = useMemo(() => {
        const typeMap = {};
        localInvestments.forEach(item => {
            const types = item.type || item.assetType || 'Other';
            const val = Number(item.currentValue) || 0;
            typeMap[types] = (typeMap[types] || 0) + val;
        });
        return Object.entries(typeMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [localInvestments]);

    return (
        <TrackerLayout
            title="Investments"
            subtitle="Watch your portfolio grow"
            type="investment"
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
                <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-6 backdrop-blur-sm">
                    <div className="text-sm text-slate-400">
                        Track your portfolio performance. Close the month to save a valuation snapshot.
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCloseMonth}
                            className="inline-flex items-center px-4 py-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700 hover:bg-slate-700 hover:text-white transition-all text-sm font-medium shadow-sm"
                        >
                            Save Snapshot
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all text-sm font-medium"
                        >
                            <LuPlus className="mr-2" /> Add Investment
                        </button>
                    </div>
                </div>
            )}

            {isSnapshotView && (
                <div className="bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r shadow-sm mb-6 flex">
                    <LuInfo className="h-5 w-5 text-amber-500 mr-3" />
                    <p className="text-sm text-amber-200/80">Historical Snapshot View (Read-only)</p>
                </div>
            )}

            {success && <div className="p-4 bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 rounded-lg mb-6 flex items-center animate-fade-in"><LuTrendingUp className="mr-2" />{success}</div>}
            {error && <div className="p-4 bg-rose-900/30 border border-rose-500/30 text-rose-400 rounded-lg mb-6">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Table */}
                <div className="lg:col-span-2 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                <LuTrendingUp size={20} />
                            </div>
                            <h3 className="font-bold text-slate-100 text-lg">
                                {isSnapshotView ? 'Historical Portfolio' : 'Current Holdings'}
                            </h3>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Total Value</div>
                            <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                ${currentTotalValue.toLocaleString()}
                            </div>
                        </div>
                    </div>



                    {loading ? (
                        <div className="p-12 text-center text-slate-500 animate-pulse">Loading investments...</div>
                    ) : localInvestments.length === 0 ? (
                        <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-600">
                                <LuTrendingUp size={32} />
                            </div>
                            <p>No investments found for this period.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-800/50">
                                <thead className="bg-slate-950/30">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Value</th>
                                        {!isSnapshotView && <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Contrib.</th>}
                                        {!isSnapshotView && <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">APY</th>}
                                        {!isSnapshotView && <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {localInvestments.map((item, idx) => (
                                        <tr key={item._id || idx} className="hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-slate-200">{item.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-indigo-300 border border-slate-700 capitalize">
                                                    {item.type || item.assetType || item.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-emerald-400">
                                                ${(item.currentValue || item.value || 0).toLocaleString()}
                                            </td>
                                            {!isSnapshotView && (
                                                <>
                                                    <td className="px-6 py-4 text-right text-sm text-slate-400 hidden sm:table-cell">
                                                        ${(item.contributionPerMonth || 0).toLocaleString()}
                                                        <span className='text-xs text-slate-600 block'>/mo</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-slate-400 hidden sm:table-cell">
                                                        <span className="bg-slate-800 px-2 py-1 rounded text-xs">{item.expectedAnnualReturn}%</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleOpenModal(item)}
                                                            className="p-2 text-sky-400 hover:text-sky-300 hover:bg-sky-400/10 rounded-lg transition-colors mr-1"
                                                            title="Edit"
                                                        >
                                                            <LuPencil size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item._id)}
                                                            className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <LuTrash2 size={16} />
                                                        </button>
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

                {/* Allocation Chart */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 flex-1 min-h-[300px]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <LuActivity size={20} />
                            </div>
                            <h3 className="font-bold text-slate-100 text-lg">Asset Allocation</h3>
                        </div>

                        {localInvestments.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={allocationData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {allocationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            layout="horizontal"
                                            verticalAlign="bottom"
                                            align="center"
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '20px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                                <p>Add investments to see allocation</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900 rounded-2xl shadow-xl border border-indigo-500/20 p-6">
                        <h4 className="text-slate-200 font-semibold mb-2">Portfolio Insight</h4>
                        <p className="text-slate-400 text-sm">
                            Your portfolio is currently distributed across <span className="text-white font-bold">{allocationData.length}</span> asset classes.
                            Ensure you're diversified to minimize risk.
                        </p>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-slate-900 text-slate-200 rounded-2xl shadow-2xl border border-slate-800 max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                                {editingInvestment ? 'Edit Investment' : 'Add Investment'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full">
                                <LuX size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. Apple Stock"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Current Value ($)</label>
                                    <input
                                        type="number"
                                        name="currentValue"
                                        value={formData.currentValue}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Monthly Contribution ($)</label>
                                    <input
                                        type="number"
                                        name="contributionPerMonth"
                                        value={formData.contributionPerMonth}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Expected Return (%)</label>
                                    <input
                                        type="number"
                                        name="expectedAnnualReturn"
                                        value={formData.expectedAnnualReturn}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        step="0.1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Tax Treatment</label>
                                    <select
                                        name="taxTreatment"
                                        value={formData.taxTreatment}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="Taxable">Taxable</option>
                                        <option value="Tax-Deferred">Tax-Deferred</option>
                                        <option value="Tax-Free">Tax-Free</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/25 transition-all font-medium"
                                >
                                    Save Investment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </TrackerLayout>
    );
};

export default InvestmentsPage;
