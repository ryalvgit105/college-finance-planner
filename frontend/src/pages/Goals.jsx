import React, { useState, useEffect } from 'react';
import { createGoal, getGoals } from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';

const Goals = () => {
    const { currentProfile } = useProfile();
    const [formData, setFormData] = useState({
        goalName: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
        monthlyBudget: '',
        notes: ''
    });
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingGoals, setFetchingGoals] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch goals when currentProfile changes
    useEffect(() => {
        if (currentProfile) {
            fetchGoals();
        } else {
            setGoals([]);
            setFetchingGoals(false);
        }
    }, [currentProfile]);

    const fetchGoals = async () => {
        try {
            setFetchingGoals(true);
            const response = await getGoals(currentProfile._id);
            setGoals(response.data || []);
        } catch (err) {
            console.error('Error fetching goals:', err);
        } finally {
            setFetchingGoals(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!currentProfile) {
            setError('Please select a profile first');
            return;
        }

        // Validation
        if (!formData.goalName.trim()) {
            setError('Goal name is required');
            return;
        }
        if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
            setError('Target amount must be a positive number');
            return;
        }
        if (!formData.targetDate) {
            setError('Target date is required');
            return;
        }
        if (!formData.monthlyBudget || parseFloat(formData.monthlyBudget) <= 0) {
            setError('Monthly budget must be a positive number');
            return;
        }

        try {
            setLoading(true);
            const goalData = {
                profileId: currentProfile._id,
                goalName: formData.goalName.trim(),
                targetAmount: parseFloat(formData.targetAmount),
                currentAmount: formData.currentAmount ? parseFloat(formData.currentAmount) : 0,
                targetDate: formData.targetDate,
                monthlyBudget: parseFloat(formData.monthlyBudget),
                notes: formData.notes.trim()
            };

            await createGoal(goalData);
            setSuccess('Goal added successfully!');

            // Reset form
            setFormData({
                goalName: '',
                targetAmount: '',
                currentAmount: '',
                targetDate: '',
                monthlyBudget: '',
                notes: ''
            });

            // Refresh goals list
            await fetchGoals();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.message || 'Failed to add goal. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get progress bar color
    const getProgressColor = (percentage) => {
        if (percentage >= 76) return 'bg-green-500';
        if (percentage >= 51) return 'bg-yellow-500';
        if (percentage >= 26) return 'bg-orange-500';
        return 'bg-red-500';
    };

    // Helper function to get progress text color
    const getProgressTextColor = (percentage) => {
        if (percentage >= 76) return 'text-green-700';
        if (percentage >= 51) return 'text-yellow-700';
        if (percentage >= 26) return 'text-orange-700';
        return 'text-red-700';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Financial Goals</h2>
                <p className="text-gray-600">Set and track your financial goals with visual progress indicators</p>
            </div>

            {/* Add Goal Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Goal</h3>

                {/* Success Message */}
                {success && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-green-700 font-medium">{success}</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Goal Name */}
                        <div>
                            <label htmlFor="goalName" className="block text-sm font-medium text-gray-700 mb-2">
                                Goal Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="goalName"
                                name="goalName"
                                value={formData.goalName}
                                onChange={handleChange}
                                placeholder="e.g., Buy a car"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Target Amount */}
                        <div>
                            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-2">
                                Target Amount ($) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="targetAmount"
                                name="targetAmount"
                                value={formData.targetAmount}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Current Amount */}
                        <div>
                            <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700 mb-2">
                                Current Amount ($)
                            </label>
                            <input
                                type="number"
                                id="currentAmount"
                                name="currentAmount"
                                value={formData.currentAmount}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        {/* Target Date */}
                        <div>
                            <label htmlFor="targetDate" className="block text-sm font-medium text-gray-700 mb-2">
                                Target Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="targetDate"
                                name="targetDate"
                                value={formData.targetDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Monthly Budget */}
                        <div>
                            <label htmlFor="monthlyBudget" className="block text-sm font-medium text-gray-700 mb-2">
                                Monthly Budget ($) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="monthlyBudget"
                                name="monthlyBudget"
                                value={formData.monthlyBudget}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Additional details about this goal..."
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Adding Goal...' : 'Add Goal'}
                    </button>
                </form>
            </div>

            {/* Goals List */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Your Goals</h3>

                {fetchingGoals ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : goals.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <p className="mt-2 text-gray-600">No goals yet. Add your first financial goal!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {goals.map((goal) => {
                            const currentAmount = goal.currentAmount || 0;
                            const targetAmount = goal.targetAmount || 0;
                            const monthlyBudget = goal.monthlyBudget || 0;

                            const percentage = targetAmount > 0
                                ? Math.min(100, Math.round((currentAmount / targetAmount) * 100))
                                : 0;
                            const progressColor = getProgressColor(percentage);
                            const textColor = getProgressTextColor(percentage);

                            return (
                                <div key={goal._id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-gray-800">{goal.goalName}</h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Target: ${targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} by {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-2xl font-bold ${textColor}`}>{percentage}%</p>
                                            <p className="text-xs text-gray-500">Complete</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-3">
                                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                            <div
                                                className={`h-full ${progressColor} transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                                                style={{ width: `${percentage}%` }}
                                            >
                                                {percentage > 10 && (
                                                    <span className="text-xs font-semibold text-white">{percentage}%</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-500">Current</p>
                                            <p className="font-semibold text-gray-800">
                                                ${currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Remaining</p>
                                            <p className="font-semibold text-gray-800">
                                                ${(targetAmount - currentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Monthly Budget</p>
                                            <p className="font-semibold text-gray-800">
                                                ${monthlyBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Months to Goal</p>
                                            <p className="font-semibold text-gray-800">
                                                {monthlyBudget > 0
                                                    ? Math.ceil((targetAmount - currentAmount) / monthlyBudget)
                                                    : '∞'}
                                            </p>
                                        </div>
                                    </div>

                                    {goal.notes && (
                                        <p className="mt-3 text-sm text-gray-600 border-t pt-3">{goal.notes}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Goals;
