import React from 'react';
import { NavLink } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { LuHouse, LuDollarSign, LuCreditCard, LuLandmark, LuShoppingCart, LuTrophy, LuCalendar, LuSettings } from 'react-icons/lu';

const Sidebar = () => {
    const { currentProfile } = useProfile();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LuHouse, module: null }, // Always shown
        { name: 'Assets', path: '/assets', icon: LuDollarSign, module: 'assets' },
        { name: 'Debts', path: '/debts', icon: LuCreditCard, module: 'debts' },
        { name: 'Income', path: '/income', icon: LuLandmark, module: 'income' },
        { name: 'Spending', path: '/spending', icon: LuShoppingCart, module: 'spending' },
        { name: 'Goals', path: '/goals', icon: LuTrophy, module: 'goals' },
        { name: 'Milestones', path: '/milestones', icon: LuCalendar, module: 'milestones' },
    ];

    // Filter items based on enabled modules
    const visibleItems = navItems.filter(item => {
        if (!item.module) return true; // Always show items without a module (Dashboard)
        if (!currentProfile || !currentProfile.enabledModules) return true; // Show all if profile not loaded yet
        return currentProfile.enabledModules[item.module];
    });

    return (
        <aside className="w-64 bg-gradient-to-b from-primary-800 to-primary-900 text-white min-h-screen shadow-xl flex flex-col">
            <div className="p-6 flex-1">
                <h2 className="text-2xl font-bold mb-8 text-primary-100">Finance Planner</h2>
                <nav className="space-y-2">
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                                        : 'text-primary-200 hover:bg-primary-700 hover:text-white hover:transform hover:scale-102'
                                    }`
                                }
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="p-6 border-t border-primary-700">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                        }`
                    }
                >
                    <LuSettings size={20} />
                    <span className="font-medium">Settings</span>
                </NavLink>
            </div>
        </aside>
    );
};

export default Sidebar;
