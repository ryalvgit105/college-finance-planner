import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { INITIAL_PROPERTIES_DATA, NEW_PROPERTY_TEMPLATE } from '../data';
import { useSettings } from '../contexts/SettingsContext';

const getUnitRent = (unit, strategy) => {
    if (unit.occupancy === 'vacant' || unit.occupancy === 'ownerOccupied') {
        return 0;
    }
    return strategy === 'houseHack' ? unit.rent : unit.rentFullRental;
};

export const useFinancialData = () => {
    const { settings } = useSettings();
    const [properties, setProperties] = useState(() => {
        const saved = localStorage.getItem('realEstateProperties');
        return saved ? JSON.parse(saved) : INITIAL_PROPERTIES_DATA;
    });

    useEffect(() => {
        localStorage.setItem('realEstateProperties', JSON.stringify(properties));
    }, [properties]);

    const addProperty = () => {
        const newProperty = {
            ...NEW_PROPERTY_TEMPLATE,
            id: uuidv4(),
            units: NEW_PROPERTY_TEMPLATE.units.map(u => ({ ...u, id: uuidv4() })),
            opexHouseHackItems: NEW_PROPERTY_TEMPLATE.opexHouseHackItems.map(i => ({ ...i, id: uuidv4() })),
            opexFullRentalItems: NEW_PROPERTY_TEMPLATE.opexFullRentalItems.map(i => ({ ...i, id: uuidv4() })),
        };
        setProperties(prev => [...prev, newProperty]);
    };

    const deleteProperty = (propertyId) => {
        setProperties(prev => prev.filter(p => p.id !== propertyId));
    };

    const updateProperty = (updatedProperty) => {
        setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
    };

    const financials = useMemo(() => {
        let totalMonthlyCashFlow = 0;
        let totalPortfolioValue = 0;
        let totalMonthlyIncome = 0;
        let totalMonthlyExpenses = 0;
        let totalUnits = 0;
        let occupiedUnits = 0;

        const cashFlowByProperty = properties.map(property => {
            // Income
            const income = property.units.reduce((acc, unit) => acc + getUnitRent(unit, property.strategy), 0);

            // Expenses
            const opexItems = property.strategy === 'houseHack' ? property.opexHouseHackItems : property.opexFullRentalItems;
            const opex = opexItems.reduce((acc, item) => acc + item.amount, 0);
            const piti = property.mortgagePI + property.propertyTaxes + property.propertyInsurance;
            const totalUnitCosts = property.units.reduce((acc, unit) => acc + unit.maintenance + unit.repairs + unit.vacancy, 0);
            const expenses = opex + piti + totalUnitCosts;

            const cf = income - expenses;

            // Value Calculation
            const grossAnnualRent = property.units.reduce((acc, unit) => acc + unit.rentFullRental, 0) * 12;
            const estimatedValue = grossAnnualRent * settings.grossRentMultiplier;

            // Occupancy
            property.units.forEach(unit => {
                totalUnits++;
                if (unit.occupancy === 'occupied') occupiedUnits++;
            });

            // Aggregates
            totalMonthlyCashFlow += cf;
            totalPortfolioValue += estimatedValue;
            totalMonthlyIncome += income;
            totalMonthlyExpenses += expenses;

            return {
                name: property.address,
                cashFlow: cf
            };
        });

        const portfolioOccupancy = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

        // Expense totals for the pie chart
        const totalPITI = properties.reduce((acc, p) => acc + p.mortgagePI + p.propertyTaxes + p.propertyInsurance, 0);
        const totalOpex = properties.reduce((acc, p) => {
            const items = p.strategy === 'houseHack' ? p.opexHouseHackItems : p.opexFullRentalItems;
            return acc + items.reduce((sum, item) => sum + item.amount, 0);
        }, 0);
        const totalUnitCosts = properties.reduce((acc, p) => acc + p.units.reduce((sum, u) => sum + u.maintenance + u.repairs + u.vacancy, 0), 0);


        return {
            properties,
            totalMonthlyCashFlow,
            totalPortfolioValue,
            cashFlowByProperty,
            totalMonthlyIncome,
            totalMonthlyExpenses,
            portfolioOccupancy,
            totalPITI,
            totalOpex,
            totalUnitCosts
        };
    }, [properties, settings.grossRentMultiplier]);

    return {
        ...financials,
        addProperty,
        deleteProperty,
        updateProperty
    };
};
