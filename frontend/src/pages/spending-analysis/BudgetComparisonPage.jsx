import React, { useState, useEffect } from 'react';
import { useProfile } from '../../context/ProfileContext';
import { getSpending } from '../../api/financeApi';
import BurnDownChart from './BurnDownChart';
import VarianceTable from './VarianceTable';
import { LuChevronLeft, LuChevronRight, LuTrendingDown, LuTriangleAlert, LuCheck } from 'react-icons/lu';

const BudgetComparisonPage = () => {
    const { currentProfile } = useProfile();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    // Processed Data
    const [burnDownData, setBurnDownData] = useState([]);
    const [varianceData, setVarianceData] = useState([]);
    const [summaryStats, setSummaryStats] = useState({
        totalBudget: 0,
        totalActual: 0,
        remaining: 0,
        safeDailySpend: 0,
        projectedOverage: 0
    });

    useEffect(() => {
        if (currentProfile) {
            fetchData();
        }
    }, [currentProfile, currentDate.getFullYear(), currentDate.getMonth()]);

    const changeMonth = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const yearStr = currentDate.getFullYear().toString();
            const monthIdx = currentDate.getMonth();

            // Fetch Spend
            const res = await getSpending(currentProfile._id, yearStr);
            const allTx = res.data || [];

            // Filter for Month
            const monthlyTx = allTx.filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === monthIdx && d.getFullYear() === currentDate.getFullYear();
            });

            processComparison(monthlyTx);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const processComparison = (transactions) => {
        const budgets = currentProfile.budgets || {};
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const today = new Date();
        const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
        const currentDay = isCurrentMonth ? today.getDate() : daysInMonth;

        // 1. Calculate Variance Data (Table)
        // Get all unique categories from both budgets and usage
        const allCategories = new Set([...Object.keys(budgets), ...transactions.map(t => t.category || 'Uncategorized')]);
        const comparisonList = [];
        let totalBudget = 0;
        let totalActual = 0;

        allCategories.forEach(cat => {
            const limit = budgets[cat] || 0;
            const spend = transactions.filter(t => (t.category || 'Uncategorized') === cat).reduce((sum, t) => sum + t.amount, 0);

            comparisonList.push({
                category: cat,
                budget: limit,
                actual: spend
            });

            totalBudget += limit;
            totalActual += spend;
        });

        setVarianceData(comparisonList);

        // 2. Calculate Burn Down Data (Chart)
        // Group spending by day
        const dailySpend = Array(daysInMonth + 1).fill(0);
        transactions.forEach(t => {
            const d = new Date(t.date).getDate();
            if (d <= daysInMonth) dailySpend[d] += t.amount;
        });

        // Accumulate
        const chartPoints = [];
        let cumulativeActual = 0;
        for (let i = 1; i <= daysInMonth; i++) {
            // Actual Logic: Only show up to "today" if current month, else show all
            let actualVal = null;
            if (!isCurrentMonth || i <= currentDay) {
                cumulativeActual += dailySpend[i];
                actualVal = cumulativeActual;
            }

            // Ideal Logic: Linear
            const idealVal = (totalBudget / daysInMonth) * i;

            chartPoints.push({
                day: i,
                actual: actualVal,
                ideal: Math.round(idealVal),
            });
        }
        setBurnDownData(chartPoints);

        // 3. Stats
        const remaining = totalBudget - totalActual;
        const daysRemaining = daysInMonth - currentDay;
        const safeDaily = daysRemaining > 0 && remaining > 0 ? remaining / daysRemaining : 0;
        const projectedTotal = (totalActual / (currentDay || 1)) * daysInMonth; // Simple extrapolation

        setSummaryStats({
            totalBudget,
            totalActual,
            remaining,
            safeDailySpend: safeDaily,
            projectedOverage: projectedTotal - totalBudget
        });
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading comparisons...</div>;

    const isOverBudget = summaryStats.totalActual > summaryStats.totalBudget;

    return (
        <div className="min-h-screen bg-[#0C0C0D] text-gray-100 p-6 md:p-8">
            {/* Context Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Budget Comparison</h1>
                    <p className="text-sm text-gray-400">Plan vs. Reality check.</p>
                </div>
                {/* Month Commander */}
                <div className="flex items-center bg-[#1C1C1E] rounded-lg border border-[#2C2C2E] p-1">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-[#2C2C2E] rounded-md text-gray-400">
                        <LuChevronLeft />
                    </button>
                    <div className="px-4 font-bold text-white min-w-[150px] text-center">
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-[#2C2C2E] rounded-md text-gray-400">
                        <LuChevronRight />
                    </button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#111214] border border-[#2C2C2E] p-4 rounded-xl">
                    <p className="text-gray-400 text-xs font-bold uppercase">Planned Budget</p>
                    <p className="text-2xl font-bold text-blue-400">${summaryStats.totalBudget.toLocaleString()}</p>
                </div>
                <div className="bg-[#111214] border border-[#2C2C2E] p-4 rounded-xl">
                    <p className="text-gray-400 text-xs font-bold uppercase">Actual Spent</p>
                    <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-500' : 'text-[#C6AA76]'}`}>
                        ${summaryStats.totalActual.toLocaleString()}
                    </p>
                </div>
                <div className="bg-[#111214] border border-[#2C2C2E] p-4 rounded-xl">
                    <p className="text-gray-400 text-xs font-bold uppercase">Safe Daily Spend</p>
                    <p className="text-2xl font-bold text-green-400">
                        ${summaryStats.safeDailySpend.toFixed(0)}<span className="text-sm text-gray-600">/day</span>
                    </p>
                    <p className="text-[10px] text-gray-500">to land exactly on budget</p>
                </div>
                <div className="bg-[#111214] border border-[#2C2C2E] p-4 rounded-xl">
                    <p className="text-gray-400 text-xs font-bold uppercase">Forecast</p>
                    <div className="flex items-center gap-2">
                        {summaryStats.projectedOverage > 0 ? (
                            <LuTriangleAlert className="text-red-500" />
                        ) : (
                            <LuCheck className="text-green-500" />
                        )}
                        <p className={`text-lg font-bold ${summaryStats.projectedOverage > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {summaryStats.projectedOverage > 0 ? `Checking for overage... $${summaryStats.projectedOverage.toFixed(0)}` : 'On Track'}
                        </p>
                    </div>
                    <p className="text-[10px] text-gray-500">
                        {summaryStats.projectedOverage > 0 ? 'Projected overspend by end of month' : 'Projected to be slightly under budget'}
                    </p>
                </div>
            </div>

            {/* Burn Down Chart */}
            <div className="bg-[#111214] border border-[#2C2C2E] p-6 rounded-xl mb-8 h-[350px]">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <LuTrendingDown className="text-blue-500" /> Monthly Burn Rate
                </h3>
                <BurnDownChart
                    data={burnDownData}
                    totalBudget={summaryStats.totalBudget}
                />
            </div>

            {/* Comparison Table */}
            <VarianceTable data={varianceData} />
        </div>
    );
};

export default BudgetComparisonPage;
