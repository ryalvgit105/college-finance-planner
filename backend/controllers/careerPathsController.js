const pathTemplates = require('../data/pathTemplates.json');
const { simulateCareerPath } = require('../utils/careerSimulation');

exports.compareCareerPaths = (req, res) => {
    try {
        const { userInputs, selectedPathIds, horizonYears = 10 } = req.body;

        // 1. Validate body
        if (!userInputs || !selectedPathIds || !Array.isArray(selectedPathIds)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Required: userInputs (object), selectedPathIds (array)'
            });
        }

        // 2. Process each selected path
        const results = selectedPathIds.map(pathId => {
            const template = pathTemplates.find(t => t.id === pathId);

            if (!template) {
                console.warn(`Path template not found for ID: ${pathId}`);
                return null;
            }

            // 3. Call simulateCareerPath
            const simulation = simulateCareerPath(userInputs, template, horizonYears);

            // 4. Build normalized response
            return {
                id: template.id,
                name: template.name,
                series: {
                    yearlyIncome: simulation.yearlyIncome,
                    cumulativeNetCash: simulation.cumulativeNetCash,
                    yearlyDebt: simulation.yearlyDebt
                },
                summary: simulation.summary,
                breakEvenYear: simulation.breakEvenYear
            };
        }).filter(Boolean); // Remove nulls if any path not found

        res.status(200).json({
            success: true,
            data: {
                paths: results,
                horizonYears
            }
        });

    } catch (error) {
        console.error('Error in compareCareerPaths:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while comparing career paths',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
