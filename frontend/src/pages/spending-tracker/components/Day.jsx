import React, { useMemo } from 'react';
import { getCategoryRowClasses } from '../utils/colorUtils';

const Day = ({ date, spendingForDay, isCurrentMonth, onDayClick, size = 'small' }) => {
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

    const totalSpent = useMemo(() => {
        return spendingForDay.reduce((sum, item) => sum + item.amount, 0);
    }, [spendingForDay]);

    const dayClasses = `
    relative p-2 flex flex-col border border-slate-700 rounded-md
    cursor-pointer transition-all duration-200 overflow-hidden
    ${isCurrentMonth ? 'bg-slate-800/20' : 'bg-slate-900/20'}
    ${isCurrentMonth ? 'hover:bg-slate-700/40 hover:shadow-md' : ''}
    ${isToday ? 'border-2 border-blue-500' : ''}
    ${size === 'small' ? 'h-24 sm:h-32' : 'h-60 sm:h-80'}
  `;

    const dayNumberClasses = `
    flex items-center justify-center font-medium
    ${size === 'small' ? 'text-sm' : 'text-base'}
    ${isToday ? 'bg-blue-500 text-white rounded-full w-7 h-7' : 'w-6 h-6'}
    ${!isCurrentMonth ? 'text-gray-500' : 'text-gray-100'}
  `;

    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return (
        <div className={dayClasses} onClick={() => onDayClick(date)}>
            <div className="flex justify-end">
                <span className={dayNumberClasses}>{date.getDate()}</span>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar-sm pr-1 -mr-2 mt-1 space-y-1">
                {spendingForDay.map(item => (
                    <div
                        key={item.id}
                        className={`flex justify-between items-center ${getCategoryRowClasses(item.category || 'Other')} ${size === 'small' ? 'text-xs' : 'text-sm'}`}
                        title={`${item.category}: ${item.description} - ${currencyFormatter.format(item.amount)}`}
                    >
                        <div className="flex items-center min-w-0">
                            <span className="truncate">{item.description}</span>
                        </div>
                        <span className="font-semibold ml-2 whitespace-nowrap flex-shrink-0">
                            {currencyFormatter.format(item.amount)}
                        </span>
                    </div>
                ))}
            </div>

            {totalSpent > 0 && (
                <div className="mt-auto text-right pt-1 border-t border-slate-700/50">
                    <p className={`${size === 'small' ? 'text-xs' : 'text-sm'} ${totalSpent > 100 ? 'text-red-500' : 'text-green-400'} font-bold`}>
                        {currencyFormatter.format(totalSpent)}
                    </p>
                </div>
            )}

            {/* Injecting styles directly for simplicity */}
            <style>{`
        .custom-scrollbar-sm::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar-sm::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar-sm::-webkit-scrollbar-thumb {
            background-color: #475569; /* slate-600 */
            border-radius: 20px;
        }
        .dark .custom-scrollbar-sm::-webkit-scrollbar-thumb {
            background-color: #4b5563; /* gray-600 */
        }
      `}</style>
        </div>
    );
};

export default Day;
