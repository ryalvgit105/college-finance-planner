export const DEFAULT_SETTINGS = {
    personalMonthlySavings: 600,
    savingsTarget: 25000,
    currentSavings: 15000,
    grossRentMultiplier: 10,
    annualAppreciationRate: 0.05, // 5%
};

export const INITIAL_PROPERTIES_DATA = [
    {
        id: 'prop1',
        address: '10368 Potencia Dr',
        strategy: 'houseHack',
        units: [
            { id: 'u1-1', name: 'Main Room 1 (Owner)', rent: 0, rentFullRental: 700, occupancy: 'ownerOccupied', maintenance: 0, repairs: 0, vacancy: 0 },
            { id: 'u1-2', name: 'Main Room 2', rent: 700, rentFullRental: 700, occupancy: 'occupied', maintenance: 0, repairs: 0, vacancy: 0 },
            { id: 'u1-3', name: 'Main Room 3', rent: 700, rentFullRental: 700, occupancy: 'occupied', maintenance: 0, repairs: 0, vacancy: 0 },
            { id: 'u1-4', name: 'Main Room 4', rent: 700, rentFullRental: 700, occupancy: 'occupied', maintenance: 0, repairs: 0, vacancy: 0 },
            { id: 'u1-5', name: 'Main Room 5', rent: 700, rentFullRental: 700, occupancy: 'occupied', maintenance: 0, repairs: 0, vacancy: 0 },
            { id: 'u1-6', name: 'Rear Unit (2/1)', rent: 1100, rentFullRental: 1100, occupancy: 'occupied', maintenance: 0, repairs: 0, vacancy: 0 },
        ],
        mortgagePI: 1200,
        propertyTaxes: 350,
        propertyInsurance: 120,
        opexHouseHackItems: [
            { id: 'oh1-1', name: 'Utilities', amount: 150 },
            { id: 'oh1-2', name: 'Repairs Fund', amount: 200 },
            { id: 'oh1-3', name: 'CapEx Fund', amount: 300 },
            { id: 'oh1-4', name: 'Landscaping', amount: 100 },
            { id: 'oh1-5', name: 'PM Fee (Self)', amount: 135 }
        ],
        opexFullRentalItems: [
            { id: 'of1-1', name: 'Property Management', amount: 250 },
            { id: 'of1-2', name: 'Repairs Fund', amount: 250 },
            { id: 'of1-3', name: 'CapEx Fund', amount: 350 },
            { id: 'of1-4', name: 'Landscaping', amount: 140 },
        ]
    },
    {
        id: 'prop2',
        address: '4582 Hamilton St',
        strategy: 'fullRental',
        units: [
            { id: 'u2-1', name: 'Unit A (2/1)', rent: 1400, rentFullRental: 1400, occupancy: 'occupied', maintenance: 0, repairs: 0, vacancy: 0 },
            { id: 'u2-2', name: 'Unit B (2/1)', rent: 1400, rentFullRental: 1400, occupancy: 'occupied', maintenance: 0, repairs: 0, vacancy: 0 },
        ],
        mortgagePI: 850,
        propertyTaxes: 290,
        propertyInsurance: 110,
        opexHouseHackItems: [
            { id: 'oh2-1', name: 'Utilities', amount: 100 },
            { id: 'oh2-2', name: 'Repairs/CapEx', amount: 500 },
        ],
        opexFullRentalItems: [
            { id: 'of2-1', name: 'Property Management', amount: 280 },
            { id: 'of2-2', name: 'Repairs/CapEx', amount: 470 },
        ]
    }
];

export const NEW_PROPERTY_TEMPLATE = {
    address: '123 New Investment Ave',
    strategy: 'fullRental',
    units: [
        { id: 'nt-1', name: 'Main House (3/2)', rent: 2200, rentFullRental: 2200, occupancy: 'occupied', maintenance: 0, repairs: 0, vacancy: 0 },
    ],
    mortgagePI: 1000,
    propertyTaxes: 350,
    propertyInsurance: 150,
    opexHouseHackItems: [
        { id: 'ntoh-1', name: 'Repairs/CapEx', amount: 800 },
    ],
    opexFullRentalItems: [
        { id: 'ntof-1', name: 'Property Management', amount: 220 },
        { id: 'ntof-2', name: 'Repairs/CapEx', amount: 730 },
    ]
};
