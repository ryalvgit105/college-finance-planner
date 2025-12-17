import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';

const BurnDownChart = ({ data, totalBudget, currentDay, monthDays }) => {
    // data expected format: [{ day: 1, actual: 50, ideal: 100 }, ...]

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1C1C1E] border border-[#2C2C2E] p-3 rounded-lg shadow-xl text-xs">
                    <p className="text-gray-300 font-bold mb-2">Day {label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                            <span className="capitalize text-gray-400">{entry.name}:</span>
                            <span className="font-mono font-bold text-gray-200">
                                ${(entry.value || 0).toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C6AA76" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#C6AA76" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorIdeal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                <XAxis
                    dataKey="day"
                    stroke="#4B5563"
                    tick={{ fontSize: 10 }}
                    interval={2}
                />
                <YAxis
                    stroke="#4B5563"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Ideal Line (Budget Guide) */}
                <Area
                    type="monotone"
                    dataKey="ideal"
                    name="Ideal Pace"
                    stroke="#3b82f6"
                    fill="url(#colorIdeal)"
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                />

                {/* Actual Spending Line */}
                <Area
                    type="monotone"
                    dataKey="actual"
                    name="Actual Spend"
                    stroke="#C6AA76"
                    fill="url(#colorActual)"
                    strokeWidth={2}
                />

                {/* Reference Line for Total Budget */}
                <ReferenceLine y={totalBudget} label="Budget Limit" stroke="red" strokeDasharray="3 3" />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default BurnDownChart;
