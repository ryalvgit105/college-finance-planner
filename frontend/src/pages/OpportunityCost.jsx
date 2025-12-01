import React, { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { getPathTemplates, compareOpportunityCost } from '../api/financeApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const OpportunityCost = () => {
    const { currentProfile } = useProfile();
    const [templates, setTemplates] = useState([]);
    const [selectedTemplates, setSelectedTemplates] = useState([]);
    const [projectionYears, setProjectionYears] = useState(10);
    const [comparisonData, setComparisonData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await getPathTemplates();
            if (res.success) {
                setTemplates(res.data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load templates');
        }
    };

    const handleTemplateToggle = (id) => {
        setSelectedTemplates(prev => {
            if (prev.includes(id)) {
                return prev.filter(t => t !== id);
            } else {
                if (prev.length >= 4) return prev; // Max 4
                return [...prev, id];
            }
        });
    };

    const handleCompare = async () => {
        if (!currentProfile) return;
        if (selectedTemplates.length < 1) {
            setError('Please select at least one path to analyze.');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const res = await compareOpportunityCost({
                profileId: currentProfile._id,
                selectedTemplates,
                projectionYears
            });

            if (res.success) {
                setComparisonData(res.data);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to calculate comparison');
        } finally {
            setLoading(false);
        }
    };

    // Prepare chart data
    const prepareChartData = () => {
        if (!comparisonData) return [];

        const chartData = [];
        const years = comparisonData.projectionYears;

        for (let i = 0; i < years; i++) {
            const point = { year: i + 1 };
            comparisonData.results.forEach(res => {
                if (res.yearlyData[i]) {
                    point[`${res.templateName} Net Worth`] = res.yearlyData[i].cumulativeNetWorth;
                    point[`${res.templateName} Earnings`] = res.yearlyData[i].cumulativeEarnings;
                }
            });
            chartData.push(point);
        }
        return chartData;
    };

    const chartData = prepareChartData();
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold text-gray-800">Opportunity Cost Analyzer</h1>
            <p className="text-gray-600">Compare different life paths to see the long-term financial impact.</p>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">1. Select Paths to Compare</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {templates.map(template => (
                        <div
                            key={template._id}
                            onClick={() => handleTemplateToggle(template._id)}
                            className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${selectedTemplates.includes(template._id)
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            <h3 className="font-bold text-gray-800">{template.templateName}</h3>
                            <p className="text-sm text-gray-600">{template.durationYears}yr delay</p>
                            <p className="text-sm text-gray-600">${template.startingSalary.toLocaleString()}/yr start</p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center space-x-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Projection (Years)</label>
                        <input
                            type="number"
                            value={projectionYears}
                            onChange={(e) => setProjectionYears(parseInt(e.target.value))}
                            className="p-2 border rounded w-32"
                            min="5" max="50"
                        />
                    </div>
                    <button
                        onClick={handleCompare}
                        disabled={loading || !currentProfile}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 mt-6"
                    >
                        {loading ? 'Calculating...' : 'Run Comparison'}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>

            {/* Results */}
            {comparisonData && (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {comparisonData.results.map((res, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow p-6 border-t-4" style={{ borderColor: colors[idx % colors.length] }}>
                                <h3 className="text-xl font-bold mb-2">{res.templateName}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Final Net Worth</span>
                                        <span className="font-bold text-green-600">${res.finalNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Earnings</span>
                                        <span className="font-semibold">${res.totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Taxes</span>
                                        <span className="font-semibold text-red-500">${res.totalTaxes.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Break Even & Long Term Difference Alert */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {comparisonData.breakEvenYear && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                                <p className="font-semibold text-yellow-800">
                                    ⚖️ Break-Even Point: Year {comparisonData.breakEvenYear}
                                </p>
                                <p className="text-yellow-700 text-sm">
                                    This is when the paths cross in terms of Net Worth.
                                </p>
                            </div>
                        )}
                        {comparisonData.longTermDifference > 0 && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                                <p className="font-semibold text-green-800">
                                    💰 Long-Term Difference: ${comparisonData.longTermDifference.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                                <p className="text-green-700 text-sm">
                                    The difference in Net Worth between the best and worst path after {comparisonData.projectionYears} years.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow">
                            <h3 className="text-lg font-bold mb-4">Net Worth Projection</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                                    <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                                    <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                                    <Legend />
                                    {comparisonData.results.map((res, idx) => (
                                        <Line
                                            key={idx}
                                            type="monotone"
                                            dataKey={`${res.templateName} Net Worth`}
                                            stroke={colors[idx % colors.length]}
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow">
                            <h3 className="text-lg font-bold mb-4">Cumulative Earnings</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                                    <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                                    <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
                                    <Legend />
                                    {comparisonData.results.map((res, idx) => (
                                        <Line
                                            key={idx}
                                            type="monotone"
                                            dataKey={`${res.templateName} Earnings`}
                                            stroke={colors[idx % colors.length]}
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            dot={false}
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

export default OpportunityCost;
