import React, { useMemo } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import TimelineMonthCard from '../TimelineMonthCard';
import YearlySummaryCard from '../YearlySummaryCard';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const getUnitRent = (unit, strategy) => {
    if (unit.occupancy === 'vacant' || unit.occupancy === 'ownerOccupied') {
        return 0;
    }
    return strategy === 'houseHack' ? unit.rent : unit.rentFullRental;
};

const Timeline = ({ data }) => {
    const { settings } = useSettings();

    const timelineData = useMemo(() => {
        const months = [];
        let currentSavings = settings.currentSavings;

        if (currentSavings >= settings.savingsTarget) {
            return [];
        }

        const incomeBreakdown = [];
        const expenseBreakdown = [];

        data.properties.forEach(p => {
            const income = p.units.reduce((acc, unit) => acc + getUnitRent(unit, p.strategy), 0);
            incomeBreakdown.push({ name: p.address, amount: income });

            const opexItems = p.strategy === 'houseHack' ? p.opexHouseHackItems : p.opexFullRentalItems;
            const opex = opexItems.reduce((acc, item) => acc + item.amount, 0);

            const piti = p.mortgagePI + p.propertyTaxes + p.propertyInsurance;
            const totalUnitCosts = p.units.reduce((acc, unit) => acc + unit.maintenance + unit.repairs + unit.vacancy, 0);
            const expenses = opex + piti + totalUnitCosts;
            expenseBreakdown.push({ name: p.address, piti: piti, opex: opex, unitCosts: totalUnitCosts, total: expenses });
        });

        const monthlyContribution = data.totalMonthlyCashFlow + settings.personalMonthlySavings;
        if (monthlyContribution <= 0 && currentSavings < settings.savingsTarget) {
            // Avoid infinite loop if there's no saving progress
            return [];
        }

        let monthCount = 1;

        while (currentSavings < settings.savingsTarget) {
            const start = currentSavings;
            const end = start + monthlyContribution;

            months.push({
                month: monthCount,
                start: start,
                end: end,
                incomeTotal: data.totalMonthlyIncome,
                expensesTotal: data.totalMonthlyExpenses,
                personalSavings: settings.personalMonthlySavings,
                incomeBreakdown: incomeBreakdown,
                expenseBreakdown: expenseBreakdown
            });

            currentSavings = end;
            monthCount++;
            if (monthCount > 240) break; // Safety break after 20 years
        }
        return months;
    }, [data, settings]);

    const monthsByYear = useMemo(() => {
        return timelineData.reduce((acc, month) => {
            const year = Math.floor((month.month - 1) / 12) + 1;
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(month);
            return acc;
        }, {});
    }, [timelineData]);

    return (
        <div className="space-y-6">
            <header className="pt-8 pb-4">
                <h1 className="text-3xl font-bold text-gray-800">Financial Timeline</h1>
                <p className="text-gray-500 mt-1">Your projected path to the next down payment of <span className="font-semibold text-gray-800">{formatCurrency(settings.savingsTarget)}</span>.</p>
            </header>

            {timelineData.length > 0 ? (
                <div className="space-y-4">
                    {Object.keys(monthsByYear).map((yearStr, yearIndex) => {
                        const year = Number(yearStr);
                        const months = monthsByYear[year];
                        return (
                            <YearlySummaryCard
                                key={year}
                                year={year}
                                months={months}
                                isInitiallyExpanded={yearIndex === 0}
                            >
                                {months.map(month => {
                                    const overallIndex = timelineData.findIndex(m => m.month === month.month);
                                    const isGoalMonth = month.end >= settings.savingsTarget && (overallIndex === 0 || timelineData[overallIndex - 1].end < settings.savingsTarget);
                                    return <TimelineMonthCard key={month.month} month={month} isGoalMonth={isGoalMonth} />;
                                })}
                            </YearlySummaryCard>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200 mt-6">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <h3 className="mt-2 text-base font-medium text-gray-800">Savings Goal Met or Stalled</h3>
                    <p className="mt-1 text-sm text-gray-500">You've either reached your target of {formatCurrency(settings.savingsTarget)} or your monthly contributions are not positive.</p>
                </div>
            )}
        </div>
    );
};

export default Timeline;
