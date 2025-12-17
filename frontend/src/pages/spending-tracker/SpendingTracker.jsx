import React, { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import Calendar from './components/Calendar';
import SpendingModal from './components/SpendingModal';
import WeeklySummary from './components/WeeklySummary';
import Background from './components/Background';
import { formatDate } from './utils/dateUtils';

const SpendingTracker = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [spendingData, setSpendingData] = useLocalStorage('spendingData', {});
    const [selectedDay, setSelectedDay] = useState(null);
    const [view, setView] = useState('month');
    const [selectedWeek, setSelectedWeek] = useState(null);

    const handlePrevMonth = useCallback(() => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() - 1);
            return newDate;
        });
    }, []);

    const handleNextMonth = useCallback(() => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + 1);
            return newDate;
        });
    }, []);

    const handleDayClick = useCallback((day) => {
        setSelectedDay(day);
    }, []);

    const closeModal = useCallback(() => {
        setSelectedDay(null);
    }, []);

    const handleAddSpending = useCallback((item) => {
        if (!selectedDay) return;
        const key = formatDate(selectedDay);
        const newSpendingItem = { ...item, id: new Date().toISOString() };
        const daySpending = spendingData[key] ? [...spendingData[key], newSpendingItem] : [newSpendingItem];
        setSpendingData({ ...spendingData, [key]: daySpending });
    }, [selectedDay, spendingData, setSpendingData]);

    const handleDeleteSpending = useCallback((itemId) => {
        if (!selectedDay) return;
        const key = formatDate(selectedDay);
        const updatedSpending = spendingData[key].filter(item => item.id !== itemId);
        if (updatedSpending.length > 0) {
            setSpendingData({ ...spendingData, [key]: updatedSpending });
        } else {
            const { [key]: _, ...rest } = spendingData;
            setSpendingData(rest);
        }
    }, [selectedDay, spendingData, setSpendingData]);

    const spendingForSelectedDay = useMemo(() => {
        if (!selectedDay) return [];
        return spendingData[formatDate(selectedDay)] || [];
    }, [selectedDay, spendingData]);

    const handleWeekClick = useCallback((weekStartDate) => {
        const sundayOfWeek = new Date(weekStartDate);
        sundayOfWeek.setDate(sundayOfWeek.getDate() - sundayOfWeek.getDay());
        setSelectedWeek(sundayOfWeek);
        setView('week');
    }, []);

    const handleBackToMonth = useCallback(() => {
        setSelectedWeek(null);
        setView('month');
    }, []);

    return (
        <div className="min-h-screen text-gray-200 p-4 sm:p-6 lg:p-8 font-sans relative">
            <Background />
            <div className="max-w-7xl mx-auto relative">
                <Header
                    currentDate={currentDate}
                    onPrevMonth={handlePrevMonth}
                    onNextMonth={handleNextMonth}
                />
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
                    <div className={`
            ${view === 'month' ? 'lg:col-span-2' : 'lg:col-span-3'} 
            bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-2xl p-6 transition-all duration-300`}
                    >
                        <Calendar
                            currentDate={currentDate}
                            spendingData={spendingData}
                            onDayClick={handleDayClick}
                            view={view}
                            selectedWeek={selectedWeek}
                            onBackToMonth={handleBackToMonth}
                        />
                    </div>
                    {view === 'month' && (
                        <div className="mt-8 lg:mt-0">
                            <WeeklySummary
                                currentDate={currentDate}
                                spendingData={spendingData}
                                onWeekClick={handleWeekClick}
                            />
                        </div>
                    )}
                </div>
            </div>

            {selectedDay && (
                <SpendingModal
                    isOpen={!!selectedDay}
                    onClose={closeModal}
                    selectedDay={selectedDay}
                    spendingForDay={spendingForSelectedDay}
                    onAddSpending={handleAddSpending}
                    onDeleteSpending={handleDeleteSpending}
                />
            )}
        </div>
    );
};

export default SpendingTracker;
