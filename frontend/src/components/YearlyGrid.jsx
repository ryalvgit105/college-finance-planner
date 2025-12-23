import React from 'react';
import { LuCalendar } from 'react-icons/lu';

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const YearlyGrid = ({
    monthlyHistory = [],
    onMonthClick,
    type = 'asset'
}) => {
    // Determine color theme
    const getTheme = () => {
        switch (type) {
            case 'debt': return 'rose';
            case 'investment': return 'indigo';
            case 'income': return 'green'; // matches tailwind green, can use emerald too
            default: return 'emerald'; // asset
        }
    };
    const theme = getTheme();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {MONTH_NAMES.map((m, index) => {
                const histValue = monthlyHistory[index] || 0;

                return (
                    <div
                        key={m}
                        onClick={() => onMonthClick(index)} // 0-11
                        className={`bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700/80 shadow-sm hover:shadow-lg hover:border-${theme}-500/50 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 card-glow-${theme} group`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-slate-400 font-medium group-hover:text-slate-200 transition-colors">{m}</span>
                            <LuCalendar className={`w-4 h-4 text-slate-600 group-hover:text-${theme}-400 transition-colors`} />
                        </div>
                        <div className="text-2xl font-bold text-slate-100">
                            ${histValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                        <div className={`text-xs mt-3 font-medium flex items-center gap-1 ${type === 'debt' ? 'text-rose-400' : (type === 'income' ? 'text-green-400' : 'text-emerald-400')} opacity-80 group-hover:opacity-100 transition-opacity`}>
                            View Details <span>&rarr;</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default YearlyGrid;
