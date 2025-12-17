import React from 'react';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const ValueHistoryChart = ({ data }) => {
    if (!data || data.length === 0) {
        return null;
    }

    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="pt-2">
            <h3 className="font-semibold text-base text-gray-800 border-b pb-2">5-Year Value History</h3>
            <div className="mt-4 flex items-end justify-between h-32 p-2 bg-gray-50 rounded-lg space-x-2">
                {data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center w-full group relative h-full justify-end">
                        <div className="absolute -top-7 mb-2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                            {formatCurrency(item.value)}
                        </div>
                        <div
                            className="w-3/5 bg-blue-100 hover:bg-blue-500 rounded-t-sm transition-colors duration-300"
                            style={{ height: `${(item.value / maxValue) * 100}%` }}
                        />
                        <span className="text-xs text-gray-500 mt-1">{item.year}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ValueHistoryChart;
