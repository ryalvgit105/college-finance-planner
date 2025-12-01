import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProfiles, createProfile as apiCreateProfile, updateProfile as apiUpdateProfile } from '../api/financeApi';

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const [profiles, setProfiles] = useState([]);
    const [currentProfile, setCurrentProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hardcoded user ID for now, matching the backend scripts
    const USER_ID = '648a1b2c3d4e5f6a7b8c9d0e';

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        setIsLoading(true);
        try {
            const data = await getProfiles(USER_ID);
            if (data.success) {
                setProfiles(data.data);
                // Set default profile if none selected
                if (data.data.length > 0 && !currentProfile) {
                    setCurrentProfile(data.data[0]);
                }
            }
        } catch (err) {
            setError('Failed to load profiles');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const switchProfile = (profileId) => {
        const profile = profiles.find(p => p._id === profileId);
        if (profile) {
            setCurrentProfile(profile);
        }
    };

    const addProfile = async (profileData) => {
        try {
            const data = await apiCreateProfile({ ...profileData, userId: USER_ID });
            if (data.success) {
                setProfiles([...profiles, data.data]);
                setCurrentProfile(data.data); // Switch to new profile
                return { success: true };
            }
        } catch (err) {
            console.error(err);
            return { success: false, error: err.message };
        }
    };

    const updateProfile = async (profileId, updates) => {
        try {
            const data = await apiUpdateProfile(profileId, updates);
            if (data.success) {
                const updatedProfile = data.data;

                // Update profiles list
                setProfiles(profiles.map(p => p._id === profileId ? updatedProfile : p));

                // Update current profile if it's the one being modified
                if (currentProfile && currentProfile._id === profileId) {
                    setCurrentProfile(updatedProfile);
                }

                return { success: true };
            }
        } catch (err) {
            console.error(err);
            return { success: false, error: err.message };
        }
    };

    return (
        <ProfileContext.Provider value={{
            profiles,
            currentProfile,
            isLoading,
            error,
            switchProfile,
            addProfile,
            updateProfile
        }}>
            {children}
        </ProfileContext.Provider>
    );
};
