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
    onNavigateYear, // New prop for Year Navigation
    allowNextYear = true, // Default to true
    allowNextMonth = true, // Default to true
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
            <header className="text-center mb-10 flex justify-between items-center max-w-7xl mx-auto flex-col md:flex-row gap-6">
                {/* Left Action / Back Button Area */}
                <div className="w-full md:w-48 flex justify-center md:justify-start order-2 md:order-1">
                    {!isYearly && (
                        <button
                            onClick={onBackToYearly}
                            className={`inline-flex items-center px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-all text-sm font-semibold text-${theme}-400 hover:text-${theme}-300 shadow-sm`}
                        >
                            <LuArrowLeft className="mr-2" /> Back to Yearly
                        </button>
                    )}
                </div>

                {/* Center Title */}
                <div className="flex-grow order-1 md:order-2">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-violet-400 mb-2">
                        {title}
                    </h1>
                    <p className="text-slate-400 text-lg">{subtitle}</p>

                    {/* Year Navigation - Only visible in Yearly View */}
                    {isYearly && onNavigateYear && (
                        <div className="flex justify-center items-center gap-4 mt-6">
                            <button
                                onClick={() => onNavigateYear('prev')}
                                className="px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 border border-slate-700 transition-all text-xl font-bold button-glow-sky text-sky-400"
                                aria-label="Previous year"
                            >
                                &lt;
                            </button>
                            <h2 className="text-3xl font-bold text-slate-100 w-32 text-center tabular-nums">{year}</h2>
                            <button
                                onClick={() => onNavigateYear('next')}
                                disabled={!allowNextYear}
                                className={`px-4 py-2 rounded-lg border border-slate-700 transition-all text-xl font-bold tabular-nums
                                    ${!allowNextYear
                                        ? 'bg-slate-900/50 text-slate-600 cursor-not-allowed opacity-50'
                                        : 'bg-slate-800 hover:bg-slate-700 button-glow-sky text-sky-400'
                                    }`}
                                aria-label="Next year"
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Action Area (Ghost div for spacing or actions) */}
                <div className="w-full md:w-48 flex justify-center md:justify-end order-3">
                    {/* Placeholder for potential right-side actions if needed */}
                </div>
            </header>

            {/* Monthly Navigation Bar (Only in Monthly View) */}
            {!isYearly && (
                <div className="flex justify-center items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 backdrop-blur-sm max-w-xl mx-auto shadow-lg mb-8">
                    <button onClick={() => onNavigateMonth('prev')} className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white">&lt;</button>
                    <span className="text-xl font-bold text-slate-100 w-48 text-center">{MONTH_NAMES[month]} {year}</span>
                    <button
                        onClick={() => onNavigateMonth('next')}
                        disabled={!allowNextMonth}
                        className={`p-2 rounded-lg transition 
                            ${!allowNextMonth
                                ? 'text-slate-700 cursor-not-allowed'
                                : 'hover:bg-slate-700 text-slate-400 hover:text-white'
                            }`}
                    >
                        &gt;
                    </button>
                </div>
            )}

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
