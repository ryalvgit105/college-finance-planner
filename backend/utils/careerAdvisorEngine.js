/**
 * Career Advisor Engine V3
 * Pure functional scoring and recommendation system
 * No database writes - all calculations in-memory
 */

/**
 * Score financial outcomes of a career path
 * @param {Object} pathResult - Simulation result for a path
 * @returns {number} Score 0-100
 */
const scoreFinancial = (pathResult) => {
    if (!pathResult || !pathResult.summary) return 0;

    const { netCashAtHorizon, peakDebt, totalIncome } = pathResult.summary;
    const breakEvenYear = pathResult.breakEvenYear || Infinity;

    // Factors:
    // 1. Net cash at horizon (40%)
    // 2. Peak debt (30% - lower is better)
    // 3. Break-even speed (20% - faster is better)
    // 4. Total income (10%)

    // Net cash score (normalize to 0-100, assuming $200k is excellent)
    const netCashScore = Math.min(100, Math.max(0, (netCashAtHorizon / 200000) * 100));

    // Peak debt score (inverse - less debt is better, assuming $100k is max acceptable)
    const debtScore = Math.max(0, 100 - (peakDebt / 100000) * 100);

    // Break-even score (faster is better, 10 years is baseline)
    const breakEvenScore = breakEvenYear === Infinity ? 0 : Math.max(0, 100 - (breakEvenYear / 10) * 100);

    // Total income score (normalize to 0-100, assuming $500k is excellent)
    const incomeScore = Math.min(100, (totalIncome / 500000) * 100);

    // Weighted combination
    const financialScore = (
        netCashScore * 0.4 +
        debtScore * 0.3 +
        breakEvenScore * 0.2 +
        incomeScore * 0.1
    );

    return Math.round(financialScore);
};

/**
 * Score lifestyle fit based on user profile and path template
 * @param {Object} userProfile - User's preferences and personality
 * @param {Object} pathTemplate - Career path template data
 * @returns {number} Score 0-100
 */
const scoreLifestyle = (userProfile, pathTemplate) => {
    if (!userProfile || !pathTemplate) return 50; // Neutral if missing data

    let lifestyleScore = 50; // Start neutral

    // Factor 1: Structure vs Flexibility (30%)
    // High structure paths (military, corporate) vs flexible (entrepreneurship, freelance)
    const pathStructure = pathTemplate.structure || 5; // 1-10 scale
    const userStructurePreference = userProfile.structurePreference || 5;
    const structureMatch = 100 - Math.abs(pathStructure - userStructurePreference) * 10;
    lifestyleScore += (structureMatch - 50) * 0.3;

    // Factor 2: Creativity vs Routine (25%)
    const pathCreativity = pathTemplate.creativity || 5;
    const userCreativityPreference = userProfile.creativityPreference || 5;
    const creativityMatch = 100 - Math.abs(pathCreativity - userCreativityPreference) * 10;
    lifestyleScore += (creativityMatch - 50) * 0.25;

    // Factor 3: Work-life balance (25%)
    const pathWorkLifeBalance = pathTemplate.workLifeBalance || 5;
    const userWorkLifeImportance = userProfile.workLifeImportance || 5;
    const balanceScore = pathWorkLifeBalance * userWorkLifeImportance * 2; // Scale to 0-100
    lifestyleScore += (balanceScore - 50) * 0.25;

    // Factor 4: Location flexibility (20%)
    const pathLocationFlexibility = pathTemplate.locationFlexibility || 5;
    const userLocationImportance = userProfile.locationImportance || 5;
    const locationScore = pathLocationFlexibility * userLocationImportance * 2;
    lifestyleScore += (locationScore - 50) * 0.2;

    return Math.round(Math.min(100, Math.max(0, lifestyleScore)));
};

/**
 * Score time to independence (how quickly path leads to financial independence)
 * @param {Object} pathResult - Simulation result
 * @returns {number} Score 0-100
 */
const scoreTimeIndependence = (pathResult) => {
    if (!pathResult) return 0;

    const breakEvenYear = pathResult.breakEvenYear || Infinity;
    const { yearsInSchool } = pathResult;

    // Factors:
    // 1. Break-even year (60%)
    // 2. Years in school (40% - less is faster)

    // Break-even score (0 years = 100, 10 years = 0)
    const breakEvenScore = breakEvenYear === Infinity ? 0 : Math.max(0, 100 - (breakEvenYear * 10));

    // School years score (0 years = 100, 6 years = 0)
    const schoolScore = Math.max(0, 100 - (yearsInSchool * 16.67));

    const timeScore = breakEvenScore * 0.6 + schoolScore * 0.4;

    return Math.round(timeScore);
};

/**
 * Score alignment between user skills/interests and path requirements
 * @param {Object} userProfile - User's skills and interests
 * @param {Object} pathTemplate - Career path template
 * @returns {number} Score 0-100
 */
