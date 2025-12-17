import React, { useMemo } from 'react';
import { formatDate } from '../utils/dateUtils';

const WeeklySummary = ({ currentDate, spendingData, onWeekClick }) => {
    const weeklyTotals = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const weeks = [];
        let currentWeekStart = new Date(year, month, 1);

        while (currentWeekStart.getMonth() === month) {
            let currentWeekEnd = new Date(currentWeekStart);
            currentWeekEnd.setDate(currentWeekEnd.getDate() + (6 - currentWeekStart.getDay()));
            if (currentWeekEnd.getMonth() !== month || currentWeekEnd.getDate() > daysInMonth) {
                currentWeekEnd = new Date(year, month, daysInMonth);
            }

            let total = 0;
            let day = new Date(currentWeekStart);
            while (day <= currentWeekEnd) {
                const dayKey = formatDate(day);
                if (spendingData[dayKey]) {
                    total += spendingData[dayKey].reduce((sum, item) => sum + item.amount, 0);
                }
                day.setDate(day.getDate() + 1);
            }

            weeks.push({ start: currentWeekStart, end: currentWeekEnd, total });

            currentWeekStart = new Date(currentWeekEnd);
            currentWeekStart.setDate(currentWeekStart.getDate() + 1);
        }

        return weeks;
    }, [currentDate, spendingData]);

    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const monthTotal = useMemo(() => {
        return weeklyTotals.reduce((sum, week) => sum + week.total, 0);
    }, [weeklyTotals]);

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-2xl p-6 h-full">
            <h3 className="text-xl font-bold mb-4 text-white">Weekly Summary</h3>
            <div className="space-y-4">
                {weeklyTotals.map((week, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-slate-700/60 rounded-md cursor-pointer hover:bg-slate-700 transition-colors"
                        onClick={() => onWeekClick(week.start)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onWeekClick(week.start)}
                    >
                        <span className="text-sm font-medium text-slate-300">
                            {week.start.getDate()} - {week.end.getDate()} {week.start.toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="font-semibold text-slate-100">
                            {currencyFormatter.format(week.total)}
                        </span>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700">
                <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-slate-100">Month Total:</span>
                    <span className="text-blue-400">{currencyFormatter.format(monthTotal)}</span>
                </div>
            </div>
        </div>
    );
};

export default WeeklySummary;
