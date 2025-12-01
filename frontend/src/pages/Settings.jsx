import React, { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { LuSave, LuCheck, LuCircleAlert, LuPlus, LuX, LuRotateCcw } from 'react-icons/lu';

const Settings = () => {
    const { currentProfile, updateProfile, isLoading } = useProfile();
    const [enabledModules, setEnabledModules] = useState({
        assets: true,
        debts: true,
        income: true,
        spending: true,
        goals: true,
        milestones: true
    });
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (currentProfile) {
            if (currentProfile.enabledModules) {
                setEnabledModules(currentProfile.enabledModules);
            }
            if (currentProfile.categories && currentProfile.categories.length > 0) {
                setCategories(currentProfile.categories);
            } else if (!isLoading) {
                // Only set defaults if loaded and no categories exist
                setCategories(['Rent', 'Groceries', 'Utilities', 'Entertainment', 'Transport']);
            }
        }
    }, [currentProfile, isLoading]);

    const handleToggle = (module) => {
        setEnabledModules(prev => ({
            ...prev,
            [module]: !prev[module]
        }));
    };

    const handleAddCategory = (e) => {
        e.preventDefault();
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            setCategories([...categories, newCategory.trim()]);
            setNewCategory('');
        }
    };

    const handleRemoveCategory = (categoryToRemove) => {
        setCategories(categories.filter(cat => cat !== categoryToRemove));
    };

    const applyDefaults = () => {
        let defaults = [];
        switch (currentProfile.profileType) {
            case 'College':
                defaults = ['Tuition', 'Rent', 'Books', 'Food', 'Transport', 'Entertainment'];
                break;
            case 'Business':
                defaults = ['COGS', 'Taxes', 'Payroll', 'Marketing', 'Office Supplies', 'Software'];
                break;
            default: // Personal
                defaults = ['Rent', 'Groceries', 'Utilities', 'Entertainment', 'Transport', 'Dining Out'];
        }
        // Merge unique defaults
        const uniqueCategories = [...new Set([...categories, ...defaults])];
        setCategories(uniqueCategories);
        setMessage({ type: 'success', text: `Applied default categories for ${currentProfile.profileType}` });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);

        const result = await updateProfile(currentProfile._id, {
            enabledModules,
            categories
        });

        if (result.success) {
            setMessage({ type: 'success', text: 'Settings saved successfully!' });
        } else {
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        }
        setIsSaving(false);

        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
    };

    if (!currentProfile) {
        return <div className="p-6">Loading profile...</div>;
    }

    const modules = [
        { id: 'assets', label: 'Assets', description: 'Track your valuable assets and investments.' },
        { id: 'debts', label: 'Debts', description: 'Manage your loans and liabilities.' },
        { id: 'income', label: 'Income', description: 'Record your earnings and revenue sources.' },
        { id: 'spending', label: 'Spending', description: 'Monitor your daily expenses and budget.' },
        { id: 'goals', label: 'Goals', description: 'Set and track financial goals.' },
        { id: 'milestones', label: 'Milestones', description: 'Plan key life events and financial milestones.' }
    ];

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600 mt-1">Customize features for <span className="font-semibold text-blue-600">{currentProfile.name}</span></p>
            </div>

            <div className="space-y-6">
                {/* Feature Modules Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Feature Modules</h2>
                        <p className="text-sm text-gray-500 mt-1">Enable or disable features for this profile.</p>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {modules.map((module) => (
                            <div key={module.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex-1 pr-4">
                                    <h3 className="text-sm font-medium text-gray-900">{module.label}</h3>
                                    <p className="text-sm text-gray-500">{module.description}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={enabledModules[module.id]}
                                        onChange={() => handleToggle(module.id)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Spending Categories</h2>
                            <p className="text-sm text-gray-500 mt-1">Manage categories for your spending transactions.</p>
                        </div>
                        <button
                            onClick={applyDefaults}
                            className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            title={`Apply defaults for ${currentProfile.profileType}`}
                        >
                            <LuRotateCcw className="mr-1.5" size={16} />
                            Apply {currentProfile.profileType} Defaults
                        </button>
                    </div>

                    <div className="p-6">
                        <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Add new category..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                type="submit"
                                disabled={!newCategory.trim()}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <LuPlus size={20} />
                            </button>
                        </form>

                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <div key={category} className="flex items-center bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm font-medium">
                                    {category}
                                    <button
                                        onClick={() => handleRemoveCategory(category)}
                                        className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                                    >
                                        <LuX size={14} />
                                    </button>
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <p className="text-gray-500 text-sm italic">No categories added yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Save Action */}
                <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex-1">
                        {message && (
                            <div className={`flex items-center text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message.type === 'success' ? <LuCheck className="mr-2" /> : <LuCircleAlert className="mr-2" />}
                                {message.text}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`flex items-center px-6 py-2.5 rounded-lg text-white font-medium transition-colors shadow-sm ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <LuSave className="mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
