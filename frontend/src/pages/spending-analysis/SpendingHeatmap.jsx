import React from 'react';

const SpendingHeatmap = ({ data }) => {
    // data: { months: ['Jan', ...], categories: ['Food', ...], matrix: { 'Food': [100, 200, ...], ... } }

    const { months, categories, matrix } = data;

    // Helper to determine color intensity
    const getCellColor = (amount, maxAmount) => {
        if (!amount || amount === 0) return 'bg-gray-800/50'; // Empty/Zero

        const intensity = Math.min(amount / (maxAmount * 0.8), 1); // Normalize, cap at 80% of max to highlight outliers

        // Red scale: from very dark red (low spend) to bright red (high spend)
        // using opacity for simplicity or specific Tailwind classes
        // For distinct steps:
        if (intensity < 0.2) return 'bg-red-900/20 text-red-100/50';
        if (intensity < 0.4) return 'bg-red-900/40 text-red-100';
        if (intensity < 0.6) return 'bg-red-800/60 text-white';
        if (intensity < 0.8) return 'bg-red-700/80 text-white';
        return 'bg-red-600 text-white font-bold';
    };

    // Calculate max value for scaling
    let maxVal = 0;
    Object.values(matrix).forEach(row => {
        row.forEach(val => {
            if (val > maxVal) maxVal = val;
        });
    });

    if (!categories || categories.length === 0) {
        return <div className="text-gray-500 text-center py-10">No pattern data available</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
                <thead>
                    <tr>
                        <th className="sticky left-0 z-10 bg-[#111214] p-3 text-gray-400 font-medium w-32">Category</th>
                        {months.map((month, i) => (
                            <th key={i} className="p-3 text-gray-400 font-medium text-center min-w-[60px]">{month}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {categories.map(category => (
                        <tr key={category} className="hover:bg-gray-800/30 transition-colors">
                            <td className="sticky left-0 z-10 bg-[#111214] p-3 font-medium text-gray-300 border-r border-gray-800 truncate max-w-[128px]" title={category}>
                                {category}
                            </td>
                            {months.map((month, i) => {
                                const amount = matrix[category] ? matrix[category][i] : 0;
                                return (
                                    <td key={i} className="p-1">
                                        <div
                                            className={`h-8 rounded-md flex items-center justify-center ${getCellColor(amount, maxVal)} transition-all hover:scale-105 cursor-default`}
                                            title={`${category} in ${month}: $${amount.toLocaleString()}`}
                                        >
                                            {amount > 0 ? `$${amount.toLocaleString(undefined, { notation: "compact" })}` : '-'}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SpendingHeatmap;
