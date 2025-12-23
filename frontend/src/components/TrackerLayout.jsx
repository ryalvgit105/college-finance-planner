import React from 'react';
import { LuArrowLeft } from 'react-icons/lu';
import YearlyGrid from './YearlyGrid';
import YearlyFinancialSummary from './YearlyFinancialSummary';
import FinancialVisualization from './FinancialVisualization';

// Constants
const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Validated Tracker Layout Component
 * Unifies the "Yearly Grid -> Monthly Detail" flow across the app.
 * 
 * @param {string} title - Page title (e.g., "Assets", "Debts")
 * @param {string} subtitle - Page subtitle
 * @param {string} type - 'asset' | 'debt' | 'investment' (controls colors)
 * @param {number} year - Current year state
 * @param {number} month - Current month state (0-11), or null if Yearly View
 * @param {function} onNavigateMonth - Callback(direction: 'prev'|'next')
 * @param {function} onMonthClick - Callback(monthIndex) -> Switch to monthly view
 * @param {function} onBackToYearly - Callback() -> Switch to yearly view
 * @param {number} totalAnnualValue - Total value for the year (current net worth or total debt)
 * @param {Array} monthlyHistory - Array of 12 numbers representing total values per month
 * @param {ReactNode} children - The specific content to render in Monthly View (Tables, etc.)
 */
const TrackerLayout = ({
    title,
    subtitle,
    type = 'asset',
    year,
    month,
    onNavigateMonth,
    onMonthClick,
    onBackToYearly,
    totalAnnualValue,
    monthlyHistory = [],
    children
}) => {
    const isYearly = month === null;

    // Color themes based on type
    const getTheme = () => {
        switch (type) {
            case 'debt': return 'red';
            case 'investment': return 'indigo';
            case 'income': return 'green'; // Future use
            default: return 'emerald'; // asset
        }
    };
    const theme = getTheme();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    {/* Back button logic */}
                    {!isYearly && (
                        <button onClick={onBackToYearly} className={`inline-flex items-center text-sm font-medium text-${theme}-600 hover:text-${theme}-700 mb-2 transition-colors`}>
                            <LuArrowLeft className="mr-1" /> Back to {year} Overview
                        </button>
                    )}
                    {isYearly && (
                        <h2 className="text-3xl font-bold text-slate-100">{title}</h2>
                    )}
                    {isYearly && <p className="text-slate-400">{subtitle}</p>}
                </div>

                {/* Navigation / Year toggle could go here if we support multi-year later */}
                <div className="flex items-center gap-4 bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-700">
                    {!isYearly ? (
                        <>
                            <button onClick={() => onNavigateMonth('prev')} className="p-1 hover:bg-slate-700/80 rounded-full transition text-slate-300 hover:text-white">&lt;</button>
                            <span className="text-lg font-bold text-slate-100 w-32 text-center">{MONTH_NAMES[month]} {year}</span>
                            <button onClick={() => onNavigateMonth('next')} className="p-1 hover:bg-slate-700/80 rounded-full transition text-slate-300 hover:text-white">&gt;</button>
                        </>
                    ) : (
                        <span className="text-lg font-bold text-slate-100">{year} Overview</span>
                    )}
                </div>
            </div>

            {/* Content */}
            {isYearly ? (
                <>
                    <YearlyFinancialSummary
                        year={year}
                        totalValue={totalAnnualValue}
                        type={type}
                        monthlyHistory={monthlyHistory}
                    />
                    <FinancialVisualization
                        data={monthlyHistory}
                        type={type}
                        year={year}
                    />
                    <YearlyGrid
                        monthlyHistory={monthlyHistory}
                        onMonthClick={onMonthClick}
                        type={type}
                    />
                </>
            ) : (
                <div className="animate-fade-in-up">
                    {/* Monthly Detail View */}
                    {children}
                </div>
            )}
        </div>
    );
};

export default TrackerLayout;
