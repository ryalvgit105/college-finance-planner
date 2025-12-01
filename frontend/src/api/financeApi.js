import api from './axios';

/**
 * Finance API Service
 * Centralized API calls for all financial data
 */

// Profile API
export const getProfiles = async (userId) => {
    try {
        const response = await api.get(`/api/profiles?userId=${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching profiles:', error);
        throw error;
    }
};

export const createProfile = async (profileData) => {
    try {
        const response = await api.post('/api/profiles', profileData);
        return response.data;
    } catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
};

export const updateProfile = async (id, profileData) => {
    try {
        const response = await api.put(`/api/profiles/${id}`, profileData);
        return response.data;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};

// Assets API
export const getAssets = async (profileId) => {
    try {
        const params = profileId ? { profileId } : {};
        const response = await api.get('/api/assets', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching assets:', error);
        throw error;
    }
};

export const createAsset = async (assetData) => {
    try {
        const response = await api.post('/api/assets', assetData);
        return response.data;
    } catch (error) {
        console.error('Error creating asset:', error);
        throw error;
    }
};

// Debts API
export const getDebts = async (profileId) => {
    try {
        const params = profileId ? { profileId } : {};
        const response = await api.get('/api/debts', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching debts:', error);
        throw error;
    }
};

export const createDebt = async (debtData) => {
    try {
        const response = await api.post('/api/debts', debtData);
        return response.data;
    } catch (error) {
        console.error('Error creating debt:', error);
        throw error;
    }
};

// Income API
export const getIncome = async (profileId) => {
    try {
        const params = profileId ? { profileId } : {};
        const response = await api.get('/api/income', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching income:', error);
        throw error;
    }
};

export const createIncome = async (incomeData) => {
    try {
        const response = await api.post('/api/income', incomeData);
        return response.data;
    } catch (error) {
        console.error('Error creating income:', error);
        throw error;
    }
};

// Spending API
export const logSpending = async (spendingData) => {
    try {
        const response = await api.post('/api/spending', spendingData);
        return response.data;
    } catch (error) {
        console.error('Error logging spending:', error);
        throw error;
    }
};

export const getSpending = async (profileId) => {
    try {
        const params = profileId ? { profileId } : {};
        const response = await api.get('/api/spending', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching spending:', error);
        throw error;
    }
};

export const getWeeklySpending = async (startDate, profileId) => {
    try {
        const params = { start: startDate };
        if (profileId) params.profileId = profileId;

        const response = await api.get('/api/spending/week', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching weekly spending:', error);
        throw error;
    }
};

// Goals API
export const getGoals = async (profileId) => {
    try {
        const params = profileId ? { profileId } : {};
        const response = await api.get('/api/goals', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching goals:', error);
        throw error;
    }
};

export const createGoal = async (goalData) => {
    try {
        const response = await api.post('/api/goals', goalData);
        return response.data;
    } catch (error) {
        console.error('Error creating goal:', error);
        throw error;
    }
};

// Projection API
export const getProjection = async (profileId) => {
    try {
        const params = profileId ? { profileId } : {};
        const response = await api.get('/api/projection', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching projection:', error);
        throw error;
    }
};

// Milestones API
export const getMilestones = async (profileId) => {
    try {
        const params = profileId ? { profileId } : {};
        const response = await api.get('/api/milestones', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching milestones:', error);
        throw error;
    }
};

export const createMilestone = async (milestoneData) => {
    try {
        const response = await api.post('/api/milestones', milestoneData);
        return response.data;
    } catch (error) {
        console.error('Error creating milestone:', error);
        throw error;
    }
};

export const updateMilestone = async (id, milestoneData) => {
    try {
        const response = await api.put(`/api/milestones/${id}`, milestoneData);
        return response.data;
    } catch (error) {
        console.error('Error updating milestone:', error);
        throw error;
    }
};

// Tax API
export const getTax = async (profileId) => {
    try {
        const response = await api.get(`/api/tax/${profileId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching tax settings:', error);
        throw error;
    }
};

export const updateTax = async (taxData) => {
    try {
        const response = await api.post('/api/tax', taxData);
        return response.data;
    } catch (error) {
        console.error('Error updating tax settings:', error);
        throw error;
    }
};

// Benefits API
export const getBenefits = async (profileId) => {
    try {
        const response = await api.get(`/api/benefits/${profileId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching benefits:', error);
        throw error;
    }
};

export const updateBenefits = async (benefitsData) => {
    try {
        const response = await api.post('/api/benefits', benefitsData);
        return response.data;
    } catch (error) {
        console.error('Error updating benefits:', error);
        throw error;
    }
};

// Dashboard Summary - Aggregated data for dashboard
export const getDashboardSummary = async (profileId) => {
    try {
        if (!profileId) throw new Error('Profile ID is required');
        const response = await api.get(`/api/dashboard/summary/${profileId}`);
        return response.data.data; // Backend returns { success: true, data: { ... } }
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        throw error;
    }
};
