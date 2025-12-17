import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import StatCard from '../StatCard';
import SavingsProgress from '../charts/SavingsProgress';
import CashFlowChart from '../charts/CashFlowChart';
import PortfolioExpensePieChart from '../charts/PortfolioExpensePieChart';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const CashIcon = () => <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2v-1m0 0V3m0 2v-1m0 0V2m0 2v-1m0 0V1m0 2v-1m0 0V0m1.401 5.991C14.045 5.386 15 4.586 15 3.5c0-1.657-1.343-3-3-3S9 1.843 9 3.5c0 1.086.955 1.886 2.599 2.491m-2.599 0A3.002 3.002 0 007 9.5c0 1.657 1.343 3 3 3s3-1.343 3-3a3.002 3.002 0 00-2.599-3.509m0 0V16m0 8v-1m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1V19m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1V18m-5-9.409C4.955 8.114 4 7.314 4 6.25c0-1.657 1.343-3 3-3s3 1.343 3 3c0 1.064-.955 1.864-2.599 2.409M7 8.841V16m0 8v-1m0 1v-1m0 1v-1m0 1v-1m0 1V19m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1V18m10-9.159c1.644-.545 2.599-1.345 2.599-2.409 0-1.657-1.343-3-3-3s-3 1.343-3 3c0 1.064.955 1.864 2.599 2.409M17 8.841V16m0 8v-1m0 1v-1m0 1v-1m0 1v-1m0 1V19m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1V18" /></svg>;
const PortfolioIcon = () => <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const OccupancyIcon = () => <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-1-4a1 1 0 11-2 0 1 1 0 012 0z" /></svg>;

const Dashboard = ({ data }) => {
    const { settings } = useSettings();
    const totalMonthlyContribution = data.totalMonthlyCashFlow + settings.personalMonthlySavings;

    return (
        <div className="p-4 space-y-4">
            <header className="pt-4 pb-2">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500">Your financial portfolio at a glance.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Monthly Cash Flow"
                    value={formatCurrency(data.totalMonthlyCashFlow)}
                    icon={<CashIcon />}
                />
                <StatCard
                    title="Portfolio Value"
                    value={formatCurrency(data.totalPortfolioValue)}
                    icon={<PortfolioIcon />}
                />
                <StatCard
                    title="Portfolio Occupancy"
                    value={`${data.portfolioOccupancy.toFixed(0)}%`}
                    icon={<OccupancyIcon />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                    <SavingsProgress
                        current={settings.currentSavings}
                        target={settings.savingsTarget}
                        monthlyContribution={totalMonthlyContribution}
                    />
                </div>
                <div className="lg:col-span-2">
                    <PortfolioExpensePieChart
                        piti={data.totalPITI}
                        opex={data.totalOpex}
                        unitCosts={data.totalUnitCosts}
                    />
                </div>
            </div>

            <CashFlowChart data={data.cashFlowByProperty} />

        </div>
    );
};

export default Dashboard;