const scoreAlignment = (userProfile, pathTemplate) => {
    if (!userProfile || !pathTemplate) return 50;

    let alignmentScore = 50;

    // Factor 1: Skill confidence match (40%)
    const userSkillConfidence = userProfile.skillConfidence || 5; // 1-10
    const pathSkillRequirement = pathTemplate.skillRequirement || 5; // 1-10
    // If user confidence >= requirement, good match
    const skillMatch = userSkillConfidence >= pathSkillRequirement ? 100 : (userSkillConfidence / pathSkillRequirement) * 100;
    alignmentScore += (skillMatch - 50) * 0.4;

    // Factor 2: Interest alignment (35%)
    const userInterest = userProfile.interestAlignment || 'neutral'; // 'high', 'medium', 'low', 'neutral'
    const pathInterestArea = pathTemplate.interestArea || 'general';

    let interestScore = 50;
    if (userInterest === 'high' && pathInterestArea === userProfile.primaryInterest) {
        interestScore = 100;
    } else if (userInterest === 'medium') {
        interestScore = 70;
    } else if (userInterest === 'low') {
        interestScore = 30;
    }
    alignmentScore += (interestScore - 50) * 0.35;

    // Factor 3: Risk tolerance match (25%)
    const userRiskTolerance = userProfile.riskTolerance || 'medium'; // 'low', 'medium', 'high'
    const pathRiskLevel = pathTemplate.riskLevel || 'medium';

    let riskMatch = 50;
    if (userRiskTolerance === pathRiskLevel) {
        riskMatch = 100;
    } else if (
        (userRiskTolerance === 'medium' && (pathRiskLevel === 'low' || pathRiskLevel === 'high')) ||
        (pathRiskLevel === 'medium' && (userRiskTolerance === 'low' || userRiskTolerance === 'high'))
    ) {
        riskMatch = 70;
    } else {
        riskMatch = 30;
    }
    alignmentScore += (riskMatch - 50) * 0.25;

    return Math.round(Math.min(100, Math.max(0, alignmentScore)));
};

/**
 * Combine individual scores with user-defined weights
 * @param {Object} scores - Individual dimension scores
 * @param {Object} weights - User preference weights (must sum to 100)
 * @returns {number} Combined score 0-100
 */
const combineScores = (scores, weights) => {
    const {
        financial = 0,
        lifestyle = 0,
        timeIndependence = 0,
        alignment = 0
    } = scores;

    const {
        financialWeight = 40,
        lifestyleWeight = 30,
        timeWeight = 20,
        alignmentWeight = 10
    } = weights;

    // Normalize weights to sum to 100
    const totalWeight = financialWeight + lifestyleWeight + timeWeight + alignmentWeight;
    const normalizedWeights = {
        financial: financialWeight / totalWeight,
        lifestyle: lifestyleWeight / totalWeight,
        time: timeWeight / totalWeight,
        alignment: alignmentWeight / totalWeight
    };

    const combinedScore = (
        financial * normalizedWeights.financial +
        lifestyle * normalizedWeights.lifestyle +
        timeIndependence * normalizedWeights.time +
        alignment * normalizedWeights.alignment
    );

    return Math.round(combinedScore);
};

/**
 * Generate final recommendation with reasoning
 * @param {Array} rankedPaths - Paths with scores
 * @param {Object} userProfile - User profile
 * @param {Object} weights - Preference weights
 * @returns {Object} Recommendation object
 */
const generateFinalRecommendation = (rankedPaths, userProfile, weights) => {
    if (!rankedPaths || rankedPaths.length === 0) {
        return {
            bestOverall: null,
            bestFinancial: null,
            bestLifestyle: null,
            bestLowRisk: null,
            reasoning: 'No paths available for recommendation.',
            tradeoffs: []
        };
    }

    // Sort by overall score
    const sortedByOverall = [...rankedPaths].sort((a, b) => b.overallScore - a.overallScore);
    const bestOverall = sortedByOverall[0];

    // Find best in each category
    const sortedByFinancial = [...rankedPaths].sort((a, b) => b.scores.financial - a.scores.financial);
    const bestFinancial = sortedByFinancial[0];

    const sortedByLifestyle = [...rankedPaths].sort((a, b) => b.scores.lifestyle - a.scores.lifestyle);
    const bestLifestyle = sortedByLifestyle[0];

    // Best low-risk: highest alignment + lifestyle, lower financial weight
    const lowRiskScores = rankedPaths.map(path => ({
        ...path,
        lowRiskScore: (path.scores.alignment * 0.4 + path.scores.lifestyle * 0.4 + path.scores.financial * 0.2)
    }));
    const sortedByLowRisk = lowRiskScores.sort((a, b) => b.lowRiskScore - a.lowRiskScore);
    const bestLowRisk = sortedByLowRisk[0];

    // Generate reasoning
    const reasoning = generateReasoning(bestOverall, userProfile, weights);

    // Generate tradeoffs
    const tradeoffs = generateTradeoffs(rankedPaths, bestOverall);

    return {
        bestOverall: {
            id: bestOverall.id,
            name: bestOverall.name,
            overallScore: bestOverall.overallScore,
            scores: bestOverall.scores
        },
        bestFinancial: {
            id: bestFinancial.id,
            name: bestFinancial.name,
            score: bestFinancial.scores.financial
        },
        bestLifestyle: {
            id: bestLifestyle.id,
            name: bestLifestyle.name,
            score: bestLifestyle.scores.lifestyle
        },
        bestLowRisk: {
            id: bestLowRisk.id,
            name: bestLowRisk.name,
            score: Math.round(bestLowRisk.lowRiskScore)
        },
        reasoning,
        tradeoffs,
        allRanked: sortedByOverall.map(p => ({
            id: p.id,
            name: p.name,
            overallScore: p.overallScore,
            scores: p.scores
        }))
    };
};

