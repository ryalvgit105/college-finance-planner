import React, { useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { LuChevronDown, LuPlus, LuUser, LuBriefcase, LuGraduationCap } from "react-icons/lu";

const ProfileSwitcher = () => {
    const { profiles, currentProfile, switchProfile, addProfile, isLoading } = useProfile();
    const [isOpen, setIsOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfileType, setNewProfileType] = useState('Personal');

    const getIcon = (type) => {
        switch (type) {
            case 'Business': return <LuBriefcase size={16} />;
            case 'College': return <LuGraduationCap size={16} />;
            default: return <LuUser size={16} />;
        }
    };

    const handleSwitch = (profileId) => {
        switchProfile(profileId);
        setIsOpen(false);
    };

    const handleAddProfile = async (e) => {
        e.preventDefault();
        if (!newProfileName.trim()) return;

        const result = await addProfile({
            name: newProfileName,
            profileType: newProfileType
        });

        if (result.success) {
            setNewProfileName('');
            setIsAdding(false);
            setIsOpen(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-1">
                    <div className="w-20 h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-12 h-2 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    const renderForm = () => (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 z-50 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Create New Profile</h3>
            <form onSubmit={handleAddProfile} className="space-y-3">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Profile Name</label>
                    <input
                        type="text"
                        value={newProfileName}
                        onChange={(e) => setNewProfileName(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. My Business"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Type</label>
                    <select
                        value={newProfileType}
                        onChange={(e) => setNewProfileType(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Personal">Personal</option>
                        <option value="College">College</option>
                        <option value="Business">Business</option>
                    </select>
                </div>
                <div className="flex space-x-2 pt-2">
                    <button
                        type="button"
                        onClick={() => { setIsAdding(false); setIsOpen(false); }}
                        className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                        Create
                    </button>
                </div>
            </form>
        </div>
    );

    if (!currentProfile) {
        return (
            <div className="relative">
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-blue-700"
                >
                    <LuPlus size={16} />
                    <span className="text-sm font-medium">Create Profile</span>
                </button>
                {isAdding && renderForm()}
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <div className="p-1 bg-blue-100 text-blue-600 rounded">
                    {getIcon(currentProfile.profileType)}
                </div>
                <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{currentProfile.name}</p>
                    <p className="text-xs text-gray-500">{currentProfile.profileType}</p>
                </div>
                <LuChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                    {!isAdding ? (
                        <>
                            <div className="p-2">
                                <p className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">Switch Profile</p>
                                {profiles.map(profile => (
                                    <button
                                        key={profile._id}
                                        onClick={() => handleSwitch(profile._id)}
                                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${currentProfile._id === profile._id
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        {getIcon(profile.profileType)}
                                        <span className="text-sm font-medium">{profile.name}</span>
                                        {currentProfile._id === profile._id && (
                                            <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="border-t border-gray-100 p-2">
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                                >
                                    <LuPlus size={16} />
                                    <span>Add New Profile</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Create New Profile</h3>
                            <form onSubmit={handleAddProfile} className="space-y-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Profile Name</label>
                                    <input
                                        type="text"
                                        value={newProfileName}
                                        onChange={(e) => setNewProfileName(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. My Business"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Type</label>
                                    <select
                                        value={newProfileType}
                                        onChange={(e) => setNewProfileType(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Personal">Personal</option>
                                        <option value="College">College</option>
                                        <option value="Business">Business</option>
                                    </select>
                                </div>
                                <div className="flex space-x-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileSwitcher;
