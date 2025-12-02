import React, { useState } from 'react';
import { compareCareerPaths } from '../api/financeApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CareerPathExplorer = () => {
    // Section 1: User Inputs
    const [userInputs, setUserInputs] = useState({
        age: 18,
        startingSavings: 0,
        monthlyLifestyleCost: 1200,
        riskTolerance: 'medium'
    });

    // Section 2: Path Selection
    const availablePaths = [
        { id: 'college_4yr_state', name: '4-Year State College' },
        { id: 'trade_school_2yr', name: 'Trade School (2-year)' },
        { id: 'military_enlist', name: 'Military Enlistment' },
        { id: 'work_now', name: 'Work Now' },
        { id: 'community_college_transfer', name: 'Community College → Transfer' },
        { id: 'nursing_assoc_rn', name: 'Nursing Associate → RN Bridge' },
        { id: 'apprenticeship', name: 'Apprenticeship Path' },
        { id: 'military_gi_bill_college', name: 'Military → GI Bill → College' }
    ];

    const [selectedPathIds, setSelectedPathIds] = useState([]);

    // Section 3: Results
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInputs(prev => ({
            ...prev,
            [name]: name === 'riskTolerance' ? value : Number(value)
        }));
    };

    const togglePathSelection = (pathId) => {
        setSelectedPathIds(prev => {
            if (prev.includes(pathId)) {
                return prev.filter(id => id !== pathId);
            } else {
                if (prev.length >= 4) return prev; // Max 4
                return [...prev, pathId];
            }
        });
    };

    const loadDemoPreset = () => {
        setUserInputs({
            age: 18,
            startingSavings: 2000,
            monthlyLifestyleCost: 1200,
            riskTolerance: 'medium'
        });
        setSelectedPathIds(['college_4yr_state', 'trade_school_2yr', 'military_gi_bill_college']);
    };

    const handleCompare = async () => {
        if (selectedPathIds.length < 2) {
            setError("Please select at least 2 paths to compare.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await compareCareerPaths({
                userInputs,
                selectedPathIds,
                horizonYears: 10
            });

            if (response.success) {
                setResults(response.data);
            } else {
                setError("Failed to load comparison data.");
            }
        } catch (err) {
            console.error(err);
            setError("We couldn't compare those paths. Check your numbers and try again.");
        } finally {
            setLoading(false);
        }
    };

    // Prepare Chart Data
    const prepareChartData = () => {
        if (!results) return [];
        const data = [];
        const horizon = results.horizonYears;

        for (let i = 0; i < horizon; i++) {
            const yearData = { year: `Year ${i + 1}` };
            results.paths.forEach(path => {
                yearData[`${path.id}_netCash`] = path.series.cumulativeNetCash[i];
                yearData[`${path.id}_income`] = path.series.yearlyIncome[i];
            });
            data.push(yearData);
        }
        return data;
    };

    const chartData = prepareChartData();
    const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl shadow-lg p-8 text-white">
                <h1 className="text-4xl font-bold mb-2">PathFinder V2</h1>
                <p className="text-xl opacity-90">Compare college, trades, military, and work-now paths with real numbers.</p>
            </div>

            {/* Section 1: Tell us about you */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">1. Tell us about you</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Age</label>
                        <input
                            type="number"
                            name="age"
                            value={userInputs.age}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Savings ($)</label>
                        <input
                            type="number"
                            name="startingSavings"
                            value={userInputs.startingSavings}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Lifestyle Cost ($)</label>
                        <input
                            type="number"
                            name="monthlyLifestyleCost"
                            value={userInputs.monthlyLifestyleCost}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Section 2: Pick paths */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">2. Pick 2–4 paths to compare</h2>
                    <button
                        onClick={loadDemoPreset}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1 rounded-full"
                    >
                        Load Demo Preset
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {availablePaths.map(path => (
                        <div
                            key={path.id}
                            onClick={() => togglePathSelection(path.id)}
                            className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${selectedPathIds.includes(path.id)
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedPathIds.includes(path.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                                    }`}>
                                    {selectedPathIds.includes(path.id) && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className="font-medium text-gray-700">{path.name}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleCompare}
                        disabled={loading || selectedPathIds.length < 2}
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform transition hover:scale-105"
                    >
                        {loading ? 'Simulating...' : 'Compare Paths'}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}
            </div>

            {/* Section 3: Results */}
            {results && (
                <div className="space-y-6 animate-fade-in">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {results.paths.map((path, idx) => (
                            <div key={path.id} className="bg-white rounded-xl shadow p-4 border-t-4" style={{ borderColor: colors[idx % colors.length] }}>
                                <h3 className="font-bold text-gray-800 mb-2 truncate" title={path.name}>{path.name}</h3>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Net Cash (10y):</span>
                                        <span className={`font-bold ${path.summary.netCashAtHorizon >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ${path.summary.netCashAtHorizon.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Peak Debt:</span>
                                        <span className="font-medium text-red-500">${path.summary.peakDebt.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Break-Even:</span>
                                        <span className="font-medium text-gray-800">{path.breakEvenYear ? `Year ${path.breakEvenYear}` : 'Not in 10y'}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cumulative Net Cash Chart */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Cumulative Net Cash</h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    Total cash in your pocket (or debt) over time. <br />
                                    <span className="italic">Higher is better. Positive means you've paid off costs and are saving.</span>
                                </p>
                            </div>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="year" />
                                    <YAxis
                                        tickFormatter={(value) => `$${value / 1000}k`}
                                    />
                                    <Tooltip
                                        formatter={(value) => `$${value.toLocaleString()}`}
                                        labelStyle={{ color: '#374151' }}
                                    />
                                    <Legend />
                                    {results.paths.map((path, idx) => (
                                        <Line
                                            key={path.id}
                                            type="monotone"
                                            dataKey={`${path.id}_netCash`}
                                            name={path.name}
                                            stroke={colors[idx % colors.length]}
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Yearly Income Chart */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Yearly Income</h3>
                        <p className="text-gray-500 text-sm mb-6">Annual earnings before tax and expenses.</p>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="year" />
                                    <YAxis
                                        tickFormatter={(value) => `$${value / 1000}k`}
                                    />
                                    <Tooltip
                                        formatter={(value) => `$${value.toLocaleString()}`}
                                        labelStyle={{ color: '#374151' }}
                                    />
                                    <Legend />
                                    {results.paths.map((path, idx) => (
                                        <Line
                                            key={path.id}
                                            type="monotone"
                                            dataKey={`${path.id}_income`}
                                            name={path.name}
                                            stroke={colors[idx % colors.length]}
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareerPathExplorer;
