import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Income from './pages/Income';
import Spending from './pages/Spending';
import Goals from './pages/Goals';
import Milestones from './pages/Milestones';
import Settings from './pages/Settings';
import { ProfileProvider } from './context/ProfileContext';

function App() {
    return (
        <ProfileProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="assets" element={<Assets />} />
                        <Route path="income" element={<Income />} />
                        <Route path="spending" element={<Spending />} />
                        <Route path="goals" element={<Goals />} />
                        <Route path="milestones" element={<Milestones />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Routes>
            </Router>
        </ProfileProvider>
    );
}

export default App;
