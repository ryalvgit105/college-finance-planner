import React, { useMemo, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import ValueHistoryChart from './charts/ValueHistoryChart';
import IncomeBreakdownPieChart from './charts/IncomeBreakdownPieChart';
import ExpenseBreakdownChart from './charts/ExpenseBreakdownChart';

const formatCurrency = (amount, options = {}) => {
    const value = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.abs(amount));

    const sign = options.sign ? (amount >= 0 ? '+' : '-') : (amount < 0 ? '-' : '');

    if (options.color) {
        const colorClass = amount >= 0 ? 'text-green-500' : 'text-red-500'; // secondary to green, danger to red
        return <span className={colorClass}>{sign}{value}</span>;
    }

    return `${sign}${value}`;
};

const getUnitRent = (unit, strategy) => {
    if (unit.occupancy === 'vacant' || unit.occupancy === 'ownerOccupied') {
        return 0;
    }
    return strategy === 'houseHack' ? unit.rent : unit.rentFullRental;
};

const PropertyCard = ({ property, onEdit, onDelete, onUpdateProperty }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { settings } = useSettings();

    const { cashFlow, strategyName, estimatedValue, valueHistory, totalHackRent, totalFullRental, currentOpex, totalUnitCosts, piti } = useMemo(() => {
        let name = '';

        const grossRent = property.units.reduce((acc, unit) => acc + getUnitRent(unit, property.strategy), 0);
        const totalUnitCosts = property.units.reduce((acc, unit) => acc + unit.maintenance + unit.repairs + unit.vacancy, 0);

        const opexItems = property.strategy === 'houseHack' ? property.opexHouseHackItems : property.opexFullRentalItems;
        const opex = opexItems.reduce((acc, item) => acc + item.amount, 0);

        const currentPiti = property.mortgagePI + property.propertyTaxes + property.propertyInsurance;

        name = property.strategy === 'houseHack' ? 'Live-in Hack' : 'Full Rental';

        const cf = grossRent - opex - currentPiti - totalUnitCosts;

        const grossAnnualRent = property.units.reduce((acc, unit) => acc + unit.rentFullRental, 0) * 12;
        const currentEstValue = grossAnnualRent * settings.grossRentMultiplier;

        const history = [];
        let previousValue = currentEstValue;
        for (let i = 0; i < 5; i++) {
            history.unshift({ year: `Y-${i}`, value: previousValue });
            previousValue = previousValue / (1 + settings.annualAppreciationRate);
        }

        const totalHackRent = property.units.reduce((acc, unit) => acc + unit.rent, 0);
        const totalFullRental = property.units.reduce((acc, unit) => acc + unit.rentFullRental, 0);

        return {
            cashFlow: cf,
            strategyName: name,
            estimatedValue: currentEstValue,
            valueHistory: history,
            totalHackRent,
            totalFullRental,
            currentOpex: opex,
            totalUnitCosts,
            piti: currentPiti
        };
    }, [property, settings.grossRentMultiplier, settings.annualAppreciationRate]);

    const handleDeleteClick = () => {
        if (window.confirm(`Are you sure you want to delete ${property.address}?`)) {
            onDelete();
        }
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
            <div className="p-5">
                {/* --- HEADER --- */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="font-bold text-lg text-gray-800">{property.address}</h2>
                        <p className="font-bold text-2xl">{formatCurrency(cashFlow, { sign: true, color: true })}<span className="text-base font-medium text-gray-500">/mo</span></p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${property.strategy === 'houseHack' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {strategyName}
                    </span>
                </div>
            </div>

            {/* --- EXPANDABLE DETAILS SECTION --- */}
            <div
                className={`transition-all duration-300 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="px-5 pb-5 space-y-6 text-sm">

                        {/* Financial Breakdown */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-base text-gray-800 border-b pb-2">Financial Breakdown</h3>
                            <div className="text-sm space-y-1 pt-2">
                                <div className="flex justify-between font-semibold">
                                    <span>Total PITI</span>
                                    <span>{formatCurrency(piti)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 pl-2">
                                    <span>Mortgage (P&I)</span>
                                    <span>{formatCurrency(property.mortgagePI)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 pl-2">
                                    <span>Property Taxes</span>
                                    <span>{formatCurrency(property.propertyTaxes)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 pl-2">
                                    <span>Insurance</span>
                                    <span>{formatCurrency(property.propertyInsurance)}</span>
                                </div>
                            </div>

                            <div className="text-sm space-y-1 pt-2">
                                <div className="flex justify-between font-semibold">
                                    <span>Operating Expenses ({strategyName})</span>
                                    <span>{formatCurrency(currentOpex)}</span>
                                </div>
                                {(property.strategy === 'houseHack' ? property.opexHouseHackItems : property.opexFullRentalItems).map(item => (
                                    <div key={item.id} className="flex justify-between text-gray-500 pl-2">
                                        <span>{item.name}</span>
                                        <span>{formatCurrency(item.amount)}</span>
                                    </div>
                                ))}
                            </div>

                            {totalUnitCosts > 0 && (
                                <div className="flex justify-between font-semibold pt-2">
                                    <span>Total Unit Costs</span>
                                    <span>{formatCurrency(totalUnitCosts)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center border-t mt-2 pt-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-gray-800">Estimated Value</span>
                                    <div className="group relative">
                                        <svg className="w-4 h-4 text-gray-400 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <div className="absolute bottom-full mb-2 w-60 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                            Calculated via Gross Rent Multiplier: (Full Monthly Rent × 12) × {settings.grossRentMultiplier}
                                        </div>
                                    </div>
                                </div>
                                <span className="font-semibold text-gray-800">{formatCurrency(estimatedValue)}</span>
                            </div>
                        </div>

                        {/* Units Table */}
                        <div>
                            <h3 className="font-semibold text-base text-gray-800 border-b pb-2">Units</h3>
                            <div className="mt-2 space-y-1">
                                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-text-secondary px-2">
                                    <span className="col-span-5">Name</span>
                                    <span className="col-span-3">Status</span>
                                    <span className="text-right col-span-2">Hack Rent</span>
                                    <span className="text-right col-span-2">Full Rent</span>
                                </div>
                                {property.units.map(unit => (
                                    <div key={unit.id} className="grid grid-cols-12 gap-2 items-center text-sm p-2 rounded-md even:bg-light">
                                        <span className="col-span-5 truncate font-medium text-gray-800">{unit.name}</span>
                                        <span className="col-span-3 text-gray-500">{unit.occupancy}</span>
                                        <span className="text-right col-span-2 text-gray-500">{formatCurrency(unit.rent)}</span>
                                        <span className="text-right col-span-2 text-gray-500">{formatCurrency(unit.rentFullRental)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                            <ValueHistoryChart data={valueHistory} />
                            <ExpenseBreakdownChart
                                piti={piti}
                                opex={currentOpex}
                                unitCosts={totalUnitCosts}
                            />
                        </div>
                        <IncomeBreakdownPieChart
                            hackRentTotal={totalHackRent}
                            fullRentalTotal={totalFullRental}
                        />

                    </div>
                </div>
            </div>

            {/* --- FOOTER --- */}
            <div className="border-t border-gray-200 bg-gray-50 rounded-b-xl px-5 py-3 flex justify-between items-center">
                <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1 text-sm text-blue-500 font-semibold py-2 px-3 rounded-lg transition-colors duration-200 hover:bg-blue-100" aria-label="View Details">
                    <span>{isExpanded ? 'Hide' : 'View'} Details</span>
                    <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div className="flex items-center space-x-1">
                    <button onClick={onEdit} className="text-gray-500 hover:text-blue-500 p-2 rounded-full transition-colors duration-200" aria-label="Edit Property">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
                    </button>
                    <button onClick={handleDeleteClick} className="text-gray-500 hover:text-red-500 p-2 rounded-full transition-colors duration-200" aria-label="Delete Property">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
