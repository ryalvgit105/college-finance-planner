import React from 'react';

const formatCurrency = (amount, compact = false) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        notation: compact && amount >= 1000 ? 'compact' : 'standard',
    }).format(amount);
};

const DonutChart = ({ progress }) => {
    const size = 120;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle
                className="text-gray-200"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
            />
            <circle
                className="text-blue-500" // Changed brand-blue to blue-500
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
            />
        </svg>
    );
};


const SavingsProgress = ({ current, target, monthlyContribution }) => {
    const progressPercentage = Math.min((current / target) * 100, 100);

    const monthsRemaining = monthlyContribution > 0 && current < target
        ? Math.ceil((target - current) / monthlyContribution)
        : Infinity;

    return (
        <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center h-full justify-center">
            <h3 className="font-semibold text-gray-800 mb-3">Next Down Payment</h3>
            <div className="relative">
                <DonutChart progress={progressPercentage} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">{formatCurrency(current, true)}</span>
                    <span className="text-xs text-gray-400">of {formatCurrency(target, true)}</span>
                </div>
            </div>
            <div className="text-center mt-3">
                {monthsRemaining !== Infinity ? (
                    <p className="text-sm text-gray-500">
                        <span className="font-bold text-gray-800">{monthsRemaining}</span> months to go
                    </p>
                ) : current >= target ? (
                    <p className="font-bold text-green-500 text-sm">Goal Reached!</p> // brand-green to green-500
                ) : (
                    <p className="text-sm text-gray-500">No progress to goal.</p>
                )}
            </div>
        </div>
    );
};

export default SavingsProgress;
