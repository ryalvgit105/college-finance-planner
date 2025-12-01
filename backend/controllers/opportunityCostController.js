const PathTemplate = require('../models/PathTemplate');
const Profile = require('../models/Profile');
const Tax = require('../models/Tax');
const Benefits = require('../models/Benefits');
const { calculateNetIncome } = require('../utils/incomeCalculator');

// @desc    Compare financial paths
// @route   POST /api/opportunity/compare
// @access  Public
exports.comparePaths = async (req, res) => {
    try {
        const { profileId, selectedTemplates, projectionYears = 10 } = req.body;

        if (!profileId || !selectedTemplates || selectedTemplates.length === 0) {
            return res.status(400).json({ success: false, message: 'Profile ID and selected templates are required' });
        }

        // 1. Load Profile Context
        const [profile, taxSettings] = await Promise.all([
            Profile.findById(profileId),
            Tax.findOne({ profileId })
        ]);

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found' });
        }

        // 2. Load Templates
        const templates = await PathTemplate.find({
            $or: [
                { _id: { $in: selectedTemplates } },
                { templateName: { $in: selectedTemplates } }
            ]
        });

        const results = [];

        // 3. Compute Projections for each Path
        for (const template of templates) {
            let currentSalary = template.startingSalary;
            let cumulativeEarnings = 0;
            let cumulativeTaxes = 0;
            let cumulativeNetWorth = 0 - template.educationCost; // Start with debt/cost

            const yearlyData = [];

            for (let year = 1; year <= projectionYears; year++) {
                let grossIncome = 0;
                let netIncome = 0;
                let taxPaid = 0;
                let benefitsValue = 0;

                // A. Education/Training Period (Income Gap)
                if (year <= template.durationYears) {
                    // In school/training
                    grossIncome = 0;
                    cumulativeNetWorth -= (template.defaultExpenses || 30000);
                } else {
                    // Earning period
                    const yearsExperience = year - template.durationYears;
                    if (yearsExperience > 1) {
                        currentSalary = currentSalary * (1 + template.salaryGrowthRate);
                    }
                    grossIncome = currentSalary;

                    // B. Calculate Net Income & Taxes
                    const pathBenefits = {
                        healthInsurance: template.defaultBenefits?.healthInsurance || 0,
                        retirementContribution: template.defaultBenefits?.retirementContribution || 0,
                        employerMatch: template.defaultBenefits?.employerMatch || 0,
                        militaryHousingAllowance: template.defaultBenefits?.militaryHousingAllowance || 0,
                        militarySubsistenceAllowance: template.defaultBenefits?.militarySubsistenceAllowance || 0,
                        customBenefits: []
                    };

                    const incomeDetails = calculateNetIncome(grossIncome, taxSettings, pathBenefits);

                    let realNetIncome = incomeDetails.netAnnualIncome;

                    if (template.militarySpecific) {
                        realNetIncome += (pathBenefits.militaryHousingAllowance || 0) + (pathBenefits.militarySubsistenceAllowance || 0);
                    }

                    realNetIncome -= (pathBenefits.healthInsurance || 0);
                    realNetIncome -= (pathBenefits.retirementContribution || 0);

                    netIncome = realNetIncome;
                    taxPaid = incomeDetails.totalTax;
                    benefitsValue = incomeDetails.totalBenefits;

                    // Update Net Worth
                    const livingExpenses = template.defaultExpenses || 30000;
                    const savings = netIncome - livingExpenses;
                    const employerMatch = template.defaultBenefits?.employerMatch || 0;

                    cumulativeNetWorth += savings + employerMatch;
                }

                // C. Update Cumulatives
                cumulativeEarnings += grossIncome;
                cumulativeTaxes += taxPaid;

                yearlyData.push({
                    year,
                    grossIncome,
                    netIncome,
                    taxPaid,
                    cumulativeNetWorth,
                    cumulativeEarnings
                });
            }

            results.push({
                templateName: template.templateName,
                totalEarnings: cumulativeEarnings,
                totalTaxes: cumulativeTaxes,
                finalNetWorth: cumulativeNetWorth,
                yearlyData
            });
        }

        // 4. Compare & Find Break-even & Long-term Difference
        let breakEvenYear = null;
        let longTermDifference = 0;

        if (results.length >= 2) {
            const sortedByNetWorth = [...results].sort((a, b) => b.finalNetWorth - a.finalNetWorth);
            const best = sortedByNetWorth[0];
            const worst = sortedByNetWorth[sortedByNetWorth.length - 1];

            longTermDifference = best.finalNetWorth - worst.finalNetWorth;

            const p1 = results[0];
            const p2 = results[1];

            for (let i = 0; i < projectionYears; i++) {
                if (p1.yearlyData[i].cumulativeNetWorth < p2.yearlyData[i].cumulativeNetWorth) {
                    if (i > 0 && p1.yearlyData[i - 1].cumulativeNetWorth > p2.yearlyData[i - 1].cumulativeNetWorth) {
                        breakEvenYear = p1.yearlyData[i].year;
                        break;
                    }
                } else {
                    if (i > 0 && p1.yearlyData[i - 1].cumulativeNetWorth < p2.yearlyData[i - 1].cumulativeNetWorth) {
                        breakEvenYear = p1.yearlyData[i].year;
                        break;
                    }
                }
            }
        }

        res.status(200).json({
            success: true,
            data: {
                results,
                breakEvenYear,
                longTermDifference,
                projectionYears
            }
        });

    } catch (error) {
        console.error('Error comparing paths:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get all available templates
// @route   GET /api/opportunity/templates
// @access  Public
exports.getTemplates = async (req, res) => {
    try {
        const templates = await PathTemplate.find();
        res.status(200).json({ success: true, data: templates });
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
