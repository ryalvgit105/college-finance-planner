import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

const Header = ({ currentDate, onPrevMonth, onNextMonth }) => {
    const monthYearFormat = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="flex items-center justify-between pb-4 border-b border-slate-700">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Spending Tracker</h1>
                <p className="text-sm text-slate-400">Your personal finance calendar</p>
            </div>
            <div className="flex items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-center w-40 text-white">
                    {monthYearFormat.format(currentDate)}
                </h2>
                <div className="flex items-center">
                    <button onClick={onPrevMonth} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors duration-200" aria-label="Previous month">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button onClick={onNextMonth} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors duration-200" aria-label="Next month">
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header;
