import React, { useState } from 'react';
import { useFuturePath } from '../context/FuturePathContext';
import { ChevronDown, Plus, User, Check } from 'lucide-react';

const ProfileDropdown = () => {
    const { profiles, activeProfileId, switchProfile, createProfile, getActiveProfile } = useFuturePath();
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');

    const activeProfile = getActiveProfile();

    const handleCreate = () => {
        if (newName.trim()) {
            createProfile(newName);
            setNewName('');
            setIsCreating(false);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-[#1C1C1E] border border-[#2C2C2E] rounded-lg hover:bg-[#2C2C2E] transition-colors text-sm text-white"
            >
                <div className="w-6 h-6 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#D7DAE0]">
                    <User size={14} />
                </div>
                <span className="font-medium">{activeProfile.name}</span>
                <ChevronDown size={14} className={`text-[#9EA2A8] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-2 space-y-1">
                        <button
                            onClick={() => { switchProfile('base'); setIsOpen(false); }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeProfileId === 'base' ? 'bg-[#2C2C2E] text-white' : 'text-[#B5B8BD] hover:bg-[#2C2C2E] hover:text-white'}`}
                        >
                            <span>Base Profile</span>
                            {activeProfileId === 'base' && <Check size={14} className="text-[#D7DAE0]" />}
                        </button>

                        {profiles.map(profile => (
                            <button
                                key={profile.id}
                                onClick={() => { switchProfile(profile.id); setIsOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${activeProfileId === profile.id ? 'bg-[#2C2C2E] text-white' : 'text-[#B5B8BD] hover:bg-[#2C2C2E] hover:text-white'}`}
                            >
                                <span>{profile.name}</span>
                                {activeProfileId === profile.id && <Check size={14} className="text-[#D7DAE0]" />}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-[#2C2C2E] p-2">
                        {isCreating ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Profile Name"
                                    className="flex-1 bg-[#111214] border border-[#2C2C2E] rounded px-2 py-1 text-xs text-white focus:border-[#D7DAE0] outline-none"
                                    autoFocus
                                />
                                <button
                                    onClick={handleCreate}
                                    className="bg-[#D7DAE0] text-black p-1 rounded hover:bg-white"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsCreating(true)}
                                disabled={profiles.length >= 5}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#9EA2A8] hover:text-white hover:bg-[#2C2C2E] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={14} /> Create New Profile
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
