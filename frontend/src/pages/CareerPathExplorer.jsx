import React, { useState, useEffect, useRef } from 'react';
import { compareCareerPaths, getCareerPathTemplates } from '../api/financeApi';
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
    const [availablePaths, setAvailablePaths] = useState([]);
    const [selectedPathIds, setSelectedPathIds] = useState([]);

    // Section 3: Results
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Validation errors
    const [validationErrors, setValidationErrors] = useState({});

    // Ref for smooth scrolling to results
    const resultsRef = useRef(null);

    // Demo preset selector
    const [selectedPreset, setSelectedPreset] = useState('');

    // Demo preset configurations
    const demoPresets = {
        'high-school-senior': {
            name: 'High School Senior — College vs Trade vs Military',
            inputs: { age: 18, startingSavings: 2000, monthlyLifestyleCost: 1200, riskTolerance: 'medium' },
            paths: ['college_4yr_state', 'trade_school_2yr', 'military_gi_bill_college']
        },
        'career-changer': {
            name: 'Career Changer (Age 30)',
            inputs: { age: 30, startingSavings: 15000, monthlyLifestyleCost: 2000, riskTolerance: 'medium' },
            paths: ['trade_school_2yr', 'community_college_transfer', 'work_now']
        },
        'military-gi-bill': {
            name: 'Military → GI Bill → College',
            inputs: { age: 22, startingSavings: 10000, monthlyLifestyleCost: 1500, riskTolerance: 'low' },
            paths: ['military_gi_bill_college', 'college_4yr_state', 'trade_school_2yr']
        },
        'work-vs-apprentice': {
            name: 'Work Now vs Apprenticeship',
            inputs: { age: 18, startingSavings: 500, monthlyLifestyleCost: 1000, riskTolerance: 'high' },
            paths: ['work_now', 'apprenticeship', 'trade_school_2yr']
        }
    };

    // Fetch templates on mount
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await getCareerPathTemplates();
                if (response.success) {
                    setAvailablePaths(response.data);
                }
            } catch (err) {
                console.error("Failed to load path templates", err);
                setError("Failed to load career path options.");
            }
        };
        fetchTemplates();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const numValue = name === 'riskTolerance' ? value : Number(value);

        setUserInputs(prev => ({
            ...prev,
            [name]: numValue
        }));

        // Validate on change
        const errors = { ...validationErrors };

        if (name === 'age') {
            if (numValue < 14 || numValue > 65) {
                errors.age = 'Age must be between 14 and 65';
            } else {
                delete errors.age;
            }
        }

        if (name === 'startingSavings') {
            if (numValue < 0) {
                errors.startingSavings = 'Savings cannot be negative';
            } else {
                delete errors.startingSavings;
            }
        }

        if (name === 'monthlyLifestyleCost') {
            if (numValue <= 0) {
                errors.monthlyLifestyleCost = 'Lifestyle cost must be greater than 0';
            } else {
                delete errors.monthlyLifestyleCost;
            }
        }

        setValidationErrors(errors);
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

    const loadPreset = async (presetKey) => {
        if (!presetKey || !demoPresets[presetKey]) return;

        const preset = demoPresets[presetKey];

        // Populate inputs
        setUserInputs(preset.inputs);

        // Select paths
        setSelectedPathIds(preset.paths);

        // Clear validation errors
        setValidationErrors({});
        setError(null);

        // Auto-run comparison after a brief delay to ensure state updates
        setTimeout(async () => {
            setLoading(true);
            try {
                const response = await compareCareerPaths({
                    userInputs: preset.inputs,
                    selectedPathIds: preset.paths,
                    horizonYears: 10
                });

                if (response.success) {
                    setResults(response.data);
                    // Smooth scroll to results
                    setTimeout(() => {
                        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                } else {
                    setError("Failed to load comparison data.");
                }
            } catch (err) {
                console.error(err);
                setError("We couldn't compare those paths. Check your numbers and try again.");
            } finally {
                setLoading(false);
            }
        }, 300);
    };

    const handleCompare = async () => {
        // Validate inputs
        const errors = {};

        if (userInputs.age < 14 || userInputs.age > 65) {
            errors.age = 'Age must be between 14 and 65';
        }
        if (userInputs.startingSavings < 0) {
            errors.startingSavings = 'Savings cannot be negative';
        }
        if (userInputs.monthlyLifestyleCost <= 0) {
            errors.monthlyLifestyleCost = 'Lifestyle cost must be greater than 0';
        }
        if (selectedPathIds.length < 2) {
            errors.paths = 'Please select at least 2 paths to compare';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setError("Please fix the validation errors before comparing.");
            return;
        }

        setLoading(true);
        setError(null);
        setValidationErrors({});

        try {
            const response = await compareCareerPaths({
                userInputs,
                selectedPathIds,
                horizonYears: 10
            });

            if (response.success) {
                setResults(response.data);
                // Smooth scroll to results
                setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
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

    // Consistent Color Mapping
    const pathColors = {
        "4-Year State College": "#2563eb",
        "Trade School (2-year)": "#16a34a",
        "Military → GI Bill → College": "#dc2626",
        "Work Now": "#9333ea",
        "Community College → Transfer": "#0891b2",
        "Nursing Associate → RN Bridge": "#d97706",
        "Apprenticeship Path": "#059669",
        "Military Enlistment": "#7c3aed"
    };

    const fallbackColors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    const getPathColor = (pathName, index) => {
        return pathColors[pathName] || fallbackColors[index % fallbackColors.length];
    };

    // Helper to get path details
    const getPathDetails = (id) => availablePaths.find(p => p.id === id);

    // Compute Recommendations
    const computeRecommendations = () => {
        if (!results || !results.paths || results.paths.length === 0) return null;

        const pathsWithMetrics = results.paths.map(path => {
            const netCash10 = path.summary.netCashAtHorizon;
            const breakEvenYear = path.breakEvenYear || Infinity;
            const pathDetails = getPathDetails(path.id);
            const educationCost = pathDetails?.educationCost || 0;

            return {
                ...path,
                netCash10,
                breakEvenYear,
                educationCost
            };
        });

        // Find best overall (highest net cash at Year 10)
        let bestOverall = pathsWithMetrics[0];
        for (const path of pathsWithMetrics) {
            if (path.netCash10 > bestOverall.netCash10) {
                bestOverall = path;
            } else if (path.netCash10 === bestOverall.netCash10) {
                // Tie-breaker: faster break-even
                if (path.breakEvenYear < bestOverall.breakEvenYear) {
                    bestOverall = path;
                } else if (path.breakEvenYear === bestOverall.breakEvenYear) {
                    // Tie-breaker: lower education cost
                    if (path.educationCost < bestOverall.educationCost) {
                        bestOverall = path;
                    }
                }
            }
        }

        // Find fastest break-even
        let fastestBreakEven = pathsWithMetrics[0];
        for (const path of pathsWithMetrics) {
            if (path.breakEvenYear < fastestBreakEven.breakEvenYear) {
                fastestBreakEven = path;
            } else if (path.breakEvenYear === fastestBreakEven.breakEvenYear) {
                // Tie-breaker: higher net cash
                if (path.netCash10 > fastestBreakEven.netCash10) {
                    fastestBreakEven = path;
                } else if (path.netCash10 === fastestBreakEven.netCash10) {
                    // Tie-breaker: lower education cost
                    if (path.educationCost < fastestBreakEven.educationCost) {
                        fastestBreakEven = path;
                    }
                }
            }
        }

        return { bestOverall, fastestBreakEven };
    };

    const recommendations = computeRecommendations();

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl shadow-lg p-8 text-white">
                <h1 className="text-4xl font-bold mb-2">PathFinder V2</h1>
                <p className="text-xl opacity-90">Compare college, trades, military, and work-now paths with real numbers.</p>
            </div>

            {/* Demo Scenarios */}
            <h2 className="text-xl font-semibold mt-8 mb-2">Demo Scenarios</h2>
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <select
                        value={selectedPreset}
                        onChange={(e) => setSelectedPreset(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[300px]"
                    >
                        <option value="">Select a demo scenario...</option>
                        {Object.entries(demoPresets).map(([key, preset]) => (
                            <option key={key} value={key}>{preset.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => loadPreset(selectedPreset)}
                        disabled={!selectedPreset || loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform transition hover:scale-105"
                    >
                        {loading ? 'Loading...' : 'Load Preset'}
                    </button>
                </div>
            </div>

            {/* Section 1: Tell us about you */}
            <h2 className="text-xl font-semibold mt-8 mb-2">Tell Us About You</h2>
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Age</label>
                        <input
                            type="number"
                            name="age"
                            value={userInputs.age}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${validationErrors.age ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {validationErrors.age && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.age}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Savings ($)</label>
                        <input
                            type="number"
                            name="startingSavings"
                            value={userInputs.startingSavings}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${validationErrors.startingSavings ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {validationErrors.startingSavings && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.startingSavings}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Lifestyle Cost ($)</label>
                        <input
                            type="number"
                            name="monthlyLifestyleCost"
                            value={userInputs.monthlyLifestyleCost}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${validationErrors.monthlyLifestyleCost ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />
                        {validationErrors.monthlyLifestyleCost && (
                            <p className="text-red-600 text-sm mt-1">{validationErrors.monthlyLifestyleCost}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Section 2: Pick paths */}
            <h2 className="text-xl font-semibold mt-8 mb-2">Choose Your Paths</h2>
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Pick 2–4 paths to compare</h3>

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

                {validationErrors.paths && (
                    <p className="text-red-600 text-sm mb-4 text-center">{validationErrors.paths}</p>
                )}

                <div className="flex justify-center mt-4 mb-6">
                    <button
                        onClick={handleCompare}
                        disabled={loading || Object.keys(validationErrors).length > 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform transition hover:scale-105"
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
                <div ref={resultsRef} className="space-y-6 animate-fade-in">

                    {/* Path Details Cards */}
                    <h2 className="text-xl font-semibold mt-8 mb-2">Path Details</h2>
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Path Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {selectedPathIds.map((id, idx) => {
                                const path = getPathDetails(id);
                                if (!path) return null;
                                const borderColor = getPathColor(path.name, idx);

                                return (
                                    <div key={id} className="shadow-md p-4 rounded-lg border-l-4" style={{ borderColor }}>
                                        <h3 className="text-lg font-bold text-gray-800 mb-3">{path.name}</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Education Cost:</span>
                                                <span className="font-medium">${path.educationCost.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Years of School:</span>
                                                <span className="font-medium">{path.yearsOfSchool} years</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Starting Salary:</span>
                                                <span className="font-medium">${path.startingSalary.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Salary Growth:</span>
                                                <span className="font-medium">{(path.salaryGrowthRate * 100).toFixed(1)}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Lifestyle Cost:</span>
                                                <span className="font-medium">${path.livingCost.toLocaleString()}/mo</span>
                                            </div>
                                            {path.hasGiBill && (
                                                <div className="mt-2 pt-2 border-t border-gray-100">
                                                    <span className="block text-xs font-semibold text-blue-600 uppercase tracking-wide">GI Bill / Benefits</span>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Housing: ${path.militaryBenefits?.housingOffset}/mo <br />
                                                        Tuition: ${path.militaryBenefits?.tuitionCoverage}
                                                    </p>
                                                </div>
                                            )}
                                            {path.notes && (
                                                <div className="mt-2 pt-2 border-t border-gray-100">
                                                    <p className="text-xs text-gray-500 italic">"{path.notes}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recommended Path */}
                    <h2 className="text-xl font-semibold mt-8 mb-2">Recommended Path</h2>
                    {recommendations && (
                        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mb-6">
                            <h3 className="text-lg font-bold text-blue-900 mb-2">Recommended Path</h3>
                            <div className="text-blue-800">
                                <p className="mb-1">
                                    <span className="font-semibold">{recommendations.bestOverall.name}</span> is the strongest long-term financial choice,
                                    {recommendations.bestOverall.breakEvenYear !== Infinity
                                        ? `breaking even by Year ${recommendations.bestOverall.breakEvenYear}`
                                        : 'though it may not break even within 10 years'
                                    } and ending with <span className="font-semibold">${recommendations.bestOverall.netCash10.toLocaleString()}</span> by Year 10.
                                </p>
                                {recommendations.fastestBreakEven.id !== recommendations.bestOverall.id && recommendations.fastestBreakEven.breakEvenYear !== Infinity && (
                                    <p className="text-sm">
                                        <span className="font-semibold">{recommendations.fastestBreakEven.name}</span> reaches financial break-even the fastest at Year {recommendations.fastestBreakEven.breakEvenYear}.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <h2 className="text-xl font-semibold mt-8 mb-2">Your Tradeoffs</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {results.paths.map((path, idx) => (
                            <div key={path.id} className="bg-white rounded-xl shadow p-4 border-t-4" style={{ borderColor: getPathColor(path.name, idx) }}>
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
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Cumulative Net Cash</h3>
                                <p className="text-gray-500 text-sm mt-1">
                                    Total cash in your pocket (or debt) over time. <br />
                                    <span className="italic">Higher is better. Positive means you've paid off costs and are saving.</span>
                                </p>
                            </div>
                        </div>

                        {/* Custom Legend */}
                        <div className="flex gap-4 items-center flex-wrap py-2 mb-4">
                            {results.paths.map((path, idx) => (
                                <div key={path.id} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: getPathColor(path.name, idx) }}
                                    />
                                    <span className="text-sm text-gray-700">{path.name}</span>
                                </div>
                            ))}
                        </div>

                        <div className="h-[350px] py-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="year"
                                        label={{ value: 'Years', position: 'insideBottom', offset: -5, style: { fontSize: 14 } }}
                                        style={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        label={{ value: 'Dollars ($)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }}
                                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                        style={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                                                        <p className="font-semibold text-gray-800 mb-2">{label}</p>
                                                        {payload.map((entry, index) => (
                                                            <div key={index} className="text-sm">
                                                                <span style={{ color: entry.color }} className="font-medium">
                                                                    {entry.name}:
                                                                </span>
                                                                <span className="ml-2">
                                                                    ${entry.value.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    {results.paths.map((path, idx) => (
                                        <Line
                                            key={path.id}
                                            type="monotone"
                                            dataKey={`${path.id}_netCash`}
                                            name={path.name}
                                            stroke={getPathColor(path.name, idx)}
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
                        <p className="text-gray-500 text-sm mb-4">Annual earnings before tax and expenses.</p>

                        {/* Custom Legend */}
                        <div className="flex gap-4 items-center flex-wrap py-2 mb-4">
                            {results.paths.map((path, idx) => (
                                <div key={path.id} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: getPathColor(path.name, idx) }}
                                    />
                                    <span className="text-sm text-gray-700">{path.name}</span>
                                </div>
                            ))}
                        </div>

                        <div className="h-[350px] py-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="year"
                                        label={{ value: 'Years', position: 'insideBottom', offset: -5, style: { fontSize: 14 } }}
                                        style={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        label={{ value: 'Dollars ($)', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }}
                                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                        style={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                                                        <p className="font-semibold text-gray-800 mb-2">{label}</p>
                                                        {payload.map((entry, index) => (
                                                            <div key={index} className="text-sm">
                                                                <span style={{ color: entry.color }} className="font-medium">
                                                                    {entry.name}:
                                                                </span>
                                                                <span className="ml-2">
                                                                    ${entry.value.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    {results.paths.map((path, idx) => (
                                        <Line
                                            key={path.id}
                                            type="monotone"
                                            dataKey={`${path.id}_income`}
                                            name={path.name}
                                            stroke={getPathColor(path.name, idx)}
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
