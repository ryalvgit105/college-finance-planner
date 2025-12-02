import React from 'react';
import { NavLink } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { LuHouse, LuDollarSign, LuCreditCard, LuLandmark, LuShoppingCart, LuTrophy, LuCalendar, LuSettings, LuTrendingUp, LuTarget } from 'react-icons/lu';

const Sidebar = () => {
    const { currentProfile } = useProfile();

    const navItems = [

        { name: 'Dashboard', path: '/', icon: LuHouse, module: null },
        { name: 'Career Path Explorer', path: '/career-path-explorer', icon: LuTrendingUp, module: null },
        // { name: 'Assets', path: '/assets', icon: LuDollarSign, module: 'assets' },
        // { name: 'Debts', path: '/debts', icon: LuCreditCard, module: 'debts' },
        // { name: 'Income', path: '/income', icon: LuLandmark, module: 'income' },
        // { name: 'Spending', path: '/spending', icon: LuShoppingCart, module: 'spending' },
        // { name: 'Goals', path: '/goals', icon: LuTrophy, module: 'goals' },
        // { name: 'Milestones', path: '/milestones', icon: LuCalendar, module: 'milestones' },
        // { name: 'Tax & Benefits', path: '/tax-benefits', icon: LuLandmark, module: 'income' },
        // { name: 'Opportunity Cost', path: '/opportunity-cost', icon: LuTrophy, module: null },
        // { name: 'Investments', path: '/investments', icon: LuTrendingUp, module: 'assets' },
        // { name: 'Goal Planner', path: '/goal-planner', icon: LuTarget, module: 'goals' },
    ];

    // Filter items based on enabled modules
    const visibleItems = navItems.filter(item => {
        if (!item.module) return true;
        if (!currentProfile || !currentProfile.enabledModules) return true;
        return currentProfile.enabledModules[item.module];
    });

    return (
        <aside className="w-64 bg-gradient-to-b from-[#1C1C1C] to-[#2E2D2D] text-white min-h-screen shadow-xl flex flex-col border-l-4 border-[#C6AA76]">
            <div className="p-6 flex-1">
                <h2 className="text-2xl font-bold mb-1 text-white">PathFinder</h2>
                <p className="text-sm text-[#D4B483] mb-8">Choose the future that fits you.</p>
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
                                        ? 'bg-[#C6AA76] text-white shadow-lg transform scale-105'
                                        : 'text-gray-300 hover:bg-[#2E2D2D] hover:text-[#D4B483] hover:transform hover:scale-102'
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

            <div className="p-6 border-t border-[#A7A8AA]">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                            ? 'bg-[#C6AA76] text-white shadow-lg'
                            : 'text-gray-300 hover:bg-[#2E2D2D] hover:text-[#D4B483]'
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
