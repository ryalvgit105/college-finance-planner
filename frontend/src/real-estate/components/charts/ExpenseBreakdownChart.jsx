import React from 'react';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const Bar = ({ label, value, percentage, colorClass }) => (
    <div>
        <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-800">{label}</span>
            <span className="text-gray-500">{formatCurrency(value)}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
            <div
                className={`${colorClass} h-2 rounded-full`}
                style={{ width: `${percentage}%` }}
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
                aria-label={`${label} expense`}
            />
        </div>
    </div>
);


const ExpenseBreakdownChart = ({ piti, opex, unitCosts }) => {
    const total = piti + opex + unitCosts;

    if (total === 0) {
        return null;
    }

    const pitiPercentage = (piti / total) * 100;
    const opexPercentage = (opex / total) * 100;
    const unitCostsPercentage = (unitCosts / total) * 100;

    return (
        <div className="pt-2">
            <h3 className="font-semibold text-base text-gray-800 border-b pb-2">Monthly Expense Breakdown</h3>
            <div className="mt-4 space-y-3">
                <Bar label="PITI" value={piti} percentage={pitiPercentage} colorClass="bg-purple-500" />
                <Bar label="Operating Expenses" value={opex} percentage={opexPercentage} colorClass="bg-yellow-500" />
                {unitCosts > 0 && (
                    <Bar label="Unit Costs" value={unitCosts} percentage={unitCostsPercentage} colorClass="bg-orange-500" />
                )}
                <div className="flex justify-between font-semibold border-t pt-2 mt-2 text-sm">
                    <span>Total Monthly Expense</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    );
};

export default ExpenseBreakdownChart;
