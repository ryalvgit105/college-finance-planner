import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart
} from 'recharts';
import {
    TrendingUp, DollarSign, Wallet, CreditCard, PieChart, ArrowRight, RefreshCw, FileText, PlusCircle, Save, ChevronLeft, Target, Activity, Edit2, X, AlertCircle
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

const MOCK_USER_DATA = {
    income: 95000,
    spending: 52000,
    assets: 35000,
    investments: 45000,
    debts: 28000,
    growthRate: 0.08,
    inflationRate: 0.03,
    salaryIncrease: 0.04,
};

const BLANK_DATA = {
    income: 0,
    spending: 0,
    assets: 0,
    investments: 0,
    debts: 0,
    growthRate: 0.07,
    inflationRate: 0.03,
    salaryIncrease: 0.03,
};

// --- Components ---

const InputGroup = ({ label, value, onChange, type = "currency", step = 1000, placeholder, highlight }) => (
    <div className="flex flex-col gap-1">
        <label className={`text-xs font-medium uppercase tracking-wider ${highlight ? 'text-[#C6AA76]' : 'text-[#9EA2A8]'}`}>{label}</label>
        <div className="relative">
            {type === "currency" && (
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${highlight ? 'text-white' : 'text-[#9EA2A8]'}`}>$</span>
            )}
            {type === "percent" && (
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${highlight ? 'text-white' : 'text-[#9EA2A8]'}`}>%</span>
            )}
            <input
                type="number"
                step={step}
                value={value === undefined || value === null ? '' : value}
                onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                placeholder={placeholder}
                className={`w-full rounded-lg py-2 text-sm outline-none transition-all ${type === "currency" ? "pl-7" : "pl-3"} 
          ${highlight
                        ? "bg-[#1C1C1E] border border-[#C6AA76] text-white focus:ring-1 focus:ring-[#C6AA76]"
                        : "bg-[#111214] border border-[#2C2C2E] text-[#B5B8BD] focus:border-[#9EA2A8] focus:ring-1 focus:ring-[#9EA2A8]"
                    }`}
            />
        </div>
    </div>
);

