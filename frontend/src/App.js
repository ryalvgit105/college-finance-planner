import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import { ProfileProvider } from './context/ProfileContext';
import ProjectionSandboxV4 from './pages/ProjectionSandboxV4';

import Goals from './pages/Goals';
import Milestones from './pages/Milestones';
import TaxBenefits from './pages/TaxBenefits';
import OpportunityCost from './pages/OpportunityCost';
import InvestmentTracker from './pages/InvestmentTracker';
import GoalPlanner from './pages/GoalPlanner';

import Settings from './pages/Settings';
import CareerPathExplorer from './pages/CareerPathExplorer';
import AssetsPage from './pages/AssetsPage.jsx';
import DebtsPage from './pages/DebtsPage.jsx';
import IncomePage from './pages/IncomePage.jsx';
import SpendingPage from './pages/SpendingPage.jsx';
import InvestmentsPage from './pages/InvestmentsPage.jsx';

function App() {
    return (
        <ProfileProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="assets" element={<AssetsPage />} />
                        <Route path="debts" element={<DebtsPage />} />
                        <Route path="income" element={<IncomePage />} />
                        <Route path="spending" element={<SpendingPage />} />
                        <Route path="goals" element={<Goals />} />
                        <Route path="milestones" element={<Milestones />} />
                        <Route path="tax-benefits" element={<TaxBenefits />} />
                        <Route path="opportunity-cost" element={<OpportunityCost />} />
                        <Route path="investments" element={<InvestmentsPage />} />
                        <Route path="goal-planner" element={<GoalPlanner />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="career-path-explorer" element={<CareerPathExplorer />} />
                        <Route path="projection-v4" element={<ProjectionSandboxV4 />} />
                    </Route>
                </Routes>
            </Router>
        </ProfileProvider>
    );
}

export default App;
