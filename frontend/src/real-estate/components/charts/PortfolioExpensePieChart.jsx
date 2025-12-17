import React from 'react';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const LegendItem = ({ colorClass, label, value }) => (
    <div className="flex items-center">
        <span className={`w-3 h-3 rounded-sm ${colorClass} mr-2`}></span>
        <div>
            <span className="font-medium text-gray-800">{label}</span>
            <span className="block text-gray-500 font-mono">{formatCurrency(value)}</span>
        </div>
    </div>
);

const PortfolioExpensePieChart = ({ piti, opex, unitCosts }) => {
    const total = piti + opex + unitCosts;

    if (total === 0) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-md h-full flex flex-col justify-center items-center">
                <h3 className="font-semibold text-gray-800 text-center">Portfolio Expense Breakdown</h3>
                <p className="text-sm text-gray-500 mt-2 text-center">No expense data to visualize.</p>
            </div>
        );
    }

    const pitiPercentage = (piti / total) * 100;
    const opexPercentage = (opex / total) * 100;

    // Using inline styles for conic gradient as Tailwind doesn't have it by default for arbitrary values
    const conicGradientStyle = {
        background: `conic-gradient(
            #9013FE ${pitiPercentage}%, 
            #F5A623 0% ${pitiPercentage + opexPercentage}%,
            #F88A3B 0%
        )`,
    }

    return (
        <div className="bg-white p-4 rounded-xl shadow-md h-full">
            <h3 className="font-semibold text-gray-800">Portfolio Expense Breakdown</h3>
            <div className="mt-2 flex items-center gap-6">
                <div
                    className="w-28 h-28 rounded-full flex-shrink-0"
                    style={conicGradientStyle}
                    role="img"
                    aria-label={`Pie chart showing expense breakdown.`}
                />
                <div className="text-sm space-y-3">
                    <LegendItem colorClass="bg-purple-600" label="Total PITI" value={piti} />
                    <LegendItem colorClass="bg-yellow-400" label="Total OpEx" value={opex} />
                    <LegendItem colorClass="bg-orange-400" label="Total Unit Costs" value={unitCosts} />
                </div>
            </div>
        </div>
    );
};

export default PortfolioExpensePieChart;