const KPICard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-[#111214] border border-[#2C2C2E] p-4 rounded-xl flex items-center justify-between">
        <div>
            <p className="text-[#9EA2A8] text-xs uppercase font-bold mb-1">{title}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-[#1C1C1E] ${colorClass}`}>
            <Icon size={20} />
        </div>
    </div>
);

// --- Main Application ---

export default function FuturePathPage() {
    const { currentProfile } = useProfile();
    const [view, setView] = useState('landing'); // landing, setup, dashboard
    const [inputs, setInputs] = useState(BLANK_DATA);
    const [projectionYears, setProjectionYears] = useState(30);
    const [simulationData, setSimulationData] = useState([]);
    const [finalNetWorth, setFinalNetWorth] = useState(0);

    // New State: Yearly Overrides
    const [yearlyAdjustments, setYearlyAdjustments] = useState({});
    const [editingYear, setEditingYear] = useState(null); // Which year index is being edited

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
                    runningIncome = runningIncome * (1 + currentSalaryInc);
                }

                if (adjustment.spending !== undefined) {
                    runningSpending = adjustment.spending;
                } else {
                    runningSpending = runningSpending * (1 + currentInflation);
                }
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
            const totalSpending = (spendingRes.data || []).reduce((sum, item) => sum + (item.amount || 0), 0) * 12;
            const totalInvestments = (investmentsRes.data || []).reduce((sum, item) => sum + (item.currentValue || 0), 0);

            return {
                income: totalIncome,
                spending: totalSpending > 0 ? totalSpending : totalIncome * 0.5,
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

    // --- Sidebar Logic ---

    const getSidebarValues = () => {
        if (editingYear === null) return inputs;

        const yearData = simulationData.find(d => d.index === editingYear);
        if (!yearData) return inputs;

        const currentAdj = yearlyAdjustments[editingYear] || {};

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
            setInputs(prev => ({ ...prev, [field]: newValue }));
        } else {
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
            <div className="min-h-screen bg-[#0C0C0D] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="max-w-md w-full text-center space-y-8 z-10">
                    <div className="mb-6 flex justify-center">
                        <div className="h-20 w-20 bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl flex items-center justify-center shadow-2xl">
                            <TrendingUp size={40} className="text-[#C6AA76]" />
                        </div>
                    </div>

                    <h1 className="text-5xl font-extrabold tracking-tight text-white">
                        Future<span className="text-[#C6AA76]">Path</span>
                    </h1>
                    <p className="text-[#9EA2A8] text-lg">
                        Professional-grade long-horizon financial modeling.
                    </p>

                    <div className="space-y-4 pt-4">
                        <button
                            onClick={() => setView('setup')}
                            className="w-full group relative flex items-center justify-center gap-3 p-4 bg-[#C6AA76] hover:bg-[#D4AF37] text-black rounded-xl transition-all font-bold text-lg shadow-lg"
                        >
                            <PlusCircle size={22} />
                            Create New Projection
                            <ArrowRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>

                        <button disabled className="w-full group flex items-center justify-center gap-3 p-4 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl transition-all font-semibold text-[#5A5D63] cursor-not-allowed">
                            <RefreshCw size={20} />
                            Load Previous Projection
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- View: Setup ---
    if (view === 'setup') {
        return (
            <div className="min-h-screen bg-[#0C0C0D] text-white flex flex-col items-center justify-center p-6 relative">
                <div className="max-w-4xl w-full z-10">
                    <button
                        onClick={() => setView('landing')}
                        className="group flex items-center text-[#9EA2A8] hover:text-white mb-8 transition-colors"
                    >
                        <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back
                    </button>

                    <h2 className="text-3xl font-bold mb-2 text-white">Initialize Projection</h2>
                    <p className="text-[#9EA2A8] mb-10">Choose a starting point for your financial simulation.</p>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div
                            onClick={() => handleStartDraft(true)}
                            className="cursor-pointer p-8 bg-[#111214] border border-[#2C2C2E] hover:border-[#C6AA76] hover:bg-[#1C1C1E] rounded-2xl transition-all group relative overflow-hidden"
                        >
                            <div className="h-14 w-14 bg-[#2C2C2E] text-[#C6AA76] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Target size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Use Current Overview</h3>
                            <p className="text-[#9EA2A8] text-sm leading-relaxed">
                                Pre-fill with your actual data from the Current Financial Overview (Assets, Debts, Income, Spending).
                            </p>
                        </div>

                        <div
                            onClick={() => handleStartDraft(false)}
                            className="cursor-pointer p-8 bg-[#111214] border border-[#2C2C2E] hover:border-[#C6AA76] hover:bg-[#1C1C1E] rounded-2xl transition-all group relative overflow-hidden"
                        >
                            <div className="h-14 w-14 bg-[#2C2C2E] text-[#C6AA76] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FileText size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-white">Start Blank</h3>
                            <p className="text-[#9EA2A8] text-sm leading-relaxed">
                                Begin with a clean slate (Zeros). Build a hypothetical scenario from the ground up.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 p-4 border border-dashed border-[#2C2C2E] rounded-xl text-center text-[#5A5D63] text-sm">
                        Start from Another Profile (Coming Soon)
                    </div>
                </div>
            </div>
        );
    }

    // --- View: Dashboard ---
    return (
        <div className="min-h-screen bg-[#0C0C0D] text-[#B5B8BD] flex flex-col md:flex-row relative">

            {/* Sidebar / Controls */}
            <aside className={`w-full md:w-80 border-r flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 overflow-y-auto z-10 transition-colors duration-300 
          ${isEditing ? 'bg-[#1C1C1E] border-[#C6AA76]' : 'bg-[#111214] border-[#2C2C2E]'}`}>

                {/* Sidebar Header */}
                <div className={`p-6 border-b transition-colors ${isEditing ? 'border-[#C6AA76] bg-[#2C2C2E]' : 'border-[#2C2C2E]'}`}>
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white mb-1">
                        <TrendingUp className="text-[#C6AA76]" size={24} /> FuturePath
                    </div>
                    <p className="text-xs text-[#9EA2A8]">Professional Mode</p>
                </div>

                <div className="p-6 space-y-8 flex-grow">

                    {/* Dynamic Header for Context */}
                    <div className={`rounded-xl p-4 border ${isEditing ? 'bg-[#2C2C2E] border-[#C6AA76]' : 'bg-[#1C1C1E] border-[#2C2C2E]'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h2 className={`text-sm font-bold uppercase tracking-wider ${isEditing ? 'text-white' : 'text-[#C6AA76]'}`}>
                                {isEditing ? `Edit Year: ${displayYear}` : `Current Overview (${displayYear})`}
                            </h2>
                            {isEditing && (
                                <button onClick={() => setEditingYear(null)} className="p-1 hover:bg-[#3A3A3C] rounded text-white" title="Close Edit Mode">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                        <p className={`text-xs ${isEditing ? 'text-[#B5B8BD]' : 'text-[#9EA2A8]'}`}>
                            {isEditing ? "Overrides apply to this year onwards." : "Adjusting global starting parameters."}
                        </p>
                    </div>
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${isEditing ? 'text-white' : 'text-[#C6AA76]'}`}>
                        <Wallet size={16} className="text-[#9EA2A8]" />
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
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${isEditing ? 'text-white' : 'text-[#C6AA76]'}`}>
                        <Activity size={16} className="text-[#9EA2A8]" />
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

                <button onClick={() => setView('landing')} className="w-full py-3 text-xs font-bold uppercase tracking-widest text-[#9EA2A8] hover:text-white border border-[#2C2C2E] hover:border-[#5A5D63] rounded-lg transition-colors">
                    Exit to Home
                </button>
        </div>
            </aside >

        {/* Main Content Area */ }
        < main className = "flex-grow p-6 md:p-10 overflow-y-auto relative" >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Projection Dashboard</h1>
                    <p className="text-[#9EA2A8] text-sm">Reviewing financial trajectory.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#1C1C1E] hover:bg-[#2C2C2E] text-white text-sm font-medium rounded-lg transition-colors border border-[#2C2C2E]">
                        <Save size={16} /> Save Scenario
                    </button>
                    <button onClick={() => setView('setup')} className="flex items-center gap-2 px-4 py-2 bg-[#C6AA76] hover:bg-[#D4AF37] text-black text-sm font-bold rounded-lg transition-colors shadow-lg">
                        <PlusCircle size={16} /> New Draft
                    </button>
                </div>
            </header>

    {/* KPIs */ }
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard title="Proj. Net Worth" value={formatMoney(finalNetWorth)} icon={TrendingUp} colorClass="text-[#C6AA76] text-black" />
        <KPICard title="Avg. Yearly Growth" value={formatMoney((finalNetWorth - (inputs.assets - inputs.debts)) / projectionYears)} icon={Activity} colorClass="text-white" />
        <KPICard title="Total Spending" value={formatMoney(inputs.spending * projectionYears)} icon={CreditCard} colorClass="text-white" />
        <KPICard title="Liquid Assets" value={formatMoney(simulationData[simulationData.length - 1]?.Assets || 0)} icon={DollarSign} colorClass="text-white" />
    </div>

    {/* Visualizations Grid */ }
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#111214] p-6 rounded-xl border border-[#2C2C2E] shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <TrendingUp size={18} className="text-[#C6AA76]" /> Net Worth Trajectory
                </h3>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simulationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#C6AA76" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#C6AA76" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                        <XAxis dataKey="year" stroke="#5A5D63" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#5A5D63" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#2C2C2E', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#B5B8BD' }} formatter={(value) => formatMoney(value)} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Area type="monotone" name="Net Worth" dataKey="NetWorth" stroke="#C6AA76" strokeWidth={2} fillOpacity={1} fill="url(#colorNw)" />
                        <Area type="monotone" name="Debts" dataKey="Debts" stroke="#5A5D63" strokeWidth={2} fillOpacity={0.1} fill="#5A5D63" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-[#111214] p-6 rounded-xl border border-[#2C2C2E] shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-white flex items-center gap-2">
                    <PieChart size={18} className="text-[#9EA2A8]" /> Income vs. Spending
                </h3>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={simulationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                        <XAxis dataKey="year" stroke="#5A5D63" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#5A5D63" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#2C2C2E', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#B5B8BD' }} formatter={(value) => formatMoney(value)} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="Income" barSize={20} fill="#5A5D63" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Spending" barSize={20} fill="#9EA2A8" radius={[4, 4, 0, 0]} />
                        <Line type="monotone" name="Cash Flow" dataKey="CashFlow" stroke="#C6AA76" strokeWidth={3} dot={{ r: 4, fill: '#C6AA76' }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>

    {/* Data Table */ }
    <div className="bg-[#111214] rounded-xl border border-[#2C2C2E] overflow-hidden shadow-xl mb-24">
        <div className="p-6 border-b border-[#2C2C2E] flex justify-between items-center">
            <div>
                <h3 className="font-bold text-white">Annual Breakdown</h3>
                <p className="text-xs text-[#9EA2A8] mt-1">Click "Edit" on a row to adjust parameters for that specific year using the sidebar.</p>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="text-xs text-[#9EA2A8] uppercase bg-[#1C1C1E]">
                    <tr>
                        <th className="px-6 py-4">Year</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4 text-white font-bold">Net Worth</th>
                        <th className="px-6 py-4">Income</th>
                        <th className="px-6 py-4 text-[#9EA2A8]">Spending</th>
                        <th className="px-6 py-4 text-[#C6AA76]">Cash Flow</th>
                        <th className="px-6 py-4 text-[#B5B8BD]">Investments</th>
                        <th className="px-6 py-4 text-[#5A5D63]">Debts</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#2C2C2E]">
                    {simulationData.map((row) => (
                        <tr key={row.year} className={`transition-colors ${editingYear === row.index ? 'bg-[#2C2C2E] border-l-2 border-[#C6AA76]' : 'hover:bg-[#1C1C1E]'} ${row.HasAdjustment ? 'bg-[#1C1C1E]' : ''}`}>
                            <td className="px-6 py-4 font-bold text-[#C6AA76]">
                                {row.year}
                                {row.HasAdjustment && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-[#C6AA76]" title="Has Manual Adjustments"></span>}
                            </td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => setEditingYear(row.index === editingYear ? null : row.index)}
                                    className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded transition-all ${editingYear === row.index
                                        ? "bg-[#C6AA76] text-black shadow-lg"
                                        : "text-[#C6AA76] bg-[#2C2C2E] hover:bg-[#3A3A3C]"
                                        }`}
                                >
                                    <Edit2 size={12} /> {editingYear === row.index ? 'Editing...' : 'Edit'}
                                </button>
                            </td>
                            <td className="px-6 py-4 text-white font-bold">{formatMoney(row.NetWorth)}</td>
                            <td className="px-6 py-4 text-[#B5B8BD]">{formatMoney(row.Income)}</td>
                            <td className="px-6 py-4 text-[#9EA2A8]">{formatMoney(row.Spending)}</td>
                            <td className="px-6 py-4 text-[#C6AA76]">{formatMoney(row.CashFlow)}</td>
                            <td className="px-6 py-4 text-[#B5B8BD]">{formatMoney(row.Investments)}</td>
                            <td className="px-6 py-4 text-[#5A5D63]">{formatMoney(row.Debts)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>

            </main >
        </div >
    );
}
