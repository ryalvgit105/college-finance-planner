const calculateProjections = (investments) => {
    const projectionYears = [1, 5, 10, 20, 30];
    const results = {
        totalPortfolio: {},
        byInvestment: []
    };

    // Initialize totals
    projectionYears.forEach(year => {
        results.totalPortfolio[year] = 0;
    });

    investments.forEach(inv => {
        const r = inv.expectedAnnualReturn || 0;
        const PV = inv.currentValue || 0;
        const PMT = inv.monthlyContribution || 0;

        const projections = {};

        projectionYears.forEach(y => {
            // FV = PV * (1 + r/12)^(12*y) + PMT * [((1 + r/12)^(12*y) - 1) / (r/12)]
            const n = 12 * y;
            const ratePerPeriod = r / 12;

            let FV = 0;
            if (ratePerPeriod === 0) {
                FV = PV + (PMT * n);
            } else {
                const compoundFactor = Math.pow(1 + ratePerPeriod, n);
                FV = (PV * compoundFactor) + (PMT * ((compoundFactor - 1) / ratePerPeriod));
            }

            projections[y] = FV;
            results.totalPortfolio[y] += FV;
        });

        results.byInvestment.push({
            ticker: inv.ticker || inv.assetType,
            projections
        });
    });

    return results;
};

module.exports = { calculateProjections };
