import React, { useState } from 'react';
import { runV4Projection } from '../api/financeApi';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

import { useProfile } from '../context/ProfileContext';

const ProjectionSandboxV4 = () => {
    const { currentProfile } = useProfile();
    const [years, setYears] = useState(50);
    const [projection, setProjection] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleRunProjection = async () => {
        try {
            setLoading(true);
            const response = await runV4Projection({
                years,
                profileId: currentProfile?._id
            });
            setProjection(response.data.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Projection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to format currency
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(value);
    };

    // Prepare data for charts
    const chartData = projection ? projection.years.map((year, index) => ({
        year,
        netWorth: projection.netWorth[index],
        cashflow: projection.cashflow[index],
        investments: projection.totalInvestments[index],
        debts: projection.totalDebts[index],
        income: projection.income[index],
        spending: projection.spending[index]
    })) : [];

    return (
        <div className="p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Projection Sandbox (V4)</h1>
            </div>



            {/* Section A: Controls */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Projection Controls</h2>
                <div className="flex items-center space-x-6">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Projection Years: {years}
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={years}
                            onChange={(e) => setYears(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>1 Year</span>
                            <span>100 Years</span>
                        </div>
                    </div>
                    <button
                        onClick={handleRunProjection}
                        disabled={loading}
                        className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${loading
                            ? 'bg-indigo-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                    >
                        {loading ? 'Running...' : 'Run Projection (V4)'}
                    </button>
                </div>
                {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}
            </div>

            {/* Section B: Results */}
            {projection && (
                <div className="space-y-8">
                    {/* Net Worth Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Net Worth Trajectory</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" />
                                    <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                    <Line type="monotone" dataKey="netWorth" stroke="#4F46E5" strokeWidth={2} name="Net Worth" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Cashflow & Investments Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Cashflow Analysis</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year" />
                                        <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Legend />
                                        <Line type="monotone" dataKey="income" stroke="#10B981" name="Income" />
                                        <Line type="monotone" dataKey="spending" stroke="#EF4444" name="Spending" />
                                        <Line type="monotone" dataKey="cashflow" stroke="#3B82F6" name="Net Cashflow" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Assets vs Debts</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year" />
                                        <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Legend />
                                        <Line type="monotone" dataKey="investments" stroke="#8B5CF6" name="Investments" />
                                        <Line type="monotone" dataKey="debts" stroke="#F59E0B" name="Total Debt" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Section C: Raw Data Table */}
                    <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
                        <h3 className="text-lg font-semibold mb-4">Detailed Projection Data</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Worth</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spending</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cashflow</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investments</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debts</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {chartData.map((row) => (
                                        <tr key={row.year} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.year}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-bold">{formatCurrency(row.netWorth)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatCurrency(row.income)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(row.spending)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{formatCurrency(row.cashflow)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">{formatCurrency(row.investments)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{formatCurrency(row.debts)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectionSandboxV4;
