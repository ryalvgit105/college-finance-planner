import React, { useState, useEffect } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { getSpending, deleteSpending } from '../../api/financeApi';
import SpendingTimelineChart from './SpendingTimelineChart';
import SpendingHeatmap from './SpendingHeatmap';
import TransactionLedger from './TransactionLedger';
import { LuLayoutDashboard, LuList, LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const SpendingAnalysisPage = () => {
    const { currentProfile } = useProfile();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [transactions, setTransactions] = useState([]); // All transactions for the year
    const [monthlyTransactions, setMonthlyTransactions] = useState([]); // Filtered for Ledger
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Derived Data for Charts
    const [timelineData, setTimelineData] = useState([]);
    const [heatmapData, setHeatmapData] = useState({ months: [], categories: [], matrix: {} });
    const [kpiData, setKpiData] = useState({ totalSpend: 0, avgMonthly: 0, topCategory: { name: '-', amount: 0 } });

    useEffect(() => {
        if (currentProfile) {
            fetchYearlyData();
        }
    }, [currentProfile, currentDate.getFullYear()]); // Only re-fetch if Year changes

    // Update derived monthly data when currentDate (month) changes, independent of fetching
    useEffect(() => {
        if (transactions.length > 0) {
            processMonthlyData(transactions);
        }
    }, [currentDate, transactions]);

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const fetchYearlyData = async () => {
        try {
            setLoading(true);
            const yearStr = currentDate.getFullYear().toString();
            // Fetch spending for the whole year to populate context charts
            const spendingRes = await getSpending(currentProfile._id, yearStr);
            const rawTransactions = spendingRes.data || [];

            setTransactions(rawTransactions);
            processYearlyCharts(rawTransactions);

        } catch (err) {
            console.error(err);
            setError('Failed to load spending data.');
        } finally {
            setLoading(false);
        }
    };

    const processYearlyCharts = (data) => {
        // 1. Prepare Timeline Data (Group by Month)
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyGroups = Array(12).fill(null).map((_, i) => ({
            name: monthNames[i],
            monthIndex: i,
            total: 0
        }));

        // 2. Prepare Heatmap Data
        const categorySet = new Set();
        const dataByMonthCat = {};

        data.forEach(t => {
            const date = new Date(t.date);
            const monthIdx = date.getMonth();
            const cat = t.category || 'Uncategorized';
            const amount = t.amount;

            // Timeline Aggregation
            if (!monthlyGroups[monthIdx][cat]) monthlyGroups[monthIdx][cat] = 0;
            monthlyGroups[monthIdx][cat] += amount;
            monthlyGroups[monthIdx].total += amount;

            // Heatmap Aggregation preparation
            categorySet.add(cat);
        });

        setTimelineData(monthlyGroups);

        // Heatmap Matrix
        const categories = Array.from(categorySet).sort();
        const heatmapMatrix = {};
        categories.forEach(cat => heatmapMatrix[cat] = Array(12).fill(0));

        data.forEach(t => {
            const date = new Date(t.date);
            const monthIdx = date.getMonth();
            const cat = t.category || 'Uncategorized';
            heatmapMatrix[cat][monthIdx] += t.amount;
        });

        setHeatmapData({
            months: monthNames,
            categories: categories,
            matrix: heatmapMatrix
        });
    };

    const processMonthlyData = (allTransactions) => {
        const targetMonth = currentDate.getMonth();
        const targetYear = currentDate.getFullYear();

        // Filter for specific month
        const currentMonthTx = allTransactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
        });

        setMonthlyTransactions(currentMonthTx);

        // Calculate KPIs for THIS MONTH
        const totalSpend = currentMonthTx.reduce((sum, t) => sum + t.amount, 0);

        // Calculate Top Category for THIS MONTH
        const catTotals = {};
        currentMonthTx.forEach(t => {
            const cat = t.category || 'Uncategorized';
            catTotals[cat] = (catTotals[cat] || 0) + t.amount;
        });
        const categoriesSorted = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
        const topCat = categoriesSorted.length > 0 ? { name: categoriesSorted[0][0], amount: categoriesSorted[0][1] } : { name: '-', amount: 0 };

        // For Avg Monthly, we generally look at the yearly context, so we use allTransactions
        // But maybe users want "Daily Average" for this month? 
        // Let's stick to Year-to-Date Monthly Average for context
        const annualTotal = allTransactions.reduce((sum, t) => sum + t.amount, 0);
        const monthsPassed = targetYear === new Date().getFullYear() ? new Date().getMonth() + 1 : 12;

        setKpiData({
            totalSpend: totalSpend, // This Month
            avgMonthly: annualTotal / monthsPassed, // YTD Average
            topCategory: topCat // This Month
        });
    };

    const handleDeleteTransactions = async (ids) => {
        try {
            await Promise.all(ids.map(id => deleteSpending(id)));
            fetchYearlyData(); // Refresh all
        } catch (err) {
            console.error('Delete failed', err);
            alert('Failed to delete transactions');
        }
    };

    const handleUpdateTransaction = (updatedT) => {
        // Implementation for edit would go here
        console.log('Update', updatedT);
    };

    if (loading && transactions.length === 0) return <div className="p-10 text-center text-white">Loading analysis...</div>;

    return (
        <div className="min-h-screen bg-[#0C0C0D] text-gray-100 p-6 md:p-8">
            {/* Header with Month Commander */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Spending Analysis</h1>
                    <p className="text-gray-400 text-sm">Deep dive into {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} spending.</p>
                </div>

                {/* Month Commander */}
                <div className="flex items-center bg-[#1C1C1E] rounded-lg border border-[#2C2C2E] p-1">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-[#2C2C2E] rounded-md text-gray-400 hover:text-white transition-colors">
                        <LuChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-6 py-1 text-center min-w-[180px]">
                        <span className="text-lg font-bold text-white block">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-[#2C2C2E] rounded-md text-gray-400 hover:text-white transition-colors">
                        <LuChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* KPI Cards (Monthly Focus) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#111214] border border-[#2C2C2E] p-5 rounded-xl">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total {currentDate.toLocaleString('default', { month: 'short' })} Spend</p>
                    <p className="text-3xl font-bold text-[#C6AA76]">${kpiData.totalSpend.toLocaleString()}</p>
                </div>
                <div className="bg-[#111214] border border-[#2C2C2E] p-5 rounded-xl">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Avg. Monthly (YTD)</p>
                    <p className="text-3xl font-bold text-gray-400">${kpiData.avgMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="bg-[#111214] border border-[#2C2C2E] p-5 rounded-xl">
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Top Cat. ({currentDate.toLocaleString('default', { month: 'short' })})</p>
                    <div>
                        <p className="text-2xl font-bold text-[#C6AA76] truncate">{kpiData.topCategory.name}</p>
                        <p className="text-sm text-gray-500">${kpiData.topCategory.amount.toLocaleString()} ({kpiData.totalSpend > 0 ? ((kpiData.topCategory.amount / kpiData.totalSpend) * 100).toFixed(1) : 0}%)</p>
                    </div>
                </div>
            </div>

            {/* Layout: Charts Top (Yearly Context), Ledger Bottom (Monthly Focus) */}

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8 h-auto xl:h-[400px]">
                {/* Timeline - Takes up 2/3 on large screens */}
                <div className="xl:col-span-2 bg-[#111214] border border-[#2C2C2E] p-6 rounded-xl flex flex-col">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <LuLayoutDashboard className="text-[#C6AA76]" /> Annual Trend ({currentDate.getFullYear()})
                    </h3>
                    <div className="flex-grow min-h-[300px]">
                        <SpendingTimelineChart data={timelineData} onBarClick={(payload) => console.log('Drilldown', payload)} />
                    </div>
                </div>

                {/* Heatmap */}
                <div className="bg-[#111214] border border-[#2C2C2E] p-6 rounded-xl flex flex-col overflow-hidden">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <LuList className="text-[#ef4444]" /> Annual Heatmap
                    </h3>
                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                        <SpendingHeatmap data={heatmapData} />
                    </div>
                </div>
            </div>

            {/* Ledger Section (Monthly Focus) */}
            <div className="mb-12">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    {currentDate.toLocaleDateString('en-US', { month: 'long' })} Transactions
                </h3>
                <TransactionLedger
                    transactions={monthlyTransactions}
                    onDelete={handleDeleteTransactions}
                    onUpdate={handleUpdateTransaction}
                />
            </div>
        </div>
    );
};

export default SpendingAnalysisPage;
