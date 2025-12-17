import React, { useState } from 'react';

const formatCurrency = (amount) => {
    const sign = amount < 0 ? '' : '';
    const value = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.abs(amount));
    return `${sign}${value}`;
};

const YearlySummaryCard = ({ year, months, children, isInitiallyExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

    if (months.length === 0) return null;

    const netSavings = months[months.length - 1].end - months[0].start;
    const totalIncome = months[0].incomeTotal * months.length + months[0].personalSavings * months.length;
    const totalExpenses = months[0].expensesTotal * months.length;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 text-left flex justify-between items-center"
                aria-expanded={isExpanded}
            >
                <div>
                    <h2 className="font-bold text-xl text-gray-800">Year {year}</h2>
                    <p className="text-sm text-gray-500">Net Savings: <span className="font-semibold text-blue-500">{formatCurrency(netSavings)}</span></p>
                </div>
                <div className="flex items-center gap-6 text-right">
                    <div>
                        <p className="text-xs text-gray-500">Income</p>
                        <p className="font-semibold text-green-500">{formatCurrency(totalIncome)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-text-secondary">Expenses</p>
                        <p className="font-semibold text-red-500">-{formatCurrency(totalExpenses)}</p>
                    </div>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 pt-0 space-y-3">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YearlySummaryCard;
