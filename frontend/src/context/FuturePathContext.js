import React, { createContext, useState, useContext, useEffect } from 'react';

const FuturePathContext = createContext();

export const useFuturePath = () => useContext(FuturePathContext);

export const FuturePathProvider = ({ children }) => {
    // Load from localStorage if available, else default
    const [profiles, setProfiles] = useState(() => {
        const saved = localStorage.getItem('futurePath_profiles');
        return saved ? JSON.parse(saved) : [];
    });

    const [activeProfileId, setActiveProfileId] = useState('base'); // 'base' or profile ID

    useEffect(() => {
        localStorage.setItem('futurePath_profiles', JSON.stringify(profiles));
    }, [profiles]);

    const createProfile = (name, baseData) => {
        if (profiles.length >= 5) return;
        const newProfile = {
            id: Date.now().toString(),
            name,
            data: baseData || null // Snapshot of financial data
        };
        setProfiles([...profiles, newProfile]);
        setActiveProfileId(newProfile.id);
    };

    const switchProfile = (id) => {
        setActiveProfileId(id);
    };

    const getActiveProfile = () => {
        if (activeProfileId === 'base') return { id: 'base', name: 'Base Profile' };
        return profiles.find(p => p.id === activeProfileId) || { id: 'base', name: 'Base Profile' };
    };

    return (
        <FuturePathContext.Provider value={{
            profiles,
            activeProfileId,
            createProfile,
            switchProfile,
            getActiveProfile
        }}>
            {children}
        </FuturePathContext.Provider>
    );
};
