import React, { useState, useEffect } from 'react';
import { getDashboardSummary, getAssets, getInvestments, getMilestones, getGoals, getSpending } from '../api/financeApi';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

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

    const userName = "Student"; // TODO: Replace with actual user name from auth

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

            setFinancialData(summaryData);
            setAssetsList(assetsData.data || []);
            setInvestmentsList(investmentsData.data || []);
            setMilestones(milestonesData.data || []);
            setGoals(goalsData.data || []);
            setSpendingList(spendingData.data || []);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Failed to load financial data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const netWorth = financialData.netWorth;

    // Helper to get top 3 upcoming milestones (prefer backend aggregation)
    const upcomingMilestones = financialData.upcomingMilestones || milestones
        .filter(m => !m.achieved && new Date(m.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    // Helper to get top 3 active goals (prefer backend aggregation)
    const activeGoals = financialData.activeGoals || goals
        .filter(g => (g.currentAmount || 0) < (g.targetAmount || 0)) // Only active (incomplete) goals
        .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate)) // Closest deadline first
        .slice(0, 3);

    // Icon components
    const AssetsIcon = () => (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    const IncomeIcon = () => (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
    );

    const SpendingIcon = () => (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    );

    const NetWorthIcon = () => (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    );

    return (
        <div className="space-y-6">
            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
                        <p className="text-xl text-gray-600">Loading your financial data...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Dashboard Content - Only show when not loading */}
            {!loading && !error && (
                <>
                    {/* Greeting Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
                            <p className="text-lg opacity-90">Here's your financial overview</p>
                        </div>
                    </div>


                    {/* Asset Summary Card */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90 mb-1">Total Assets</p>
                                <h2 className="text-4xl font-bold">
                                    {financialData.assets > 0 ? (
                                        <>💰 ${financialData.assets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
                                    ) : (
                                        <>📊 No assets yet</>
                                    )}
                                </h2>
                                {financialData.assets > 0 && (
                                    <p className="text-sm opacity-90 mt-2">
                                        Your total asset value across all accounts
                                    </p>
                                )}
                            </div>
                            <div className="hidden md:block">
                                <svg className="w-20 h-20 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Assets Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Total Assets</h3>
                                <div className="text-green-600">
                                    <AssetsIcon />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                ${financialData.assets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-green-700 mt-2 font-medium">↑ Global Net Worth</p>
                        </div>

                        {/* Investments Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Investments</h3>
                                <div className="text-indigo-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                ${financialData.investments?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </p>
                            <p className="text-sm text-indigo-600 mt-2 font-medium">Portfolio Value</p>
                        </div>

                        {/* Fixed/Simple Assets Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Fixed Assets</h3>
                                <div className="text-teal-500">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                ${financialData.simpleAssets?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </p>
                            <p className="text-sm text-teal-600 mt-2 font-medium">Savings, Property, Vehicles</p>
                        </div>

                        {/* Income Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Income</h3>
                                <div className="text-blue-500">
                                    <IncomeIcon />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                ${financialData.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-blue-600 mt-2 font-medium">Net Monthly Income</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Spending</h3>
                                <div className="text-red-500">
                                    <SpendingIcon />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                ${financialData.spending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-red-600 mt-2 font-medium">↓ Monthly total</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Net Worth</h3>
                                <div className="text-purple-500">
                                    <NetWorthIcon />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm text-purple-600 mt-2 font-medium">Assets - Debts</p>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Charts & Summaries (2/3 width) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Asset Distribution Pie Chart */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Asset Distribution</h3>
                                {assetsList.length === 0 && investmentsList.length === 0 ? (
                                    <div className="flex items-center justify-center h-64 text-gray-500">
                                        <div className="text-center">
                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                            </svg>
                                            <p className="text-lg font-medium">No data to display</p>
                                            <p className="text-sm mt-1">Add assets to see distribution</p>
                                        </div>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <PieChart>
                                            <Pie
                                                data={(() => {
                                                    // Helper to normalize and sum
                                                    const combinedData = {};

                                                    // 1. Process Fixed Assets
                                                    assetsList.forEach(asset => {
                                                        const type = asset.type || 'Other';
                                                        if (!combinedData[type]) combinedData[type] = 0;
                                                        combinedData[type] += asset.value || 0;
                                                    });

                                                    // 2. Process Investments
                                                    investmentsList.forEach(inv => {
                                                        const type = inv.assetType ?
                                                            (inv.assetType.charAt(0).toUpperCase() + inv.assetType.slice(1)) :
                                                            'Investment';
                                                        if (!combinedData[type]) combinedData[type] = 0;
                                                        combinedData[type] += inv.currentValue || 0;
                                                    });

                                                    // Convert to array format for Recharts
                                                    return Object.entries(combinedData)
                                                        .map(([name, value]) => ({ name, value }))
                                                        .sort((a, b) => b.value - a.value); // Sort largest to smallest
                                                })()}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={120}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {(() => {
                                                    // Extended Color Palette
                                                    const COLORS = [
                                                        '#10b981', // green-500
                                                        '#3b82f6', // blue-500
                                                        '#6366f1', // indigo-500 (Investments preferred)
                                                        '#f59e0b', // amber-500
                                                        '#8b5cf6', // violet-500
                                                        '#ec4899', // pink-500
                                                        '#14b8a6', // teal-500
                                                        '#f97316', // orange-500
                                                        '#ef4444', // red-500
                                                        '#84cc16', // lime-500
                                                    ];

                                                    // Re-calculate length to ensure colors map correctly
                                                    const uniqueTypesCount = new Set([
                                                        ...assetsList.map(a => a.type || 'Other'),
                                                        ...investmentsList.map(i => i.assetType ? (i.assetType.charAt(0).toUpperCase() + i.assetType.slice(1)) : 'Investment')
                                                    ]).size;

                                                    return Array.from({ length: uniqueTypesCount || 10 }).map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ));
                                                })()}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Net Worth Summary Card */}
                            <div className="bg-white rounded-lg shadow-lg p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Net Worth Summary</h3>
                                <div className="flex flex-col lg:flex-row gap-8 items-center">
                                    {/* Left: Stats List */}
                                    <div className="w-full lg:w-1/2 space-y-4">
                                        {/* Total Assets */}
                                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Total Assets</p>
                                                    <p className="text-lg font-semibold text-gray-800">
                                                        ${financialData.assets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                            </svg>
                                        </div>

                                        {/* Total Debts */}
                                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Total Debts</p>
                                                    <p className="text-lg font-semibold text-gray-800">
                                                        ${financialData.debts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </div>

                                        {/* Net Worth */}
                                        <div className={`p-6 rounded-lg border-2 ${financialData.netWorth >= 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'}`}>
                                            <p className="text-sm text-gray-600 mb-2">Net Worth</p>
                                            <div className="flex items-baseline">
                                                <p className={`text-4xl font-bold ${financialData.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    ${Math.abs(financialData.netWorth).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                                {financialData.netWorth < 0 && (
                                                    <span className="ml-2 text-red-600 text-xl font-semibold">(Negative)</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2">
                                                {financialData.netWorth >= 0
                                                    ? '✓ Your assets exceed your debts'
                                                    : '⚠ Your debts exceed your assets'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Pie Chart */}
                                    <div className="w-full lg:w-1/2 h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Net Worth', value: Math.max(0, financialData.netWorth), fill: '#10b981' }, // green-500
                                                        { name: 'Debts', value: financialData.debts, fill: '#ef4444' } // red-500
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    <Cell key="cell-networth" fill="#10b981" />
                                                    <Cell key="cell-debts" fill="#ef4444" />
                                                </Pie>
                                                <Tooltip formatter={(value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Milestones & Goals (1/3 width) */}
                            <div className="space-y-6">
                                {/* Monthly Spending Breakdown Chart */}
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Monthly Spending Breakdown</h3>
                                    {spendingList.length === 0 ? (
                                        <div className="flex items-center justify-center h-64 text-gray-500">
                                            <div className="text-center">
                                                <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-lg font-medium">No spending this month</p>
                                                <p className="text-sm mt-1">Log expenses to see breakdown</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={(() => {
                                                        // Filter for current month and group by category
                                                        const currentMonth = new Date().getMonth();
                                                        const currentYear = new Date().getFullYear();

                                                        const monthlySpending = spendingList.filter(entry => {
                                                            const entryDate = new Date(entry.date);
                                                            return entryDate.getMonth() === currentMonth &&
                                                                entryDate.getFullYear() === currentYear;
                                                        });

                                                        if (monthlySpending.length === 0) return [];

                                                        const grouped = monthlySpending.reduce((acc, entry) => {
                                                            const category = entry.category || 'Uncategorized';
                                                            if (!acc[category]) {
                                                                acc[category] = 0;
                                                            }
                                                            acc[category] += entry.amount || 0;
                                                            return acc;
                                                        }, {});

                                                        return Object.entries(grouped).map(([name, value]) => ({
                                                            name,
                                                            value
                                                        }));
                                                    })()}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {(() => {
                                                        const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'];
                                                        // Re-calculate to match indices (simplified for display)
                                                        return Array.from({ length: 10 }).map((_, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ));
                                                    })()}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>

                                {/* Upcoming Milestones */}
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-gray-800">Upcoming Milestones</h3>
                                        <Link to="/milestones" className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                                            View All →
                                        </Link>
                                    </div>
                                    {upcomingMilestones.length > 0 ? (
                                        <div className="space-y-4">
                                            {upcomingMilestones.map((milestone) => (
                                                <div key={milestone._id} className="border-l-4 border-purple-500 bg-purple-50 p-3 rounded-r-lg">
                                                    <p className="font-semibold text-gray-800">{milestone.title}</p>
                                                    <div className="flex items-center text-sm text-gray-600 mt-1">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {new Date(milestone.date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-500">
                                            <p>No upcoming milestones.</p>
                                            <Link to="/milestones" className="text-purple-600 text-sm hover:underline mt-2 inline-block">
                                                Add a milestone
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Active Goals */}
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-gray-800">Active Goals</h3>
                                        <Link to="/goals" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                            View All →
                                        </Link>
                                    </div>
                                    {activeGoals.length > 0 ? (
                                        <div className="space-y-4">
                                            {activeGoals.map((goal) => (
                                                <div key={goal._id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow bg-blue-50 border-l-4 border-l-blue-500">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center">
                                                            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                            <p className="font-semibold text-gray-800">{goal.goalName}</p>
                                                        </div>
                                                        <span className="text-xs font-medium bg-white text-blue-800 px-2 py-0.5 rounded-full border border-blue-100">
                                                            {goal.category || 'General'}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                                        <div
                                                            className="bg-blue-600 h-2.5 rounded-full"
                                                            style={{ width: `${Math.min(((goal.currentAmount || 0) / goal.targetAmount) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-600">
                                                        <span>${(goal.currentAmount || 0).toLocaleString()}</span>
                                                        <span>Target: ${goal.targetAmount.toLocaleString()}</span>
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-500 text-right">
                                                        Due: {new Date(goal.targetDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-500">
                                            <p>No active goals.</p>
                                            <Link to="/goals" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                                                Set a goal
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Financial Snapshot (Quick Stats) */}
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-600">Savings Rate</span>
                                            <span className="font-bold text-gray-900">
                                                {((financialData.income - financialData.spending) / financialData.income * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-600">Monthly Savings</span>
                                            <span className="font-bold text-gray-900">
                                                ${(financialData.income - financialData.spending).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