/**
 * Generate human-readable reasoning for recommendation
 * @param {Object} bestPath - Best overall path
 * @param {Object} userProfile - User profile
 * @param {Object} weights - Preference weights
 * @returns {string} Reasoning text
 */
const generateReasoning = (bestPath, userProfile, weights) => {
    if (!bestPath) return '';

    const { name, scores, overallScore } = bestPath;
    const { financial, lifestyle, timeIndependence, alignment } = scores;

    let reasoning = `Based on your profile and preferences, **${name}** is your best overall match with a score of ${overallScore}/100.\n\n`;

    // Identify strengths
    const strengths = [];
    if (financial >= 70) strengths.push(`strong financial outcomes (${financial}/100)`);
    if (lifestyle >= 70) strengths.push(`excellent lifestyle fit (${lifestyle}/100)`);
    if (timeIndependence >= 70) strengths.push(`fast path to independence (${timeIndependence}/100)`);
    if (alignment >= 70) strengths.push(`great alignment with your skills and interests (${alignment}/100)`);

    if (strengths.length > 0) {
        reasoning += `**Key Strengths**: This path offers ${strengths.join(', ')}.\n\n`;
    }

    // Identify considerations
    const considerations = [];
    if (financial < 50) considerations.push(`moderate financial returns (${financial}/100)`);
    if (lifestyle < 50) considerations.push(`lifestyle adjustments may be needed (${lifestyle}/100)`);
    if (timeIndependence < 50) considerations.push(`longer time to financial independence (${timeIndependence}/100)`);
    if (alignment < 50) considerations.push(`some skill development required (${alignment}/100)`);

    if (considerations.length > 0) {
        reasoning += `**Considerations**: ${considerations.join(', ')}.\n\n`;
    }

    // Weight-based insights
    const topWeight = Object.entries(weights).sort((a, b) => b[1] - a[1])[0];
    if (topWeight[0] === 'financialWeight' && financial >= 70) {
        reasoning += `Since financial outcomes are your top priority, this path delivers strong returns.`;
    } else if (topWeight[0] === 'lifestyleWeight' && lifestyle >= 70) {
        reasoning += `Since lifestyle fit is your top priority, this path aligns well with your preferences.`;
    } else if (topWeight[0] === 'timeWeight' && timeIndependence >= 70) {
        reasoning += `Since quick independence is your top priority, this path gets you there faster.`;
    }

    return reasoning;
};

/**
 * Generate tradeoff analysis
 * @param {Array} allPaths - All ranked paths
 * @param {Object} bestPath - Best overall path
 * @returns {Array} Tradeoff insights
 */
const generateTradeoffs = (allPaths, bestPath) => {
    const tradeoffs = [];

    // Find paths that excel in specific dimensions
    allPaths.forEach(path => {
        if (path.id === bestPath.id) return; // Skip best overall

        const { name, scores } = path;
        const { financial, lifestyle, timeIndependence, alignment } = scores;

        // Check if this path significantly outperforms best overall in any dimension
        if (financial > bestPath.scores.financial + 15) {
            tradeoffs.push({
                path: name,
                dimension: 'financial',
                insight: `${name} offers ${financial - bestPath.scores.financial} points better financial outcomes, but scores lower overall.`
            });
        }

        if (lifestyle > bestPath.scores.lifestyle + 15) {
            tradeoffs.push({
                path: name,
                dimension: 'lifestyle',
                insight: `${name} provides ${lifestyle - bestPath.scores.lifestyle} points better lifestyle fit, but may have other tradeoffs.`
            });
        }

        if (timeIndependence > bestPath.scores.timeIndependence + 15) {
            tradeoffs.push({
                path: name,
                dimension: 'time',
                insight: `${name} gets you to independence ${timeIndependence - bestPath.scores.timeIndependence} points faster, worth considering if speed is critical.`
            });
        }
    });

    return tradeoffs.slice(0, 3); // Return top 3 tradeoffs
};

module.exports = {
    scoreFinancial,
    scoreLifestyle,
    scoreTimeIndependence,
    scoreAlignment,
    combineScores,
    generateFinalRecommendation
};
