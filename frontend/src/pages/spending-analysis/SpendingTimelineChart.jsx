import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SpendingTimelineChart = ({ data, onBarClick }) => {
    // data structure: [{ name: 'Jan', Housing: 1200, Food: 400, ... }]

    // Get all unique keys from data objects except 'name' to use as bars
    const getCategories = () => {
        if (!data || data.length === 0) return [];
        const keys = new Set();
        data.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key !== 'name' && key !== 'total' && key !== 'monthIndex') {
                    keys.add(key);
                }
            });
        });
        return Array.from(keys);
    };

    const categories = getCategories();

    // Consistent colors for standard categories, random for others
    const getCategoryColor = (category, index) => {
        const colors = {
            'Housing': '#3b82f6', // blue-500
            'Rent/Mortgage': '#3b82f6',
            'Food': '#f97316',    // orange-500
            'Groceries': '#f97316',
            'Dining Out': '#facc15', // yellow-400
            'Transportation': '#22c55e', // green-500
            'Utilities': '#06b6d4', // cyan-500
            'Entertainment': '#a855f7', // purple-500
            'Shopping': '#ec4899', // pink-500
            'Healthcare': '#ef4444', // red-500
            'Insurance': '#64748b', // slate-500
            'Debt Payment': '#94a3b8', // slate-400
            'Subscriptions': '#8b5cf6', // violet-500
            'Education': '#14b8a6', // teal-500
            'Other': '#9ca3af', // gray-400
        };

        if (colors[category]) return colors[category];

        // Fallback palette
        const palette = ['#fbbf24', '#84cc16', '#34d399', '#38bdf8', '#818cf8', '#c084fc', '#f472b6'];
        return palette[index % palette.length];
    };

    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                No spending data for this period
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                onClick={(data) => {
                    if (data && data.activePayload && data.activePayload.length > 0) {
                        onBarClick(data.activePayload[0].payload);
                    }
                }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                    cursor={{ fill: '#1f2937', opacity: 0.4 }}
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#f3f4f6' }}
                    itemStyle={{ color: '#d1d5db' }}
                    formatter={(value) => [`$${value}`, '']}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                {categories.map((category, index) => (
                    <Bar
                        key={category}
                        dataKey={category}
                        stackId="a"
                        fill={getCategoryColor(category, index)}
                        radius={index === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
};

export default SpendingTimelineChart;
