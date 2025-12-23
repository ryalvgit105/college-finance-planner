import React, { useMemo } from 'react';
import { LuTrendingUp, LuTrendingDown, LuDollarSign, LuCalendar } from 'react-icons/lu';

const YearlyFinancialSummary = ({ year, totalValue, type, monthlyHistory = [] }) => {
    // Determine theme colors
    const getTheme = () => {
        switch (type) {
            case 'debt': return {
                bg: 'bg-red-500/10',
                border: 'border-red-500/20',
                text: 'text-red-400',
                iconBg: 'bg-red-500/20',
                iconColor: 'text-red-400',
                subtext: 'text-red-300'
            };
            case 'investment': return {
                bg: 'bg-indigo-500/10',
                border: 'border-indigo-500/20',
                text: 'text-indigo-400',
                iconBg: 'bg-indigo-500/20',
                iconColor: 'text-indigo-400',
                subtext: 'text-indigo-300'
            };
            case 'income': return {
                bg: 'bg-green-500/10',
                border: 'border-green-500/20',
                text: 'text-green-400',
                iconBg: 'bg-green-500/20',
                iconColor: 'text-green-400',
                subtext: 'text-green-300'
            };
            default: return { // asset
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                text: 'text-emerald-400',
                iconBg: 'bg-emerald-500/20',
                iconColor: 'text-emerald-400',
                subtext: 'text-emerald-300'
            };
        }
    };

    const theme = getTheme();
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Calculate Insights
    const stats = useMemo(() => {
        const validMonths = monthlyHistory.filter(v => v > 0);
        const count = validMonths.length || 1;
        const total = monthlyHistory.reduce((sum, val) => sum + (val || 0), 0);

        // Average of non-zero months (approximating active months)
        const average = validMonths.length > 0 ? total / validMonths.length : 0;

        // Find max and min
        let maxVal = -1;
        let maxIdx = -1;
        let minVal = Infinity;
        let minIdx = -1;

        monthlyHistory.forEach((val, idx) => {
            const v = val || 0;
            if (v > maxVal) { maxVal = v; maxIdx = idx; }
            if (v < minVal && v > 0) { minVal = v; minIdx = idx; } // Ignore 0 for min unless all are 0
        });

        if (minVal === Infinity) minVal = 0;

        return { average, maxVal, maxIdx, minVal, minIdx };
    }, [monthlyHistory]);


    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg border border-slate-700/60 p-6 mb-8">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center">
                <LuCalendar className="mr-2 text-slate-400" />
                Financial Summary for {year}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Card */}
                <div className={`p-4 rounded-lg border ${theme.bg} ${theme.border}`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${theme.subtext} opacity-80`}>Total {type === 'debt' ? 'Balance' : 'Value'}</span>
                        <div className={`p-2 rounded-full ${theme.iconBg}`}>
                            <LuDollarSign className={`w-4 h-4 ${theme.iconColor}`} />
                        </div>
                    </div>
                    <div className={`text-2xl font-bold ${theme.text}`}>
                        ${totalValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Current year total</div>
                </div>

                {/* Average Card */}
                <div className="p-4 rounded-lg border bg-slate-800/50 border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-400">Monthly Average</span>
                        <div className="p-2 rounded-full bg-slate-700 border border-slate-600">
                            <LuTrendingUp className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-100">
                        ${stats.average.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Based on active months</div>
                </div>

                {/* Highest Month */}
                <div className="p-4 rounded-lg border bg-slate-800/50 border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-400">Highest Month</span>
                        <div className="p-2 rounded-full bg-slate-700 border border-slate-600">
                            <LuTrendingUp className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-100">
                        {stats.maxIdx >= 0 ? MONTH_NAMES[stats.maxIdx] : '-'}
                    </div>
                    <div className="text-xs text-emerald-400 mt-1 font-medium">
                        ${stats.maxVal.toLocaleString()}
                    </div>
                </div>

                {/* Lowest Month */}
                <div className="p-4 rounded-lg border bg-slate-800/50 border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-400">Lowest Month</span>
                        <div className="p-2 rounded-full bg-slate-700 border border-slate-600">
                            <LuTrendingDown className="w-4 h-4 text-rose-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-100">
                        {stats.minIdx >= 0 ? MONTH_NAMES[stats.minIdx] : '-'}
                    </div>
                    <div className="text-xs text-rose-400 mt-1 font-medium">
                        ${stats.minVal.toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default YearlyFinancialSummary;
