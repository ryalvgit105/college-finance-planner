import axios from 'axios';

// Create an instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// --- Profiles ---
export const getProfiles = (userId) => api.get(`/profiles?userId=${userId}`);
export const createProfile = (data) => api.post('/profiles', data);
export const updateProfile = (id, data) => api.put(`/profiles/${id}`, data);

// --- Assets ---
export const getAssets = (profileId) => api.get(`/assets?profileId=${profileId}`);
export const createAsset = (data) => api.post('/assets', data);
export const updateAsset = (id, data) => api.put(`/assets/${id}`, data);
export const deleteAsset = (id) => api.delete(`/assets/${id}`);

// --- Debts ---
export const getDebts = (profileId) => api.get(`/debts?profileId=${profileId}`);
export const createDebt = (data) => api.post('/debts', data);
export const updateDebt = (id, data) => api.put(`/debts/${id}`, data);
export const deleteDebt = (id) => api.delete(`/debts/${id}`);

// --- Income ---
export const getIncome = (profileId) => api.get(`/income?profileId=${profileId}`);
export const createIncome = (data) => api.post('/income', data);
export const updateIncome = (id, data) => api.put(`/income/${id}`, data);
export const deleteIncome = (id) => api.delete(`/income/${id}`);

// --- Investments ---
export const getInvestments = (profileId) => api.get(`/investments?profileId=${profileId}`);
export const createInvestment = (data) => api.post('/investments', data);
export const updateInvestment = (id, data) => api.put(`/investments/${id}`, data);
export const deleteInvestment = (id) => api.delete(`/investments/${id}`);

// --- Spending ---
export const getSpending = (profileId) => api.get(`/spending?profileId=${profileId}`);
export const createSpending = (data) => api.post('/spending', data);
export const updateSpending = (id, data) => api.put(`/spending/${id}`, data);
export const deleteSpending = (id) => api.delete(`/spending/${id}`);

// --- Dashboard ---
export const getDashboardSummary = (profileId) => api.get(`/dashboard/summary/${profileId}`);

// --- Snapshots (New) ---
export const getSnapshotHistory = (type, year, profileId) =>
    api.get(`/snapshots/${type}/history`, { params: { year, profileId } });

export const captureSnapshot = (data) =>
    api.post('/snapshots/capture', data);

export const getSnapshotDetail = (profileId, month, year, type) =>
    api.get('/snapshots/detail', { params: { profileId, month, year, type } });


// --- Career Paths ---
export const getPathTemplates = () => api.get('/career-paths/templates');
export const getCareerPath = (profileId) => api.get(`/career-paths/${profileId}`);
export const saveCareerPath = (data) => api.post('/career-paths', data);
export const updateCareerPath = (id, data) => api.put(`/career-paths/${id}`, data);

// --- Career Advisor ---
export const getCareerAdvice = (profileId, pathId) => api.post('/career-advisor/advice', { profileId, pathId });
export const getRiskAssessment = (profileId, pathId) => api.post('/career-advisor/risk-assessment', { profileId, pathId });


// --- Tax (New) ---
export const getTax = (profileId) => api.get(`/tax/${profileId}`);
export const updateTax = (data) => api.post('/tax', data);

// --- Benefits (New) ---
export const getBenefits = (profileId) => api.get(`/benefits/${profileId}`);
export const updateBenefits = (data) => api.post('/benefits', data);

// --- Opportunity Cost (New) ---
export const compareOpportunityCost = (data) => api.post('/opportunity/compare', data);

// --- Projections ---
export const getProjection = (profileId, years) => api.get('/projection', { params: { profileId, years } });

// --- Milestones ---
export const getMilestones = (profileId, month) => api.get('/milestones', { params: { profileId, month } });
export const createMilestone = (data) => api.post('/milestones', data);
export const updateMilestone = (id, data) => api.put(`/milestones/${id}`, data);
export const deleteMilestone = (id) => api.delete(`/milestones/${id}`);

// --- Goals ---
export const getGoals = (profileId) => api.get('/goals', { params: { profileId } });
export const createGoal = (data) => api.post('/goals', data);
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);

export default api;
