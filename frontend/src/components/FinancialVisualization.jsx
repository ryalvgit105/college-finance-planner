import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

const FinancialVisualization = ({ data, type, year }) => {
    // Prepare Data for Charts (Transform from [12 numbers] to [{name: 'Jan', value: 123}, ...])
    const chartData = useMemo(() => {
        const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return data.map((value, index) => ({
            name: MONTH_NAMES[index],
            value: value || 0
        }));
    }, [data]);

    // Determine Theme Colors
    const getColors = () => {
        switch (type) {
            case 'debt': return { fill: '#f87171', stroke: '#dc2626' }; // red-400, red-600
            case 'investment': return { fill: '#818cf8', stroke: '#4f46e5' }; // indigo-400, indigo-600
            case 'income': return { fill: '#4ade80', stroke: '#16a34a' }; // green-400, green-600
            default: return { fill: '#34d399', stroke: '#059669' }; // emerald-400, emerald-600 (asset)
        }
    };

    const colors = getColors();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800 p-3 border border-slate-700 shadow-xl rounded-lg">
                    <p className="text-sm font-bold text-slate-100">{label} {year}</p>
                    <p className="text-sm font-mono" style={{ color: colors.fill }}>
                        ${payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg border border-slate-700/60 p-6 mb-8">
            <h3 className="text-lg font-bold text-slate-100 mb-6">Yearly Trend</h3>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id={`color${type}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors.stroke} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={colors.stroke} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            tickFormatter={(value) => `$${value >= 1000 ? `${value / 1000}k` : value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={colors.stroke}
                            fillOpacity={1}
                            fill={`url(#color${type})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FinancialVisualization;
