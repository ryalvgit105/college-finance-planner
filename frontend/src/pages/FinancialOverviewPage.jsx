import React, { useEffect, useState, useMemo } from 'react';
import { useProfile } from '../context/ProfileContext';
import { useFinance } from '../context/FinanceContext';
import * as financeApi from '../api/financeApi';
import { LuDollarSign, LuCreditCard, LuTrendingUp, LuLandmark, LuWallet, LuArrowUpRight, LuArrowDownRight } from 'react-icons/lu';

const FinancialOverviewPage = () => {
    const { currentProfile } = useProfile();
    const { expenses } = useFinance(); // Actual spending from session/context

    const [assets, setAssets] = useState([]);
    const [debts, setDebts] = useState([]);
    const [income, setIncome] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentProfile?._id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all financial pillars
                const [assetsRes, debtsRes, incomeRes, investmentsRes] = await Promise.all([
                    financeApi.getAssets(currentProfile._id),
                    financeApi.getDebts(currentProfile._id),
                    financeApi.getIncome(currentProfile._id),
                    financeApi.getInvestments(currentProfile._id)
                ]);

                setAssets(assetsRes.data.data || []);
                setDebts(debtsRes.data.data || []);
                setIncome(incomeRes.data.data || []);
                setInvestments(investmentsRes.data.data || []);
            } catch (error) {
                console.error("Failed to fetch financial overview data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentProfile]);

    // --- Calculations ---

    const totalAssets = useMemo(() => assets.reduce((sum, item) => sum + (Number(item.value) || 0), 0), [assets]);
    const totalDebts = useMemo(() => debts.reduce((sum, item) => sum + (Number(item.balance) || Number(item.value) || 0), 0), [debts]);
    const totalInvestments = useMemo(() => investments.reduce((sum, item) => sum + (Number(item.currentValue) || 0), 0), [investments]);

    // Income is typically monthly. Ensure we are summing the "currentIncome" or equivalent field.
    const totalMonthlyIncome = useMemo(() => income.reduce((sum, item) => sum + (Number(item.currentIncome) || Number(item.amount) || 0), 0), [income]);

    // Spending (Expenses) - Calculated from current session's expenses list
    const totalMonthlySpending = useMemo(() => expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [expenses]);

    // Metrics
    const netWorth = (totalAssets + totalInvestments) - totalDebts;
    const monthlyCashflow = totalMonthlyIncome - totalMonthlySpending;
    const savingsRate = totalMonthlyIncome > 0 ? ((monthlyCashflow / totalMonthlyIncome) * 100).toFixed(1) : 0;

    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const StatCard = ({ title, value, icon: Icon, colorClass, subtext }) => (
        <div className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all duration-300 shadow-lg ${colorClass}`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon size={64} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2 text-slate-400 font-medium">
                    <Icon size={20} />
                    <span>{title}</span>
                </div>
                <div className="text-3xl font-bold text-white tabular-nums mb-1">
                    {formatCurrency(value)}
                </div>
                {subtext && <div className="text-sm text-slate-500">{subtext}</div>}
            </div>
        </div>
    );

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading Overview...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-12 font-inter text-slate-200">
            <style>{`
            .text-glow-sky { text-shadow: 0 0 20px rgba(56, 189, 248, 0.3); }
            `}</style>

            <header className="mb-12 text-center max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500 mb-4 animate-subtle-fade-in">
                    Financial Overview
                </h1>
                <p className="text-slate-400 text-lg">Your complete financial picture in one place.</p>
            </header>

            <div className="max-w-6xl mx-auto space-y-8 animate-subtle-fade-in">

                {/* Top Row: Net Worth & Cashflow */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Net Worth */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700/50 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <h2 className="text-slate-400 text-lg font-semibold uppercase tracking-wider mb-2">Net Worth</h2>
                            <div className="text-5xl md:text-6xl font-black text-white mb-4 text-glow-sky tabular-nums">
                                {formatCurrency(netWorth)}
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full text-sm font-medium border border-emerald-500/20">
                                <LuTrendingUp size={16} />
                                <span>Assets + Investments - Debts</span>
                            </div>
                        </div>
                    </div>

                    {/* Cashflow */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700/50 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
                        <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none ${monthlyCashflow >= 0 ? 'bg-sky-500/10' : 'bg-rose-500/10'}`}></div>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <h2 className="text-slate-400 text-lg font-semibold uppercase tracking-wider mb-2">Monthly Cashflow</h2>
                            <div className={`text-5xl md:text-6xl font-black mb-4 tabular-nums ${monthlyCashflow >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>
                                {monthlyCashflow > 0 ? '+' : ''}{formatCurrency(monthlyCashflow)}
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${monthlyCashflow >= 0 ? 'text-sky-400 bg-sky-500/10 border-sky-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
                                {monthlyCashflow >= 0 ? <LuArrowUpRight size={16} /> : <LuArrowDownRight size={16} />}
                                <span>{monthlyCashflow >= 0 ? 'Positive Cashflow' : 'Negative Cashflow'}</span>
                            </div>
                            <div className="mt-4 text-slate-500 text-sm">
                                Savings Rate: <span className="text-slate-300 font-bold">{savingsRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard
                        title="Assets"
                        value={totalAssets}
                        icon={LuDollarSign}
                        colorClass="hover:shadow-emerald-900/20"
                        subtext={`${assets.length} items`}
                    />
                    <StatCard
                        title="Investments"
                        value={totalInvestments}
                        icon={LuTrendingUp}
                        colorClass="hover:shadow-indigo-900/20"
                        subtext={`${investments.length} holdings`}
                    />
                    <StatCard
                        title="Debts"
                        value={totalDebts}
                        icon={LuCreditCard}
                        colorClass="hover:shadow-rose-900/20"
                        subtext={`${debts.length} liabilities`}
                    />
                    <StatCard
                        title="Income"
                        value={totalMonthlyIncome}
                        icon={LuLandmark}
                        colorClass="hover:shadow-sky-900/20"
                        subtext="Monthly avg"
                    />
                    <StatCard
                        title="Spending"
                        value={totalMonthlySpending}
                        icon={LuWallet}
                        colorClass="hover:shadow-amber-900/20"
                        subtext="This month"
                    />
                </div>

            </div>
        </div>
    );
};

export default FinancialOverviewPage;
