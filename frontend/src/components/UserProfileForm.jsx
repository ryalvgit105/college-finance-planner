import React, { useState } from 'react';

const UserProfileForm = ({ onChange }) => {
    const [profile, setProfile] = useState({
        skillConfidence: 5,
        structureCreativity: 5,
        riskTolerance: 5,
        workLifeBalance: 5,
        careerInterest: '',
        careerValues: []
    });

    const updateProfile = (updates) => {
        const newProfile = { ...profile, ...updates };
        setProfile(newProfile);
        if (onChange) {
            onChange(newProfile);
        }
    };

    const toggleValue = (value) => {
        const newValues = profile.careerValues.includes(value)
            ? profile.careerValues.filter(v => v !== value)
            : [...profile.careerValues, value];
        updateProfile({ careerValues: newValues });
    };

    const careerInterests = [
        { value: '', label: 'Select your primary interest...' },
        { value: 'stem', label: 'STEM (Science, Technology, Engineering, Math)' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'business', label: 'Business' },
        { value: 'trades', label: 'Trades' },
        { value: 'military', label: 'Military' },
        { value: 'arts', label: 'Arts' },
        { value: 'not_sure', label: 'Not sure yet' }
    ];

    const careerValueOptions = [
        'Stability',
        'High Earnings',
        'Growth',
        'Helping People',
        'Physical Activity',
        'Flexible Lifestyle'
    ];

    return (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            {/* Skill Confidence */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confidence in learning new skills
                </label>
                <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500">Low</span>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={profile.skillConfidence}
                        onChange={(e) => updateProfile({ skillConfidence: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #C6AA76 0%, #C6AA76 ${(profile.skillConfidence - 1) * 11.11}%, #e5e7eb ${(profile.skillConfidence - 1) * 11.11}%, #e5e7eb 100%)`
                        }}
                    />
                    <span className="text-xs text-gray-500">High</span>
                    <span className="text-sm font-semibold text-[#C6AA76] w-8 text-center">{profile.skillConfidence}</span>
                </div>
            </div>

            {/* Personality Sliders */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800">Personality & Work Style</h4>

                {/* Structure vs Creativity */}
                <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>Structured</span>
                        <span className="text-[#C6AA76] font-semibold">{profile.structureCreativity}</span>
                        <span>Creative</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={profile.structureCreativity}
                        onChange={(e) => updateProfile({ structureCreativity: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #C6AA76 0%, #C6AA76 ${(profile.structureCreativity - 1) * 11.11}%, #e5e7eb ${(profile.structureCreativity - 1) * 11.11}%, #e5e7eb 100%)`
                        }}
                    />
                </div>

                {/* Risk Averse vs Risk Taking */}
                <div>
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>Risk Averse</span>
                        <span className="text-[#C6AA76] font-semibold">{profile.riskTolerance}</span>
                        <span>Risk Taking</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={profile.riskTolerance}
                        onChange={(e) => updateProfile({ riskTolerance: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                            background: `linear-gradient(to right, #C6AA76 0%, #C6AA76 ${(profile.riskTolerance - 1) * 11.11}%, #e5e7eb ${(profile.riskTolerance - 1) * 11.11}%, #e5e7eb 100%)`
                        }}
                    />
                </div>

                {/* Work-Life Balance Importance */}
                <div>
                    <label className="block text-xs text-gray-600 mb-2">
                        Work-Life Balance Importance
                    </label>
                    <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500">Low</span>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={profile.workLifeBalance}
                            onChange={(e) => updateProfile({ workLifeBalance: parseInt(e.target.value) })}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #C6AA76 0%, #C6AA76 ${(profile.workLifeBalance - 1) * 11.11}%, #e5e7eb ${(profile.workLifeBalance - 1) * 11.11}%, #e5e7eb 100%)`
                            }}
                        />
                        <span className="text-xs text-gray-500">High</span>
                        <span className="text-sm font-semibold text-[#C6AA76] w-8 text-center">{profile.workLifeBalance}</span>
                    </div>
                </div>
            </div>

            {/* Career Interests Dropdown */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Career Interest
                </label>
                <select
                    value={profile.careerInterest}
                    onChange={(e) => updateProfile({ careerInterest: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C6AA76] focus:border-[#C6AA76]"
                >
                    {careerInterests.map(interest => (
                        <option key={interest.value} value={interest.value}>
                            {interest.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Career Values (Multi-select Pills) */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    What matters most to you? (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                    {careerValueOptions.map(value => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => toggleValue(value)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${profile.careerValues.includes(value)
                                    ? 'bg-[#C6AA76] text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {value}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserProfileForm;
