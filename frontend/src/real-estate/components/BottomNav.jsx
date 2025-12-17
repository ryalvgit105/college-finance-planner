import React from 'react';
import { PropertiesIcon, TimelineIcon, DashboardIcon, SettingsIcon } from '../icons/NavIcons';

const NavItem = ({ label, viewName, activeView, setView, children }) => {
    const isActive = activeView === viewName;
    const color = isActive ? 'text-blue-600' : 'text-gray-500';

    return (
        <button
            onClick={() => setView(viewName)}
            className={`relative flex flex-col items-center justify-center w-full transition-colors duration-200 ${color} hover:text-blue-600`}
            aria-current={isActive ? 'page' : undefined}
            aria-label={label}
        >
            {isActive && <div className="absolute top-1.5 h-1 w-1 rounded-full bg-blue-600" />}
            {children}
            <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
        </button>
    );
};

const BottomNav = ({ activeView, setView }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex justify-around items-center z-50">
            <NavItem label="Properties" viewName="properties" activeView={activeView} setView={setView}>
                <PropertiesIcon />
            </NavItem>
            <NavItem label="Timeline" viewName="timeline" activeView={activeView} setView={setView}>
                <TimelineIcon />
            </NavItem>
        </nav>
    );
};

export default BottomNav;
