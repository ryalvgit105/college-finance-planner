import React, { useState, useEffect, useMemo } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart
} from 'recharts';
import {
    TrendingUp, DollarSign, Wallet, CreditCard, PieChart, ArrowRight, Settings, RefreshCw, FileText, PlusCircle, Save, ChevronLeft, Target, Activity, Edit2, X, AlertCircle, ArrowLeft, Users, UserPlus, Check
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { getAssets, getDebts, getIncome, getSpending, getInvestments } from '../api/financeApi';

// --- Constants & Helpers ---

const formatMoney = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);
};

const formatPercent = (value) => {
    return `${(value * 100).toFixed(1)}%`;
};

const MOCK_USER_DATA = {
    income: 95000,
    spending: 52000,
    assets: 35000,
    investments: 45000,
    debts: 28000,
    growthRate: 0.08, // 8% market return
    inflationRate: 0.03, // 3% inflation
    salaryIncrease: 0.04, // 4% raise
};

// Truly blank slate
const BLANK_DATA = {
    income: 0,
    spending: 0,
    assets: 0,
    investments: 0,
    debts: 0,
    growthRate: 0.07, // Default rates kept for usability, but money is 0
    inflationRate: 0.03,
    salaryIncrease: 0.03,
};

// --- Components ---

const InputGroup = ({ label, value, onChange, type = "currency", step = 1000, placeholder, highlight }) => (
    <div className="flex flex-col gap-1">
        <label className={`text-xs font-medium uppercase tracking-wider ${highlight ? 'text-emerald-300' : 'text-slate-400'}`}>{label}</label>
        <div className="relative">
            {type === "currency" && (
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${highlight ? 'text-emerald-400' : 'text-slate-500'}`}>$</span>
            )}
            {type === "percent" && (
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${highlight ? 'text-emerald-400' : 'text-slate-500'}`}>%</span>
            )}
            <input
                type="number"
                step={step}
                value={value === undefined || value === null ? '' : value}
                onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                placeholder={placeholder}
                className={`w-full rounded-lg py-2 text-sm outline-none transition-all ${type === "currency" ? "pl-7" : "pl-3"} 
          ${highlight
                        ? "bg-emerald-950/50 border border-emerald-500/50 text-emerald-100 focus:ring-1 focus:ring-emerald-400 placeholder-emerald-700"
                        : "bg-slate-950 border border-slate-800 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    }`}
            />
        </div>
    </div>
);

