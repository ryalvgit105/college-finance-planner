import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import { ProfileProvider } from './context/ProfileContext';
import FuturePathPage from './pages/FuturePathPage';
import { FuturePathProvider } from './context/FuturePathContext';

import Goals from './pages/Goals';
import Milestones from './pages/Milestones';
import TaxBenefits from './pages/TaxBenefits';
import OpportunityCost from './pages/OpportunityCost';
import InvestmentTracker from './pages/InvestmentTracker';
import GoalPlanner from './pages/GoalPlanner';

import Settings from './pages/Settings';
import AssetsPage from './pages/AssetsPage.jsx';
import DebtsPage from './pages/DebtsPage.jsx';
import IncomePage from './pages/IncomePage.jsx';
import SpendingPage from './pages/SpendingPage.jsx';
import SpendingManager from './pages/SpendingManager.jsx';
import SpendingAnalysisPage from './pages/spending-analysis/SpendingAnalysisPage.jsx';
import InvestmentsPage from './pages/InvestmentsPage.jsx';
import RealEstatePage from './pages/RealEstatePage.jsx';

function App() {
    return (
        <ProfileProvider>
            <FuturePathProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="assets" element={<AssetsPage />} />
                            <Route path="debts" element={<DebtsPage />} />
                            <Route path="income" element={<IncomePage />} />
                            <Route path="budget-planner" element={<SpendingManager />} />
                            <Route path="spending-analysis" element={<SpendingAnalysisPage />} />
                            <Route path="spending" element={<Navigate to="/budget-planner" replace />} />
                            <Route path="real-estate" element={<RealEstatePage />} />
                            <Route path="goals" element={<Goals />} />
                            <Route path="milestones" element={<Milestones />} />
                            <Route path="tax-benefits" element={<TaxBenefits />} />
                            <Route path="opportunity-cost" element={<OpportunityCost />} />
                            <Route path="investments" element={<InvestmentsPage />} />
                            <Route path="goal-planner" element={<GoalPlanner />} />
                            <Route path="settings" element={<Settings />} />
                            <Route path="future-path" element={<FuturePathPage />} />
                        </Route>
                    </Routes>
                </Router>
            </FuturePathProvider>
        </ProfileProvider>
    );
}

export default App;
