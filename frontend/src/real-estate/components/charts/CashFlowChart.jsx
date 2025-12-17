import React from 'react';

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

const CashFlowChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-center text-gray-500">
                <h3 className="font-semibold text-gray-800 mb-2">Cash Flow by Property</h3>
                <p className="text-sm">Add a property to see its cash flow.</p>
            </div>
        );
    }

    const maxCashFlow = Math.max(...data.map(d => d.cashFlow), 1);

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Cash Flow by Property</h3>
            <div className="space-y-4">
                {data.map((item, index) => {
                    const barWidth = maxCashFlow > 0 ? (item.cashFlow / maxCashFlow) * 100 : 0;
                    const isPositive = item.cashFlow >= 0;

                    return (
                        <div key={index} className="flex items-center group">
                            <div className="w-full bg-gray-100 rounded-full h-5 relative">
                                <div
                                    className={`h-5 rounded-full transition-all duration-500 ${isPositive ? 'bg-secondary' : 'bg-danger'}`}
                                    style={{ width: `${isPositive ? barWidth : 0}%` }}
                                ></div>
                            </div>
                            <div className="flex-shrink-0 w-48 text-right ml-4">
                                <span className="text-sm text-gray-500 truncate">{item.name}</span>
                                <p className="font-semibold text-sm text-gray-800">{formatCurrency(item.cashFlow)}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CashFlowChart;
