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
            <span className="font-medium text-gray-800 text-sm">{label}</span>
            <span className="block text-gray-500 text-xs">{formatCurrency(value)}</span>
        </div>
    </div>
);

const IncomeBreakdownPieChart = ({ hackRentTotal, fullRentalTotal }) => {

    if (fullRentalTotal === 0) {
        return (
            <div className="pt-2">
                <h3 className="font-semibold text-base text-gray-800 border-b pb-2">Income Potential</h3>
                <p className="text-sm text-gray-500 mt-2">No rental income data to visualize.</p>
            </div>
        );
    }

    const ownerUnitRentPotential = fullRentalTotal - hackRentTotal;
    const tenantIncomeHackPercentage = (hackRentTotal / fullRentalTotal) * 100;

    const conicGradientStyle = {
        background: `conic-gradient(
            #3B82F6 ${tenantIncomeHackPercentage}%, 
            #BFDBFE 0%
        )`,
    }

    return (
        <div className="pt-2">
            <h3 className="font-semibold text-base text-gray-800 border-b pb-2">Full Rental Income Potential</h3>
            <div className="mt-4 flex items-center gap-6">
                <div
                    className="w-24 h-24 rounded-full flex-shrink-0"
                    style={conicGradientStyle}
                    role="img"
                    aria-label={`Pie chart showing income breakdown. ${tenantIncomeHackPercentage.toFixed(0)}% from tenants, ${(100 - tenantIncomeHackPercentage).toFixed(0)}% from owner-occupied unit.`}
                />
                <div className="space-y-3">
                    <LegendItem colorClass="bg-blue-500" label="Tenant Income (Hack)" value={hackRentTotal} />
                    <LegendItem colorClass="bg-blue-200" label="Owner-Occupied Unit" value={ownerUnitRentPotential} />
                </div>
            </div>
        </div>
    );
};

export default IncomeBreakdownPieChart;
