import React from 'react';

const VarianceTable = ({ data }) => {
    // data: [{ category: 'Food', budget: 500, actual: 450 }, ...]

    // Sort by Variance (biggest over-spenders first)
    const sortedData = [...data].sort((a, b) => {
        const varA = (a.actual - a.budget);
        const varB = (b.actual - b.budget);
        return varB - varA; // Descending order of "problem"
    });

    return (
        <div className="w-full bg-[#111214] border border-[#2C2C2E] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2C2C2E] bg-[#1C1C1E]/50 flex justify-between items-center">
                <h3 className="font-bold text-gray-200">Category Variance</h3>
                <span className="text-xs text-gray-500 italic">Sorted by highest variance</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-500 border-b border-[#2C2C2E]">
                            <th className="px-6 py-3 font-medium">Category</th>
                            <th className="px-6 py-3 font-medium text-right">Budget</th>
                            <th className="px-6 py-3 font-medium text-right">Actual</th>
                            <th className="px-6 py-3 font-medium text-center">Performance</th>
                            <th className="px-6 py-3 font-medium text-right">Variance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2C2E]">
                        {sortedData.map((item, index) => {
                            const variance = item.actual - item.budget;
                            const percent = item.budget > 0 ? (item.actual / item.budget) * 100 : (item.actual > 0 ? 100 : 0);

                            // Color logic
                            let statusColor = 'bg-emerald-500';
                            let textColor = 'text-green-500';

                            if (variance > 0) {
                                statusColor = 'bg-red-500';
                                textColor = 'text-red-500';
                            } else if (percent > 85) {
                                statusColor = 'bg-yellow-500';
                                textColor = 'text-yellow-500';
                            }

                            // Handle Unbudgeted Spend
                            const isUnbudgeted = item.budget === 0 && item.actual > 0;

                            return (
                                <tr key={index} className="group hover:bg-[#1C1C1E] transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-200">{item.category}</td>
                                    <td className="px-6 py-4 text-right text-gray-400">
                                        {item.budget > 0 ? `$${item.budget.toLocaleString()}` : <span className="text-gray-600">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-200">${item.actual.toLocaleString()}</td>

                                    {/* Performance Bar */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="w-24 h-1.5 bg-gray-700 rounded-full mx-auto overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${statusColor}`}
                                                style={{ width: `${Math.min(percent, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-1">{percent.toFixed(0)}%</div>
                                    </td>

                                    <td className={`px-6 py-4 text-right font-bold ${textColor}`}>
                                        {variance > 0 ? '+' : ''}${variance.toLocaleString()}
                                        {isUnbudgeted && <span className="ml-1 text-[10px] bg-red-900/30 text-red-500 px-1 py-0.5 rounded border border-red-900/50">UNPLANNED</span>}
                                    </td>
                                </tr>
                            );
                        })}
                        {sortedData.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">No data available for this period.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default VarianceTable;