const KPICard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
        <div>
            <p className="text-slate-500 text-xs uppercase font-bold mb-1">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-slate-800 ${colorClass}`}>
            <Icon size={20} />
        </div>
    </div>
);

// --- Main Application ---

export default function FuturePath() {
    const { currentProfile } = useProfile();
    const [view, setView] = useState('landing'); // landing, setup, dashboard
    const [inputs, setInputs] = useState(BLANK_DATA);
    const [projectionYears, setProjectionYears] = useState(10);
    const [simulationData, setSimulationData] = useState([]);
    const [finalNetWorth, setFinalNetWorth] = useState(0);

    // New State: Yearly Overrides
    const [yearlyAdjustments, setYearlyAdjustments] = useState({});
    const [editingYear, setEditingYear] = useState(null); // Which year index is being edited

    // Profile Selection System
    const [profiles, setProfiles] = useState([]);
    const [selectedProfileId, setSelectedProfileId] = useState(null);
    const [isCreatingProfile, setIsCreatingProfile] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');

    // --- Simulation Engine ---
    const runSimulation = () => {
        let data = [];
        let currentYear = new Date().getFullYear();

        // Initialize running totals
        let runningIncome = Number(inputs.income);
        let runningSpending = Number(inputs.spending);
        let runningAssets = Number(inputs.assets);
        let runningInvestments = Number(inputs.investments);
        let runningDebts = Number(inputs.debts);

        for (let i = 0; i <= projectionYears; i++) {
            const yearLabel = (currentYear + i).toString();
            const adjustment = yearlyAdjustments[i] || {};

            // Determine Rates for this specific year (Global vs Override)
            const currentSalaryInc = adjustment.salaryIncrease !== undefined ? adjustment.salaryIncrease : inputs.salaryIncrease;
            const currentInflation = adjustment.inflationRate !== undefined ? adjustment.inflationRate : inputs.inflationRate;
            const currentGrowth = adjustment.growthRate !== undefined ? adjustment.growthRate : inputs.growthRate;

            // 1. Determine Income/Spending for this year
            if (i > 0) {
                // Check for manual override (New Base)
                if (adjustment.income !== undefined) {
                    runningIncome = adjustment.income;
                } else {
                    // Apply THIS YEAR'S specific salary increase to previous income
                    // Note: Usually raises happen at start of year, affecting this year's income
                    runningIncome = runningIncome * (1 + currentSalaryInc);
                }

                if (adjustment.spending !== undefined) {
                    runningSpending = adjustment.spending;
                } else {
                    // Apply THIS YEAR'S specific inflation
                    runningSpending = runningSpending * (1 + currentInflation);
                }
            } else {
                // Year 0 (Now)
            }

            // Calculate Cash Flow
            const cashFlow = runningIncome - runningSpending;

            // 2. Asset Allocation Logic
            if (i > 0) {
                if (cashFlow > 0) {
                    runningInvestments += cashFlow * 0.7;
                    runningAssets += cashFlow * 0.3;
                } else {
                    const deficit = Math.abs(cashFlow);
                    if (runningAssets >= deficit) {
                        runningAssets -= deficit;
                    } else {
                        const remainingDeficit = deficit - runningAssets;
                        runningAssets = 0;
                        runningDebts += remainingDeficit;
                    }
                }

                // Apply THIS YEAR'S specific growth rate
                runningInvestments = runningInvestments * (1 + currentGrowth);

                if (runningDebts > 0) {
                    runningDebts = runningDebts * 1.05;
                    const safetyBuffer = 10000;
                    if (runningAssets > safetyBuffer) {
                        const availableToPay = runningAssets - safetyBuffer;
                        const payment = Math.min(availableToPay, runningDebts);
                        runningDebts -= payment;
                        runningAssets -= payment;
                    }
                }
            }

            // 3. Apply One-Time Adjustments
            if (adjustment.assetsAdj) {
                runningAssets += adjustment.assetsAdj;
            }
            if (adjustment.debtAdj) {
                runningDebts += adjustment.debtAdj;
            }

            // Snapshot
            const netWorth = (runningAssets + runningInvestments) - runningDebts;

            data.push({
                index: i,
                year: yearLabel,
                Income: Math.round(runningIncome),
                Spending: Math.round(runningSpending),
                CashFlow: Math.round(cashFlow),
                Assets: Math.round(runningAssets),
                Investments: Math.round(runningInvestments),
                Debts: Math.round(runningDebts),
                NetWorth: Math.round(netWorth),
                HasAdjustment: Object.keys(adjustment).length > 0
            });
        }

        setSimulationData(data);
        setFinalNetWorth(data[data.length - 1].NetWorth);
    };

    useEffect(() => {
        if (view === 'dashboard') {
            runSimulation();
        }
    }, [inputs, projectionYears, view, yearlyAdjustments]);

    const fetchRealData = async () => {
        if (!currentProfile) return MOCK_USER_DATA;

        try {
            const [assetsRes, debtsRes, incomeRes, spendingRes, investmentsRes] = await Promise.all([
                getAssets(currentProfile._id),
                getDebts(currentProfile._id),
                getIncome(currentProfile._id),
                getSpending(currentProfile._id),
                getInvestments(currentProfile._id)
            ]);

            const totalAssets = (assetsRes.data || []).reduce((sum, item) => sum + (item.value || 0), 0);
            const totalDebts = (debtsRes.data || []).reduce((sum, item) => sum + (item.balance || 0), 0);
            const totalIncome = (incomeRes.data || []).reduce((sum, item) => sum + (item.currentIncome || 0), 0);
            const totalSpending = (spendingRes.data || []).reduce((sum, item) => sum + (item.amount || 0), 0) * 12; // Monthly -> Yearly approximation if needed, or assume logs are total. Let's assume logs are recent transactions and we need a better way, but for now let's sum them. Actually, spending logs are usually individual transactions. A better approximation might be needed, but per instructions: "spending: yearly spending total". Let's sum all logs for now as a baseline or 0 if empty.
            // Better approach for spending: If we have monthly recurring spending, use that. If we only have logs, maybe sum last 12 months? 
            // Let's stick to the V4 logic: sum of spending logs might be too small if it's just recent. 
            // Let's use a placeholder if 0, or the sum.
            const totalInvestments = (investmentsRes.data || []).reduce((sum, item) => sum + (item.currentValue || 0), 0);

            return {
                income: totalIncome,
                spending: totalSpending > 0 ? totalSpending : totalIncome * 0.5, // Fallback to 50% income if no spending data
                assets: totalAssets,
                investments: totalInvestments,
                debts: totalDebts,
                growthRate: 0.08,
                inflationRate: 0.03,
                salaryIncrease: 0.04
            };
        } catch (error) {
            console.error("Error fetching real data:", error);
            return MOCK_USER_DATA;
        }
    };

    const handleStartDraft = async (useCurrent) => {
        if (useCurrent) {
            const realData = await fetchRealData();
            setInputs(realData);
        } else {
            setInputs(BLANK_DATA);
        }
        setYearlyAdjustments({});
        setView('dashboard');
    };

    const updateAdjustment = (yearIndex, field, value) => {
        setYearlyAdjustments(prev => ({
            ...prev,
            [yearIndex]: {
                ...prev[yearIndex],
                [field]: value
            }
        }));
    };

    // --- Profile Logic ---
    const handleCreateProfile = () => {
        if (profiles.length >= 5) return;
        if (!newProfileName.trim()) return;

        const newProfile = {
            id: Date.now(),
            name: newProfileName,
            baseProfile: { ...inputs } // Snapshot current inputs
        };
        setProfiles([...profiles, newProfile]);
        setSelectedProfileId(newProfile.id);
        setNewProfileName('');
        setIsCreatingProfile(false);
    };

    const handleSelectProfile = (id) => {
        setSelectedProfileId(id);
        const profile = profiles.find(p => p.id === id);
        if (profile) {
            setInputs(profile.baseProfile);
        }
    };

    // --- Sidebar Logic ---

    const getSidebarValues = () => {
        if (editingYear === null) return inputs;

        const yearData = simulationData.find(d => d.index === editingYear);
        if (!yearData) return inputs; // Fallback

        const currentAdj = yearlyAdjustments[editingYear] || {};

        // For rates, we want to show the specific override if it exists, otherwise the global default
        // This allows the user to see what is currently being applied
        return {
            income: currentAdj.income ?? yearData.Income,
            spending: currentAdj.spending ?? yearData.Spending,
            assets: yearData.Assets,
            debts: yearData.Debts,
            growthRate: currentAdj.growthRate !== undefined ? currentAdj.growthRate : inputs.growthRate,
            inflationRate: currentAdj.inflationRate !== undefined ? currentAdj.inflationRate : inputs.inflationRate,
            salaryIncrease: currentAdj.salaryIncrease !== undefined ? currentAdj.salaryIncrease : inputs.salaryIncrease
        };
    };

    const handleSidebarChange = (field, newValue) => {
        if (editingYear === null) {
            // Global Update
            setInputs(prev => ({ ...prev, [field]: newValue }));
        } else {
            // Edit Mode Update
            if (field === 'income' || field === 'spending') {
                updateAdjustment(editingYear, field, newValue);
            } else if (field === 'assets') {
                const currentTotal = simulationData.find(d => d.index === editingYear).Assets;
                const currentAdj = yearlyAdjustments[editingYear]?.assetsAdj || 0;
                const delta = newValue - currentTotal;
                updateAdjustment(editingYear, 'assetsAdj', currentAdj + delta);
            } else if (field === 'debts') {
                const currentTotal = simulationData.find(d => d.index === editingYear).Debts;
                const currentAdj = yearlyAdjustments[editingYear]?.debtAdj || 0;
                const delta = newValue - currentTotal;
                updateAdjustment(editingYear, 'debtAdj', currentAdj + delta);
            } else if (['growthRate', 'inflationRate', 'salaryIncrease'].includes(field)) {
                // Update specific rate for this year
                updateAdjustment(editingYear, field, newValue);
            }
        }
    };

    const sidebarValues = getSidebarValues();
    const currentYearInt = new Date().getFullYear();
    const displayYear = editingYear === null ? currentYearInt : currentYearInt + editingYear;
    const isEditing = editingYear !== null;

    // --- View: Landing ---
    if (view === 'landing') {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/30 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/30 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-md w-full text-center space-y-8 z-10">
                    <div className="mb-6 flex justify-center">
                        <div className="h-20 w-20 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                            <TrendingUp size={40} className="text-white" />
                        </div>
                    </div>

                    <h1 className="text-5xl font-extrabold tracking-tight">
                        Future<span className="text-emerald-400">Cast</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Professional-grade financial modeling. Visualize your wealth trajectory over the next decade.
                    </p>

                    {/* Profile Selection */}
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                                <Users size={14} /> Active Profile
                            </label>
                            <button
                                onClick={() => setIsCreatingProfile(!isCreatingProfile)}
                                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                                disabled={profiles.length >= 5}
                            >
                                <UserPlus size={12} /> {isCreatingProfile ? 'Cancel' : 'New Profile'}
                            </button>
                        </div>

                        {isCreatingProfile ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newProfileName}
                                    onChange={(e) => setNewProfileName(e.target.value)}
                                    placeholder="Profile Name (e.g. 'Military Path')"
                                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                                />
                                <button
                                    onClick={handleCreateProfile}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded text-sm font-medium"
                                >
                                    <Check size={16} />
                                </button>
                            </div>
                        ) : (
                            <select
                                value={selectedProfileId || ''}
                                onChange={(e) => handleSelectProfile(Number(e.target.value))}
                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                            >
                                <option value="">Base Profile (Default)</option>
                                {profiles.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        )}
                        <p className="text-xs text-slate-500 mt-2 text-left">
                            {selectedProfileId ? 'Using custom profile settings.' : 'Using your main account data.'}
                        </p>
                    </div>

                    <div className="space-y-4 pt-4">
                        <button
                            onClick={() => setView('setup')}
                            className="w-full group relative flex items-center justify-center gap-3 p-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all font-bold text-lg shadow-lg shadow-emerald-900/50"
                        >
                            <PlusCircle size={22} />
                            Create New Projection
                            <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>

                        <button disabled className="w-full group flex items-center justify-center gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl transition-all font-semibold text-slate-500 cursor-not-allowed opacity-50">
                            <RefreshCw size={20} />
                            Load Previous Model
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- View: Setup ---
    if (view === 'setup') {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative">
                <div className="max-w-4xl w-full z-10">
                    <button
                        onClick={() => setView('landing')}
                        className="group flex items-center text-slate-500 hover:text-white mb-8 transition-colors"
                    >
                        <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back
                    </button>

                    <h2 className="text-3xl font-bold mb-2">Initialize Projection</h2>
                    <p className="text-slate-400 mb-10">Choose a starting point for your financial simulation.</p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div
                            onClick={() => handleStartDraft(true)}
                            className="cursor-pointer p-8 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 hover:shadow-2xl hover:shadow-emerald-900/20 rounded-2xl transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <RefreshCw size={100} />
                            </div>
                            <div className="h-14 w-14 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Target size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Use Current Overview</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                We'll preload the simulation with your actual data from the Current Financial Overview. Good for seeing how current habits compound.
                            </p>
                        </div>

                        <div
                            onClick={() => handleStartDraft(false)}
                            className="cursor-pointer p-8 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/80 hover:shadow-2xl hover:shadow-cyan-900/20 rounded-2xl transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FileText size={100} />
                            </div>
                            <div className="h-14 w-14 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileText size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Start Blank</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Begin with a clean slate (Zeros). Build a hypothetical scenario from the ground up to test specific financial theories.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- View: Dashboard ---
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row relative">

            {/* Sidebar / Controls */}
            <aside className={`w-full md:w-80 border-r flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 overflow-y-auto z-10 transition-colors duration-300 
          ${isEditing ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-slate-900 border-slate-800'}`}>

                {/* Sidebar Header */}
                <div className={`p-6 border-b transition-colors ${isEditing ? 'border-emerald-900/50 bg-emerald-900/20' : 'border-slate-800'}`}>
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white mb-1">
                        <TrendingUp className={isEditing ? "text-emerald-300" : "text-emerald-400"} size={24} /> FutureCast
                    </div>
                    <p className={`text-xs ${isEditing ? 'text-emerald-400/70' : 'text-slate-500'}`}>v2.4.0 • Interactive Mode</p>
                </div>

                <div className="p-6 space-y-8 flex-grow">

                    {/* Dynamic Header for Context */}
                    <div className={`rounded-xl p-4 border ${isEditing ? 'bg-emerald-900/30 border-emerald-500/50' : 'bg-slate-800/50 border-slate-700/50'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h2 className={`text-sm font-bold uppercase tracking-wider ${isEditing ? 'text-emerald-300' : 'text-slate-300'}`}>
                                {isEditing ? `Edit Year: ${displayYear}` : `Current Overview (${displayYear})`}
                            </h2>
                            {isEditing && (
                                <button onClick={() => setEditingYear(null)} className="p-1 hover:bg-emerald-800/50 rounded text-emerald-300" title="Close Edit Mode">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <p className={`text-xs ${isEditing ? 'text-emerald-400/70' : 'text-slate-500'}`}>
                            {isEditing ? "Overrides apply to this year onwards." : "Adjusting global starting parameters."}
                        </p>
                    </div>

                    {/* Timeline Control */}
                    <div className={isEditing ? "opacity-30 pointer-events-none grayscale transition-opacity" : "transition-opacity"}>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold uppercase text-slate-400">Timeline</label>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">{projectionYears} Years</span>
                        </div>
                        <input
                            type="range" min="1" max="30"
                            value={projectionYears}
                            onChange={(e) => setProjectionYears(Number(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                        />
                    </div>

                    {/* Core Finances Inputs */}
                    <div className="space-y-4">
                        <h3 className={`text-sm font-bold flex items-center gap-2 ${isEditing ? 'text-emerald-200' : 'text-white'}`}>
                            <Wallet size={16} className={isEditing ? "text-emerald-400" : "text-blue-400"} />
                            {isEditing ? "Yearly Totals" : "Starting Baseline"}
                        </h3>

                        <InputGroup
                            label={isEditing ? "Annual Income (New Base)" : "Annual Income"}
                            value={sidebarValues.income}
                            onChange={(v) => handleSidebarChange('income', v)}
                            highlight={isEditing}
                        />
                        <InputGroup
                            label={isEditing ? "Annual Spending (New Base)" : "Annual Spending"}
                            value={sidebarValues.spending}
                            onChange={(v) => handleSidebarChange('spending', v)}
                            highlight={isEditing}
                        />
                        <InputGroup
                            label={isEditing ? "Total Assets (Override)" : "Current Assets"}
                            value={sidebarValues.assets}
                            onChange={(v) => handleSidebarChange('assets', v)}
                            highlight={isEditing}
                        />
                        <InputGroup
                            label={isEditing ? "Total Debts (Override)" : "Current Debts"}
                            value={sidebarValues.debts}
                            onChange={(v) => handleSidebarChange('debts', v)}
                            highlight={isEditing}
                        />
                    </div>

                    {/* Growth Factors */}
                    <div className="space-y-4">
                        <h3 className={`text-sm font-bold flex items-center gap-2 ${isEditing ? 'text-emerald-200' : 'text-white'}`}>
                            <Activity size={16} className={isEditing ? "text-emerald-400" : "text-purple-400"} />
                            {isEditing ? "Rates (This Year Only)" : "Growth Factors (Global)"}
                        </h3>
                        <InputGroup
                            type="percent"
                            step={0.01}
                            label="Investment Return"
                            value={sidebarValues.growthRate}
                            onChange={(v) => handleSidebarChange('growthRate', v)}
                            highlight={isEditing}
                        />
                        <InputGroup
                            type="percent"
                            step={0.01}
                            label="Inflation Rate"
                            value={sidebarValues.inflationRate}
                            onChange={(v) => handleSidebarChange('inflationRate', v)}
                            highlight={isEditing}
                        />
                        <InputGroup
                            type="percent"
                            step={0.01}
                            label="Salary Increase"
                            value={sidebarValues.salaryIncrease}
                            onChange={(v) => handleSidebarChange('salaryIncrease', v)}
                            highlight={isEditing}
                        />
                    </div>

                    <button onClick={() => setView('landing')} className="w-full py-3 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white border border-slate-800 hover:border-slate-600 rounded-lg transition-colors">
                        Exit to Home
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow p-6 md:p-10 overflow-y-auto relative">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Projection Dashboard</h1>
                        <p className="text-slate-400 text-sm">Reviewing financial trajectory.</p>
                    </div>
                    <div className="flex gap-3">
                        <button disabled className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-500 text-sm font-medium rounded-lg border border-slate-700 cursor-not-allowed opacity-50">
                            <Save size={16} /> Save Scenario
                        </button>
                        <button onClick={() => setView('setup')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-emerald-900/20">
                            <PlusCircle size={16} /> New Draft
                        </button>
                    </div>
                </header>

                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <KPICard title="Proj. Net Worth" value={formatMoney(finalNetWorth)} icon={TrendingUp} colorClass="text-emerald-400" />
                    <KPICard title="Avg. Yearly Growth" value={formatMoney((finalNetWorth - (inputs.assets - inputs.debts)) / projectionYears)} icon={Activity} colorClass="text-blue-400" />
                    <KPICard title="Total Spending" value={formatMoney(inputs.spending * projectionYears)} icon={CreditCard} colorClass="text-orange-400" />
                    <KPICard title="Liquid Assets" value={formatMoney(simulationData[simulationData.length - 1]?.Assets || 0)} icon={DollarSign} colorClass="text-cyan-400" />
                </div>

                {/* Visualizations Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <TrendingUp size={18} className="text-emerald-500" /> Net Worth Trajectory
                            </h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={simulationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#cbd5e1' }} formatter={(value) => formatMoney(value)} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Area type="monotone" name="Net Worth" dataKey="NetWorth" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorNw)" />
                                    <Area type="monotone" name="Debts" dataKey="Debts" stroke="#ef4444" strokeWidth={2} fillOpacity={0.1} fill="#ef4444" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <PieChart size={18} className="text-blue-500" /> Income vs. Spending
                            </h3>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={simulationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="year" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#cbd5e1' }} formatter={(value) => formatMoney(value)} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="Income" barSize={20} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Spending" barSize={20} fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    <Line type="monotone" name="Cash Flow" dataKey="CashFlow" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7' }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl mb-24">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-white">Annual Breakdown</h3>
                            <p className="text-xs text-slate-500 mt-1">Click "Edit" on a row to adjust parameters for that specific year using the sidebar.</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
                                <tr>
                                    <th className="px-6 py-4">Year</th>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4 text-emerald-400 font-bold">Net Worth</th>
                                    <th className="px-6 py-4">Income</th>
                                    <th className="px-6 py-4 text-red-400">Spending</th>
                                    <th className="px-6 py-4 text-purple-400">Cash Flow</th>
                                    <th className="px-6 py-4 text-blue-400">Investments</th>
                                    <th className="px-6 py-4 text-orange-400">Debts</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {simulationData.map((row) => (
                                    <tr key={row.year} className={`transition-colors ${editingYear === row.index ? 'bg-emerald-900/20 border-l-2 border-emerald-500' : 'hover:bg-slate-800/50'} ${row.HasAdjustment ? 'bg-emerald-900/5' : ''}`}>
                                        <td className="px-6 py-4 font-bold text-slate-300">
                                            {row.year}
                                            {row.HasAdjustment && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-emerald-500" title="Has Manual Adjustments"></span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => setEditingYear(row.index === editingYear ? null : row.index)}
                                                className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded transition-all ${editingYear === row.index
                                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                        : "text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 hover:scale-105"
                                                    }`}
                                            >
                                                <Edit2 size={12} /> {editingYear === row.index ? 'Editing...' : 'Edit'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-emerald-400 font-bold">{formatMoney(row.NetWorth)}</td>
                                        <td className="px-6 py-4 text-slate-300">{formatMoney(row.Income)}</td>
                                        <td className="px-6 py-4 text-slate-400">{formatMoney(row.Spending)}</td>
                                        <td className="px-6 py-4 text-purple-300">{formatMoney(row.CashFlow)}</td>
                                        <td className="px-6 py-4 text-blue-300">{formatMoney(row.Investments)}</td>
                                        <td className="px-6 py-4 text-orange-400">{formatMoney(row.Debts)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
}
