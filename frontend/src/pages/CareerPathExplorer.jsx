import React, { useState, useEffect, useRef } from 'react';
import { compareCareerPaths, getCareerPathTemplates, evaluateCareerPaths } from '../api/financeApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import UserProfileForm from '../components/UserProfileForm';
import PreferenceWeightsForm from '../components/PreferenceWeightsForm';

// West Point Color Palette
const WP_BLACK = "#1C1C1C";
const WP_DARK = "#2E2D2D";
const WP_GOLD = "#C6AA76";
const WP_GOLD_ACCENT = "#D4B483";
const WP_GRAY = "#A7A8AA";

const CareerPathExplorer = () => {
    // Form inputs
    const [formValues, setFormValues] = useState({
        age: 18,
        startingSavings: 0,
        monthlyLifestyleCost: 1200
    });

    // Validation
    const [validationErrors, setValidationErrors] = useState({});

    // Path selection
    const [availablePaths, setAvailablePaths] = useState([]);
    const [selectedPathIds, setSelectedPathIds] = useState([]);

    // V2 Comparison results
    const [comparisonResult, setComparisonResult] = useState(null);
    const [loadingCompare, setLoadingCompare] = useState(false);
    const [errorCompare, setErrorCompare] = useState(null);

    // V3 AI Advisor
    const [userProfile, setUserProfile] = useState(null);
    const [preferenceWeights, setPreferenceWeights] = useState({
        financialWeight: 40,
        lifestyleWeight: 30,
        independenceWeight: 30
    });
    const [aiAdvisorResult, setAiAdvisorResult] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [errorAI, setErrorAI] = useState(null);

    // Ref for scrolling
    const resultsRef = useRef(null);

    // Fetch path templates on mount
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await getCareerPathTemplates();
                if (response.success) {
                    setAvailablePaths(response.data);
                }
            } catch (error) {
                console.error('Error fetching templates:', error);
            }
        };
        fetchTemplates();
    }, []);

    // Path colors mapping
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

    const getPathColor = (pathName, index = 0) => {
        return pathColors[pathName] || fallbackColors[index % fallbackColors.length];
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const numValue = Number(value);

        setFormValues(prev => ({
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

    // Toggle path selection (unlimited)
    const togglePathSelection = (pathId) => {
        setSelectedPathIds(prev => {
            if (prev.includes(pathId)) {
                return prev.filter(id => id !== pathId);
            } else {
                return [...prev, pathId];
            }
        });
    };

    // Handle Compare Paths (V2)
    const handleCompare = async () => {
        // Validate
        const errors = {};

        if (formValues.age < 14 || formValues.age > 65) {
            errors.age = 'Age must be between 14 and 65';
        }
        if (formValues.startingSavings < 0) {
            errors.startingSavings = 'Savings cannot be negative';
        }
        if (formValues.monthlyLifestyleCost <= 0) {
            errors.monthlyLifestyleCost = 'Lifestyle cost must be greater than 0';
        }
        if (selectedPathIds.length < 2) {
            errors.paths = 'Please select at least 2 paths to compare';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            setErrorCompare('Please fix the validation errors before comparing.');
            return;
        }

        setLoadingCompare(true);
        setErrorCompare(null);
        setValidationErrors({});

        try {
            const response = await compareCareerPaths({
                userInputs: {
                    age: formValues.age,
                    startingSavings: formValues.startingSavings,
                    monthlyLifestyleCost: formValues.monthlyLifestyleCost,
                    riskTolerance: 'medium'
                },
                selectedPathIds,
                horizonYears: 10
            });

            if (response.success) {
                setComparisonResult(response.data);
                setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else {
                setErrorCompare('Failed to load comparison data.');
            }
        } catch (err) {
            console.error(err);
            setErrorCompare('We couldn\'t compare those paths. Check your numbers and try again.');
        } finally {
            setLoadingCompare(false);
        }
    };

    // Handle AI Recommendation (V3)
    const handleGetAIRecommendation = async () => {
        if (selectedPathIds.length < 2) {
            setErrorAI('Please select at least 2 paths to get AI recommendations.');
            return;
        }

        setLoadingAI(true);
        setErrorAI(null);

        try {
            // Build profile with defaults if user skipped the form
            const profileData = userProfile || {
                age: formValues.age,
                startingSavings: formValues.startingSavings,
                monthlyLifestyleCost: formValues.monthlyLifestyleCost,
                riskTolerance: 'medium',
                skillConfidence: 5,
                structureCreativity: 5,
                workLifeBalance: 5,
                careerInterest: '',
                careerValues: []
            };

            const weights = preferenceWeights || {
                financialWeight: 40,
                lifestyleWeight: 30,
                independenceWeight: 30
            };

            const response = await evaluateCareerPaths(
                profileData,
                selectedPathIds,
                weights
            );

            if (response.success) {
                setAiAdvisorResult(response.data);
                setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else {
                setErrorAI('Failed to get AI recommendations. Please try again.');
            }
        } catch (err) {
            console.error('AI Recommendation Error:', err);
            setErrorAI('Unable to generate recommendations. Please try again.');
        } finally {
            setLoadingAI(false);
        }
    };

    // Helper to get path details
    const getPathDetails = (id) => availablePaths.find(p => p.id === id);

    // Compute V2 recommendations
    const computeRecommendations = () => {
        if (!comparisonResult || !comparisonResult.paths || comparisonResult.paths.length === 0) return null;

        const pathsWithMetrics = comparisonResult.paths.map(path => {
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

        // Find best overall
        let bestOverall = pathsWithMetrics[0];
        for (const path of pathsWithMetrics) {
            if (path.netCash10 > bestOverall.netCash10) {
                bestOverall = path;
            } else if (path.netCash10 === bestOverall.netCash10) {
                if (path.breakEvenYear < bestOverall.breakEvenYear) {
                    bestOverall = path;
                } else if (path.breakEvenYear === bestOverall.breakEvenYear) {
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
                if (path.netCash10 > fastestBreakEven.netCash10) {
                    fastestBreakEven = path;
                } else if (path.netCash10 === fastestBreakEven.netCash10) {
                    if (path.educationCost < fastestBreakEven.educationCost) {
                        fastestBreakEven = path;
                    }
                }
            }
        }

        return { bestOverall, fastestBreakEven };
    };

    const recommendations = computeRecommendations();

    // Prepare chart data
    const prepareChartData = () => {
        if (!comparisonResult) return [];
        const data = [];
        const horizon = comparisonResult.horizonYears;

        for (let i = 0; i < horizon; i++) {
            const yearData = { year: `Year ${i + 1}` };
            comparisonResult.paths.forEach(path => {
                yearData[`${path.id}_netCash`] = path.series.cumulativeNetCash[i];
                yearData[`${path.id}_income`] = path.series.yearlyIncome[i];
            });
            data.push(yearData);
        }
        return data;
    };

    const chartData = prepareChartData();

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className={`bg-gradient-to-r rounded-xl shadow-lg p-8 text-white border-l-4`}
                style={{ backgroundImage: `linear-gradient(to right, ${WP_BLACK}, ${WP_DARK})`, borderColor: WP_GOLD }}>
                <h1 className="text-4xl font-bold mb-2">PathFinder</h1>
                <p className="text-xl opacity-90 font-semibold mb-3" style={{ color: WP_GOLD_ACCENT }}>
                    Make your next step with confidence.
                </p>
                <p className="text-base opacity-80 leading-relaxed">
                    PathFinder helps you compare multiple life paths—college, trades, military, workforce, and more—using real financial modeling.
                    Simply enter your basic information, pick as many paths as you want, and PathFinder simulates income, debt, net cash, and break-even points in the future.
                </p>
            </div>

            {/* Value Statements */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                    {[
                        'See the financial impact of every decision.',
                        'Save time, money, and stress.',
                        'Understand what each path really leads to.',
                        'Make smarter decisions faster.'
                    ].map((statement, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: WP_GOLD }}>
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{statement}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Personal Profile (Optional) */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                    Personal Profile <span className="text-sm text-gray-500 font-normal">(Optional)</span>
                </h2>
                <UserProfileForm onChange={setUserProfile} />
            </div>

            {/* Your Priorities */}
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">Your Priorities</h2>
                <p className="text-sm text-gray-600 mb-4">Adjust how much each factor matters to you.</p>
                <PreferenceWeightsForm onChange={setPreferenceWeights} />
            </div>

            {/* Tell Us About You */}
            <h2 className="text-xl font-semibold mt-8 mb-2">Tell Us About You</h2>
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Age</label>
                        <input
                            type="number"
                            name="age"
                            value={formValues.age}
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
                            value={formValues.startingSavings}
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
                            value={formValues.monthlyLifestyleCost}
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

            {/* Choose Your Paths */}
            <h2 className="text-xl font-semibold mt-8 mb-2">Choose Your Paths</h2>
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Pick 2 or more paths to compare</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {availablePaths.map((path, idx) => (
                        <div
                            key={path.id}
                            onClick={() => togglePathSelection(path.id)}
                            className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${selectedPathIds.includes(path.id)
                                    ? 'shadow-md'
                                    : 'border-gray-200'
                                }`}
                            style={{
                                borderColor: selectedPathIds.includes(path.id) ? WP_GOLD : undefined,
                                backgroundColor: selectedPathIds.includes(path.id) ? `${WP_GOLD}1A` : undefined
                            }}
                        >
                            <div className="flex items-center space-x-3">
                                <div
                                    className={`w-5 h-5 rounded border flex items-center justify-center`}
                                    style={{
                                        backgroundColor: selectedPathIds.includes(path.id) ? WP_GOLD : 'transparent',
                                        borderColor: selectedPathIds.includes(path.id) ? WP_GOLD : '#9ca3af'
                                    }}
                                >
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

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
                    <button
                        onClick={handleCompare}
                        disabled={loadingCompare || Object.keys(validationErrors).length > 0 || selectedPathIds.length < 2}
                        className="text-white font-semibold py-2 px-6 rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform transition hover:scale-105"
                        style={{ backgroundColor: WP_GOLD }}
                    >
                        {loadingCompare ? 'Simulating...' : 'Compare Paths'}
                    </button>

                    <button
                        onClick={handleGetAIRecommendation}
                        disabled={loadingAI || selectedPathIds.length < 2}
                        className="text-white font-semibold py-2 px-6 rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform transition hover:scale-105"
                        style={{ backgroundColor: WP_GOLD_ACCENT }}
                    >
                        {loadingAI ? 'Analyzing...' : 'Get AI Career Recommendation'}
                    </button>
                </div>

                {errorCompare && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center font-medium">
                        {errorCompare}
                    </div>
                )}

                {errorAI && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-center font-medium">
                        {errorAI}
                    </div>
                )}
            </div>

            {/* Results Area */}
            {(comparisonResult || aiAdvisorResult) && (
                <div ref={resultsRef} className="space-y-6 animate-fade-in">

                    {/* Path Details Cards */}
                    {comparisonResult && (
                        <>
                            <h2 className="text-xl font-semibold mt-8 mb-2">Path Details</h2>
                            <div className="bg-white rounded-xl shadow-md p-6">
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
                                                            <span className="block text-xs font-semibold uppercase tracking-wide" style={{ color: WP_GOLD }}>
                                                                GI Bill / Benefits
                                                            </span>
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

                            {/* V2 Recommended Path */}
                            <h2 className="text-xl font-semibold mt-8 mb-2">Recommended Path (Financial)</h2>
                            {recommendations && (
                                <div className="p-4 rounded mb-6 border-l-4"
                                    style={{ backgroundColor: `${WP_GOLD}1A`, borderColor: WP_GOLD }}>
                                    <h3 className="text-lg font-bold mb-2" style={{ color: WP_DARK }}>Recommended Path</h3>
                                    <div style={{ color: WP_BLACK }}>
                                        <p className="mb-1">
                                            <span className="font-semibold">{recommendations.bestOverall.name}</span> is the strongest long-term financial choice,
                                            {recommendations.bestOverall.breakEvenYear !== Infinity
                                                ? ` breaking even by Year ${recommendations.bestOverall.breakEvenYear}`
                                                : ' though it may not break even within 10 years'
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
                        </>
                    )}

                    {/* V3 AI Career Coach Recommendation */}
                    {aiAdvisorResult && (
                        <>
                            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800">AI Career Coach Recommendation</h2>

                            <div className="rounded-xl shadow-lg p-6 text-white border-l-4"
                                style={{ backgroundImage: `linear-gradient(to right, ${WP_BLACK}, ${WP_DARK})`, borderColor: WP_GOLD }}>
                                <h3 className="text-2xl font-bold mb-2" style={{ color: WP_GOLD_ACCENT }}>
                                    {aiAdvisorResult.recommendation.bestOverall.name}
                                </h3>
                                <p className="text-lg mb-4">Overall Score: {aiAdvisorResult.recommendation.bestOverall.overallScore}/100</p>

                                {/* Score Breakdown */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-300">Financial</p>
                                        <p className="text-xl font-bold" style={{ color: WP_GOLD }}>
                                            {aiAdvisorResult.recommendation.bestOverall.scores.financial}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300">Lifestyle</p>
                                        <p className="text-xl font-bold" style={{ color: WP_GOLD }}>
                                            {aiAdvisorResult.recommendation.bestOverall.scores.lifestyle}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300">Independence</p>
                                        <p className="text-xl font-bold" style={{ color: WP_GOLD }}>
                                            {aiAdvisorResult.recommendation.bestOverall.scores.timeIndependence}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-300">Alignment</p>
                                        <p className="text-xl font-bold" style={{ color: WP_GOLD }}>
                                            {aiAdvisorResult.recommendation.bestOverall.scores.alignment}
                                        </p>
                                    </div>
                                </div>

                                {/* Reasoning */}
                                <div className="bg-white bg-opacity-10 rounded-lg p-4">
                                    <p className="text-sm whitespace-pre-line">{aiAdvisorResult.recommendation.reasoning}</p>
                                </div>
                            </div>

                            {/* Alternative Picks */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                                    <h4 className="font-semibold text-gray-800 mb-2">Best Financial</h4>
                                    <p className="text-lg font-bold text-green-600">
                                        {aiAdvisorResult.recommendation.bestFinancial.name}
                                    </p>
                                    <p className="text-sm text-gray-600">Score: {aiAdvisorResult.recommendation.bestFinancial.score}</p>
                                </div>
                                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                                    <h4 className="font-semibold text-gray-800 mb-2">Best Lifestyle</h4>
                                    <p className="text-lg font-bold text-blue-600">
                                        {aiAdvisorResult.recommendation.bestLifestyle.name}
                                    </p>
                                    <p className="text-sm text-gray-600">Score: {aiAdvisorResult.recommendation.bestLifestyle.score}</p>
                                </div>
                                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
                                    <h4 className="font-semibold text-gray-800 mb-2">Best Low-Risk</h4>
                                    <p className="text-lg font-bold text-purple-600">
                                        {aiAdvisorResult.recommendation.bestLowRisk.name}
                                    </p>
                                    <p className="text-sm text-gray-600">Score: {aiAdvisorResult.recommendation.bestLowRisk.score}</p>
                                </div>
                            </div>

                            {/* Tradeoffs */}
                            {aiAdvisorResult.recommendation.tradeoffs && aiAdvisorResult.recommendation.tradeoffs.length > 0 && (
                                <div className="bg-white rounded-lg shadow p-4">
                                    <h4 className="font-semibold text-gray-800 mb-3">Worth Considering</h4>
                                    <div className="space-y-2">
                                        {aiAdvisorResult.recommendation.tradeoffs.map((tradeoff, idx) => (
                                            <div key={idx} className="text-sm text-gray-700 border-l-2 pl-3" style={{ borderColor: WP_GOLD }}>
                                                {tradeoff.insight}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Charts */}
                    {comparisonResult && chartData.length > 0 && (
                        <>
                            <h2 className="text-xl font-semibold mt-8 mb-2">Your Tradeoffs</h2>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {comparisonResult.paths.map((path, idx) => (
                                    <div key={path.id} className="bg-white rounded-xl shadow p-4 border-t-4"
                                        style={{ borderColor: getPathColor(path.name, idx) }}>
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
                                                <span className="font-medium text-gray-800">
                                                    {path.breakEvenYear ? `Year ${path.breakEvenYear}` : 'Not in 10y'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Cumulative Net Cash Chart */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Cumulative Net Cash Over Time</h3>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year" />
                                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                        <Legend />
                                        {comparisonResult.paths.map((path, idx) => (
                                            <Line
                                                key={path.id}
                                                type="monotone"
                                                dataKey={`${path.id}_netCash`}
                                                stroke={getPathColor(path.name, idx)}
                                                name={path.name}
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Yearly Income Chart */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Yearly Income Over Time</h3>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year" />
                                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                                        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                        <Legend />
                                        {comparisonResult.paths.map((path, idx) => (
                                            <Line
                                                key={path.id}
                                                type="monotone"
                                                dataKey={`${path.id}_income`}
                                                stroke={getPathColor(path.name, idx)}
                                                name={path.name}
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default CareerPathExplorer;
