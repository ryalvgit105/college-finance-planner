import React from 'react';
import { CATEGORY_CONFIG } from '../constants';

const SummaryCard = ({ categoryTotals, totalExpenses, cashFlow, income }) => {
    const getCashFlowColor = () => {
        if (cashFlow > 0) return 'text-green-600';
        if (cashFlow < 0) return 'text-red-600';
        return 'text-gray-800';
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-600">Summary</h2>

            <div className="space-y-3 mb-5">
                {Object.entries(categoryTotals).map(([category, total]) => (
                    <div key={category} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${CATEGORY_CONFIG[category].color.replace('border-', 'bg-')}`}></span>
                            <span className="text-gray-600">{category}</span>
                        </div>
                        <span className="font-mono text-gray-800">
                            {total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </span>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between items-center font-medium">
                    <span className="text-gray-600">Total Expenses</span>
                    <span className="text-base text-red-600 font-mono">
                        {totalExpenses.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                </div>
                <div className="flex justify-between items-center font-medium">
                    <span className="text-gray-600">Total Income</span>
                    <span className="text-base text-green-600 font-mono">
                        {income.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mt-5">
                <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-700">Net Cash Flow</span>
                    <span className={`text-2xl font-bold ${getCashFlowColor()}`}>
                        {cashFlow.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 text-right">
                    {cashFlow > 0 ? 'Nicely done! Positive cash flow.' : cashFlow === 0 ? 'You broke even.' : 'Review your spending.'}
                </p>
            </div>
        </div>
    );
};

export default SummaryCard;
