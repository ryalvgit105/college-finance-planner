import React, { useMemo } from 'react';
import Day from './Day';
import { formatDate } from '../utils/dateUtils';
import { ChevronLeftIcon } from './icons';

const Calendar = ({ currentDate, spendingData, onDayClick, view, selectedWeek, onBackToMonth }) => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const calendarGrid = useMemo(() => {
        if (view === 'week' && selectedWeek) {
            const days = [];
            let day = new Date(selectedWeek);
            for (let i = 0; i < 7; i++) {
                days.push(new Date(day));
                day.setDate(day.getDate() + 1);
            }
            return days;
        }

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
        const endDate = new Date(lastDayOfMonth);
        if (endDate.getDay() !== 6) {
            endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
        }

        const days = [];
        let day = startDate;
        while (day <= endDate) {
            days.push(new Date(day));
            day.setDate(day.getDate() + 1);
        }
        return days;
    }, [currentDate, view, selectedWeek]);

    return (
        <div>
            {view === 'week' && (
                <button
                    onClick={onBackToMonth}
                    className="mb-4 flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors duration-200">
                    <ChevronLeftIcon className="w-4 h-4" />
                    Back to Month View
                </button>
            )}
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {daysOfWeek.map(day => (
                    <div key={day} className="py-2">{day}</div>
                ))}
            </div>
            <div className={`grid grid-cols-7 ${view === 'month' ? 'gap-1' : 'gap-2'}`}>
                {calendarGrid.map((day, index) => {
                    const dayKey = formatDate(day);
                    const spendingForDay = spendingData[dayKey] || [];
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    return (
                        <Day
                            key={index}
                            date={day}
                            spendingForDay={spendingForDay}
                            isCurrentMonth={isCurrentMonth}
                            onDayClick={onDayClick}
                            size={view === 'week' ? 'large' : 'small'}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;
