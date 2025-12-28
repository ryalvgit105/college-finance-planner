import React, { useState, useEffect } from 'react';
import { getDashboardSummary, getAssets, getInvestments, getMilestones, getGoals, getSpending } from '../api/financeApi';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { LuLayoutDashboard, LuTrendingUp, LuDollarSign, LuWallet, LuTarget, LuFlag } from 'react-icons/lu';

const Dashboard = () => {
    const { currentProfile } = useProfile();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [financialData, setFinancialData] = useState({
        assets: 0,
        income: 0,
        spending: 0,
        debts: 0,
        netWorth: 0,
        savingsRate: 0,
        monthlySavings: 0
    });
    const [assetsList, setAssetsList] = useState([]);
    const [investmentsList, setInvestmentsList] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [goals, setGoals] = useState([]);
    const [spendingList, setSpendingList] = useState([]);

    const userName = currentProfile?.name || "Student";

    // Fetch dashboard data when currentProfile changes
    useEffect(() => {
        if (currentProfile) {
            fetchDashboardData();
        } else {
            // Reset data if no profile selected
            setFinancialData({
                assets: 0, income: 0, spending: 0, debts: 0, netWorth: 0, savingsRate: 0, monthlySavings: 0
            });
            setAssetsList([]);
            setInvestmentsList([]);
            setMilestones([]);
            setGoals([]);
            setSpendingList([]);
            setLoading(false);
        }
    }, [currentProfile]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const profileId = currentProfile._id;
            const [summaryData, assetsData, investmentsData, milestonesData, goalsData, spendingData] = await Promise.all([
                getDashboardSummary(profileId),
                getAssets(profileId),
                getInvestments(profileId),
                getMilestones(profileId),
                getGoals(profileId),
                getSpending(profileId)
            ]);

            setFinancialData(summaryData.data?.data || {});
            setAssetsList(assetsData.data?.data || []);
            setInvestmentsList(investmentsData.data?.data || []);
            setMilestones(milestonesData.data?.data || []);
            setGoals(goalsData.data?.data || []);
            setSpendingList(spendingData.data?.data || []);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Failed to load financial data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const netWorth = financialData.netWorth;

    // Helper to get top 3 upcoming milestones
    const upcomingMilestones = milestones
        .filter(m => !m.achieved && new Date(m.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    // Helper to get top 3 active goals
    const activeGoals = goals
        .filter(g => (g.currentAmount || 0) < (g.targetAmount || 0)) // Only active (incomplete) goals
        .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate)) // Closest deadline first
        .slice(0, 3);

    // Dark Theme Colors
    const COLORS = [
        '#10b981', // Emerald 500
        '#3b82f6', // Blue 500
        '#6366f1', // Indigo 500
        '#f59e0b', // Amber 500
        '#8b5cf6', // Violet 500
        '#ec4899', // Pink 500
        '#14b8a6', // Teal 500
        '#f97316', // Orange 500
        '#ef4444', // Red 500
        '#84cc16', // Lime 500
    ];

    if (!currentProfile) {
        return (
            <div className="min-h-screen bg-[#0C0C0D] text-gray-100 p-8 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl text-gray-400">Please select or create a profile to view the dashboard.</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0C0C0D] text-gray-100 p-6 md:p-8 space-y-6">

            {/* Header */}
            <div className="flex justify-between items-end border-b border-[#2C2C2E] pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {userName}</h1>
                    <p className="text-gray-400">Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.</p>
                </div>
                <div className="hidden md:block">
                    <div className="bg-[#1C1C1E] px-4 py-2 rounded-lg border border-[#2C2C2E] flex items-center gap-2">
                        <LuLayoutDashboard className="text-[#C6AA76]" />
                        <span className="text-sm font-medium text-gray-300">Dashboard</span>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-200">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="h-64 flex items-center justify-center text-gray-500">
                    Loading overview...
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                        {/* Net Worth (Hero Card) */}
                        <div className="bg-[#111214] border border-[#2C2C2E] p-6 rounded-xl relative overflow-hidden group hover:border-[#C6AA76]/50 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <LuTrendingUp className="w-16 h-16 text-[#C6AA76]" />
                            </div>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Net Worth</p>
                            <h3 className={`text-3xl font-bold ${netWorth >= 0 ? 'text-[#C6AA76]' : 'text-red-500'}`}>
                                ${Math.abs(netWorth).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </h3>
                            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                                {netWorth >= 0 ? 'Assets exceed debts' : 'Debts exceed assets'}
                            </p>
                        </div>

                        {/* Assets */}
                        <div className="bg-[#111214] border border-[#2C2C2E] p-6 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Assets</p>
                                <LuWallet className="text-emerald-500 w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">
                                ${financialData.assets.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </h3>
                            <div className="mt-2 text-xs text-gray-500">
                                Incl. ${(financialData.investments || 0).toLocaleString()} Investments
                            </div>
                        </div>

                        {/* Debts */}
                        <div className="bg-[#111214] border border-[#2C2C2E] p-6 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Debts</p>
                                <LuDollarSign className="text-red-500 w-5 h-5" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">
                                ${financialData.debts.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </h3>
                            <div className="mt-2 text-xs text-gray-500">
                                Total Liabilities
                            </div>
                        </div>

                        {/* Savings Rate */}
                        <div className="bg-[#111214] border border-[#2C2C2E] p-6 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Savings Rate</p>
                                <div className={`w-2 h-2 rounded-full ${financialData.savingsRate > 20 ? 'bg-emerald-500' : financialData.savingsRate > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            </div>
                            <h3 className="text-2xl font-bold text-white">
                                {financialData.savingsRate.toFixed(1)}%
                            </h3>
                            <div className="mt-2 text-xs text-gray-500">
                                ${Math.round(financialData.monthlySavings).toLocaleString()}/mo saved
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column: Asset Breakdown (2/3 width) */}
                        <div className="lg:col-span-2 bg-[#111214] border border-[#2C2C2E] p-6 rounded-xl flex flex-col">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <LuTrendingUp className="text-[#C6AA76]" /> Asset Allocation
                            </h3>

                            {assetsList.length === 0 && investmentsList.length === 0 ? (
                                <div className="flex-grow flex items-center justify-center text-gray-600 min-h-[300px]">
                                    No assets to display.
                                </div>
                            ) : (
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={(() => {
                                                    const combinedData = {};
                                                    assetsList.forEach(asset => {
                                                        const type = asset.type || 'Other';
                                                        combinedData[type] = (combinedData[type] || 0) + (asset.value || 0);
                                                    });
                                                    investmentsList.forEach(inv => {
                                                        const type = inv.assetType ?
                                                            (inv.assetType.charAt(0).toUpperCase() + inv.assetType.slice(1)) :
                                                            'Investment';
                                                        combinedData[type] = (combinedData[type] || 0) + (inv.currentValue || 0);
                                                    });
                                                    return Object.entries(combinedData)
                                                        .map(([name, value]) => ({ name, value }))
                                                        .sort((a, b) => b.value - a.value);
                                                })()}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={120}
                                                paddingAngle={2}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {Array.from({ length: 15 }).map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => `$${value.toLocaleString()}`}
                                                contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#2C2C2E', color: '#F3F4F6' }}
                                                itemStyle={{ color: '#D1D5DB' }}
                                            />
                                            <Legend
                                                layout="vertical"
                                                verticalAlign="middle"
                                                align="right"
                                                iconType="circle"
                                                wrapperStyle={{ fontSize: '12px', color: '#9CA3AF' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Dynamic Lists (1/3 width) */}
                        <div className="space-y-6">

                            {/* Goals */}
                            <div className="bg-[#111214] border border-[#2C2C2E] p-6 rounded-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <LuTarget className="text-blue-500" /> Active Goals
                                    </h3>
                                    <Link to="/goals" className="text-xs text-blue-400 hover:text-blue-300">View All</Link>
                                </div>
                                <div className="space-y-4">
                                    {activeGoals.length > 0 ? activeGoals.map(goal => (
                                        <div key={goal._id} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-300">{goal.goalName}</span>
                                                <span className="text-gray-500 text-xs">Due {new Date(goal.targetDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="w-full bg-[#2C2C2E] rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="bg-blue-500 h-1.5 rounded-full"
                                                    style={{ width: `${Math.min(((goal.currentAmount || 0) / goal.targetAmount) * 100, 100)}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>${(goal.currentAmount || 0).toLocaleString()}</span>
                                                <span>Target: ${goal.targetAmount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-600 text-center py-4">No active goals.</p>
                                    )}
                                </div>
                            </div>

                            {/* Milestones */}
                            <div className="bg-[#111214] border border-[#2C2C2E] p-6 rounded-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <LuFlag className="text-purple-500" /> Upcoming
                                    </h3>
                                    <Link to="/milestones" className="text-xs text-purple-400 hover:text-purple-300">View All</Link>
                                </div>
                                <div className="space-y-3">
                                    {upcomingMilestones.length > 0 ? upcomingMilestones.map(m => (
                                        <div key={m._id} className="bg-[#1C1C1E] p-3 rounded-lg border border-[#2C2C2E] flex gap-3 items-center">
                                            <div className="bg-[#2C2C2E] h-10 w-10 rounded flex items-center justify-center text-center leading-none flex-shrink-0">
                                                <div>
                                                    <span className="block text-[10px] text-gray-500 uppercase">{new Date(m.date).toLocaleString('default', { month: 'short' })}</span>
                                                    <span className="block text-sm font-bold text-white">{new Date(m.date).getDate()}</span>
                                                </div>
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm text-gray-200 truncate">{m.title}</p>
                                                <p className="text-xs text-gray-500 truncate">{m.description || 'No description'}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-gray-600 text-center py-4">No upcoming milestones.</p>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
