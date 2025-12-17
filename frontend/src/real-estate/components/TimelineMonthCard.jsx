import React, { useState } from 'react';

// Consistent currency formatting
const formatCurrency = (amount) => {
    const sign = amount < 0 ? '-' : '';
    const value = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.abs(amount));
    return `${sign}${value}`;
};

const DetailRow = ({ label, value, indent, isSub }) => (
    <div className={`flex justify-between items-center ${indent ? 'pl-4' : ''} ${isSub ? 'text-xs' : 'text-sm'}`}>
        <span className="text-gray-500 truncate" title={label}>{label}</span>
        <span className="font-medium flex-shrink-0 ml-2">{formatCurrency(value)}</span>
    </div>
);

const SectionToggle = ({ title, total, colorClass, children }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center text-sm cursor-pointer py-1"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-2">
                    <svg className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7-7"></path></svg>
                    <span className="text-gray-800">{title}</span>
                </div>
                <span className={`${colorClass} font-semibold`}>{formatCurrency(total)}</span>
            </button>
            <div className={`transition-all duration-300 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr] opacity-100 pt-1' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden space-y-1 pl-[22px] border-l border-gray-200 ml-1.5">
                    {children}
                </div>
            </div>
        </div>
    );
};


const TimelineMonthCard = ({ month, isGoalMonth }) => {
    return (
        <div className={`bg-white p-4 rounded-lg border ${isGoalMonth ? 'border-green-500' : 'border-gray-200'}`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800">Month {month.month}</h3>
                {isGoalMonth && <span className="text-xs font-bold uppercase text-green-500 bg-emerald-50 px-2 py-1 rounded-full">GOAL REACHED!</span>}
            </div>

            {/* Body */}
            <div className="space-y-1">
                <div className="flex justify-between text-sm pb-2">
                    <span className="text-gray-500">Starting Balance</span>
                    <span className="font-medium">{formatCurrency(month.start)}</span>
                </div>

                <SectionToggle title="Rental Income" total={month.incomeTotal} colorClass="text-green-500">
                    {month.incomeBreakdown.map((item, i) => (
                        <DetailRow key={i} label={item.name} value={item.amount} />
                    ))}
                </SectionToggle>
                <div className="flex justify-between text-green-500 text-sm pl-[22px]">
                    <span className="text-gray-800">Personal Savings</span>
                    <span className="font-semibold">{formatCurrency(month.personalSavings)}</span>
                </div>

                <SectionToggle title="Property Expenses" total={-month.expensesTotal} colorClass="text-red-500">
                    {month.expenseBreakdown.map((item, i) => (
                        <div key={i} className="pt-1">
                            <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                            <DetailRow label="PITI" value={-item.piti} indent isSub />
                            <DetailRow label="OpEx" value={-item.opex} indent isSub />
                            <DetailRow label="Unit Costs" value={-item.unitCosts} indent isSub />
                        </div>
                    ))}
                </SectionToggle>

                {/* Footer */}
                <div className="flex justify-between font-bold border-t border-gray-200 pt-2 mt-2 text-base">
                    <span>Ending Balance</span>
                    <span>{formatCurrency(month.end)}</span>
                </div>
            </div>
        </div>
    );
};

export default TimelineMonthCard;
