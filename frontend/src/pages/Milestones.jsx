import React, { useState, useEffect } from 'react';
import { createMilestone, getMilestones, getGoals, updateMilestone } from '../api/financeApi';
import { useProfile } from '../context/ProfileContext';

const Milestones = () => {
    const { currentProfile } = useProfile();
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        description: '',
        linkedGoalId: ''
    });
    const [milestones, setMilestones] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch data when currentProfile changes
    useEffect(() => {
        if (currentProfile) {
            fetchData();
        } else {
            setMilestones([]);
            setGoals([]);
            setFetchingData(false);
        }
    }, [currentProfile]);

    const fetchData = async () => {
        try {
            setFetchingData(true);
            const [milestonesRes, goalsRes] = await Promise.all([
                getMilestones(currentProfile._id),
                getGoals(currentProfile._id)
            ]);
            setMilestones(milestonesRes.data || []);
            setGoals(goalsRes.data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setFetchingData(false);
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
        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }
        if (!formData.date) {
            setError('Date is required');
            return;
        }

        try {
            setLoading(true);
            const milestoneData = {
                profileId: currentProfile._id,
                title: formData.title.trim(),
                date: formData.date,
                description: formData.description.trim(),
                linkedGoalId: formData.linkedGoalId || undefined
            };

            await createMilestone(milestoneData);
            setSuccess('Milestone added successfully!');

            // Reset form
            setFormData({
                title: '',
                date: '',
                description: '',
                linkedGoalId: ''
            });

            // Refresh list
            await fetchData();

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err.response?.data?.errors?.[0]?.message || 'Failed to add milestone. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleAchieved = async (milestoneId, currentStatus) => {
        if (!currentProfile) return;

        try {
            const newStatus = !currentStatus;

            // Optimistic update
            setMilestones(prev => prev.map(m =>
                m._id === milestoneId ? { ...m, achieved: newStatus } : m
            ));

            // API call - assuming updateMilestone is available in financeApi
            // If not, we might need to add it or use api.patch directly
            // Using updateMilestone wrapper for consistency if it exists, otherwise fallback
            await updateMilestone(milestoneId, {
                profileId: currentProfile._id,
                achieved: newStatus
            });

        } catch (err) {
            console.error('Error updating milestone status:', err);
            setError('Failed to update milestone status');

            // Revert optimistic update on error
            fetchData();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Milestones</h2>
                <p className="text-gray-600">Track important financial milestones and achievements</p>
            </div>

            {/* Add Milestone Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Milestone</h3>

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
                        {/* Milestone Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Milestone Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Pay off student loan"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Target Date */}
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                                Target Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Additional details about this milestone..."
                            rows="2"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Adding Milestone...' : 'Add Milestone'}
                    </button>
                </form>
            </div>

            {/* Milestones List */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Your Milestones</h3>

                {fetchingData ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                    </div>
                ) : milestones.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="mt-2 text-gray-600">No milestones yet. Add your first milestone!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {milestones.map((milestone) => {
                            const targetDate = new Date(milestone.date);
                            const isUpcoming = targetDate > new Date();

                            return (
                                <div
                                    key={milestone._id}
                                    className={`border rounded-lg p-4 transition-all ${milestone.achieved
                                        ? 'bg-green-50 border-green-300'
                                        : isUpcoming
                                            ? 'bg-white border-gray-200 hover:shadow-md'
                                            : 'bg-gray-50 border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3 flex-1">
                                            {/* Checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={milestone.achieved || false}
                                                onChange={() => toggleAchieved(milestone._id, milestone.achieved)}
                                                className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                                            />

                                            {/* Content */}
                                            <div className="flex-1">
                                                <h4 className={`font-semibold text-lg ${milestone.achieved ? 'line-through text-gray-500' : 'text-gray-800'
                                                    }`}>
                                                    {milestone.title}
                                                </h4>

                                                <div className="flex items-center mt-2 space-x-4">
                                                    {/* Target Date */}
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {targetDate.toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </div>

                                                    {/* Status Badge */}
                                                    {milestone.achieved ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            ✓ Achieved
                                                        </span>
                                                    ) : isUpcoming ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            Upcoming
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            Overdue
                                                        </span>
                                                    )}
                                                </div>

                                                {milestone.description && (
                                                    <p className="mt-2 text-sm text-gray-600">{milestone.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Milestones;
