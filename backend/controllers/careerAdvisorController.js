const { compareCareerPaths } = require('./careerPathsController');
const {
    scoreFinancial,
    scoreLifestyle,
    scoreTimeIndependence,
    scoreAlignment,
    combineScores,
    generateFinalRecommendation
} = require('../utils/careerAdvisorEngine');
const pathTemplates = require('../data/pathTemplates.json');

/**
 * POST /api/career-advisor/evaluate
 * Evaluate career paths with AI-powered scoring and recommendations
 */
const evaluateCareerPaths = async (req, res) => {
    try {
        const { userProfile, paths, preferenceWeights } = req.body;

        // Validation
        if (!userProfile || !paths || !Array.isArray(paths) || paths.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Invalid input. Provide userProfile, and at least 2 paths.'
            });
        }

        // Default weights if not provided
        const weights = preferenceWeights || {
            financialWeight: 40,
            lifestyleWeight: 30,
            timeWeight: 20,
            alignmentWeight: 10
        };

        // Step 1: Run simulations for all paths
        const simulationPayload = {
            userInputs: {
                age: userProfile.age || 18,
                startingSavings: userProfile.startingSavings || 0,
                monthlyLifestyleCost: userProfile.monthlyLifestyleCost || 1200,
                riskTolerance: userProfile.riskTolerance || 'medium'
            },
            selectedPathIds: paths,
            horizonYears: 10
        };

        // Reuse existing simulation logic
        const { simulateCareerPath } = require('../utils/careerSimulation');
        const simulationResults = [];

        for (const pathId of paths) {
            const template = pathTemplates.find(t => t.id === pathId);
            if (!template) continue;

            const result = simulateCareerPath(
                template,
                simulationPayload.userInputs,
                simulationPayload.horizonYears
            );

            simulationResults.push({
                id: pathId,
                name: template.name,
                result,
                template
            });
        }

        // Step 2: Score each path across all dimensions
        const scoredPaths = simulationResults.map(({ id, name, result, template }) => {
            const financial = scoreFinancial(result);
            const lifestyle = scoreLifestyle(userProfile, template);
            const timeIndependence = scoreTimeIndependence(result);
            const alignment = scoreAlignment(userProfile, template);

            const scores = {
                financial,
                lifestyle,
                timeIndependence,
                alignment
            };

            const overallScore = combineScores(scores, weights);

            return {
                id,
                name,
                scores,
                overallScore,
                result
            };
        });

        // Step 3: Generate final recommendation
        const recommendation = generateFinalRecommendation(scoredPaths, userProfile, weights);

        // Step 4: Return response
        res.json({
            success: true,
            data: {
                recommendation,
                scoredPaths: scoredPaths.map(p => ({
                    id: p.id,
                    name: p.name,
                    scores: p.scores,
                    overallScore: p.overallScore
                }))
            }
        });

    } catch (error) {
        console.error('Career advisor evaluation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to evaluate career paths. Please try again.'
        });
    }
};

module.exports = {
    evaluateCareerPaths
};
