import React, { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { getDashboardSummary } from '../api/financeApi';
import { LuTarget, LuAlertTriangle, LuCheckCircle } from 'react-icons/lu';

const GoalPlanner = () => {
    const { currentProfile } = useProfile();
    const [allocations, setAllocations] = useState([]);
    const [shortfall, setShortfall] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentProfile) fetchData();
    }, [currentProfile]);

    const fetchData = async () => {
        try {
            const data = await getDashboardSummary(currentProfile._id);
            if (data) {
                setAllocations(data.recommendedMonthlyAllocations || []);
                setShortfall(data.totalGoalShortfall || 0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold text-gray-800">Goal Planner & Allocations</h1>
            <p className="text-gray-600">AI-driven recommendations for funding your goals based on priority and income.</p>

            {/* Shortfall Alert */}
            {shortfall > 0 ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start space-x-3">
                    <LuAlertTriangle className="text-red-500 mt-1" size={24} />
                    <div>
                        <h3 className="font-bold text-red-800">Funding Shortfall Detected</h3>
                        <p className="text-red-700">
                            You are short <strong>${shortfall.toLocaleString()}</strong> per month to meet all goals on time.
                            Lower priority goals have been reduced.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded flex items-center space-x-3">
                    <LuCheckCircle className="text-green-500" size={24} />
                    <div>
                        <h3 className="font-bold text-green-800">Fully Funded</h3>
                        <p className="text-green-700">Your current income is sufficient to fund all goals.</p>
                    </div>
                </div>
            )}

            {/* Allocation Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Needed / Mo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommended</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {allocations.map((goal) => (
                            <tr key={goal.goalId}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${goal.priority >= 4 ? 'bg-red-100 text-red-800' :
                                            goal.priority >= 3 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                        }`}>
                                        P{goal.priority}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{goal.goalName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">${goal.needed.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">${goal.allocated.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {goal.shortfall > 1 ? (
                                        <span className="text-red-500 text-sm flex items-center">
                                            <LuAlertTriangle className="mr-1" size={14} /> -${goal.shortfall.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    ) : (
                                        <span className="text-green-500 text-sm flex items-center">
                                            <LuCheckCircle className="mr-1" size={14} /> On Track
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default GoalPlanner;
