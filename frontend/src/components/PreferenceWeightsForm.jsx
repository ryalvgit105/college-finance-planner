import React, { useState } from 'react';

const PreferenceWeightsForm = ({ onChange }) => {
    const [weights, setWeights] = useState({
        financialWeight: 40,
        lifestyleWeight: 30,
        independenceWeight: 30
    });

    const MIN_WEIGHT = 10;

    const updateWeight = (key, newValue) => {
        // Ensure minimum weight
        const clampedValue = Math.max(MIN_WEIGHT, Math.min(100 - (MIN_WEIGHT * 2), newValue));

        // Calculate remaining weight to distribute
        const otherKeys = Object.keys(weights).filter(k => k !== key);
        const remainingWeight = 100 - clampedValue;

        // Get current weights of other sliders
        const otherWeights = otherKeys.map(k => weights[k]);
        const otherTotal = otherWeights.reduce((sum, w) => sum + w, 0);

        // Distribute remaining weight proportionally
        const newWeights = { [key]: clampedValue };

        if (otherTotal > 0) {
            // Proportional distribution
            otherKeys.forEach((k, idx) => {
                const proportion = weights[k] / otherTotal;
                let distributedWeight = Math.round(remainingWeight * proportion);

                // Ensure minimum weight
                distributedWeight = Math.max(MIN_WEIGHT, distributedWeight);
                newWeights[k] = distributedWeight;
            });
        } else {
            // Equal distribution if others are zero
            const equalWeight = Math.floor(remainingWeight / otherKeys.length);
            otherKeys.forEach(k => {
                newWeights[k] = equalWeight;
            });
        }

        // Adjust for rounding errors to ensure sum = 100
        const currentSum = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
        if (currentSum !== 100) {
            const diff = 100 - currentSum;
            // Add difference to the largest weight (that's not the one being changed)
            const largestOtherKey = otherKeys.reduce((max, k) =>
                newWeights[k] > newWeights[max] ? k : max
                , otherKeys[0]);
            newWeights[largestOtherKey] += diff;
        }

        setWeights(newWeights);
        if (onChange) {
            onChange(newWeights);
        }
    };

    const resetToDefaults = () => {
        const defaults = {
            financialWeight: 40,
            lifestyleWeight: 30,
            independenceWeight: 30
        };
        setWeights(defaults);
        if (onChange) {
            onChange(defaults);
        }
    };

    const total = weights.financialWeight + weights.lifestyleWeight + weights.independenceWeight;

    return (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Adjust Your Priorities</h3>
                    <p className="text-sm text-gray-600">Weights automatically balance to 100%</p>
                </div>
                <button
                    onClick={resetToDefaults}
                    className="text-sm text-[#C6AA76] hover:text-[#D4B483] font-medium"
                >
                    Reset to Defaults
                </button>
            </div>

            {/* Financial Outcome Weight */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                        Financial Outcome
                    </label>
                    <span className="text-lg font-bold text-[#C6AA76]">{weights.financialWeight}%</span>
                </div>
                <input
                    type="range"
                    min={MIN_WEIGHT}
                    max={100 - (MIN_WEIGHT * 2)}
                    value={weights.financialWeight}
                    onChange={(e) => updateWeight('financialWeight', parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, #C6AA76 0%, #C6AA76 ${weights.financialWeight}%, #e5e7eb ${weights.financialWeight}%, #e5e7eb 100%)`
                    }}
                />
                <p className="text-xs text-gray-500 mt-1">
                    How much do earnings, debt, and net worth matter?
                </p>
            </div>

            {/* Lifestyle Fit Weight */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                        Lifestyle Fit
                    </label>
                    <span className="text-lg font-bold text-[#C6AA76]">{weights.lifestyleWeight}%</span>
                </div>
                <input
                    type="range"
                    min={MIN_WEIGHT}
                    max={100 - (MIN_WEIGHT * 2)}
                    value={weights.lifestyleWeight}
                    onChange={(e) => updateWeight('lifestyleWeight', parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, #C6AA76 0%, #C6AA76 ${weights.lifestyleWeight}%, #e5e7eb ${weights.lifestyleWeight}%, #e5e7eb 100%)`
                    }}
                />
                <p className="text-xs text-gray-500 mt-1">
                    How much do work-life balance and flexibility matter?
                </p>
            </div>

            {/* Time to Independence Weight */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                        Time to Independence
                    </label>
                    <span className="text-lg font-bold text-[#C6AA76]">{weights.independenceWeight}%</span>
                </div>
                <input
                    type="range"
                    min={MIN_WEIGHT}
                    max={100 - (MIN_WEIGHT * 2)}
                    value={weights.independenceWeight}
                    onChange={(e) => updateWeight('independenceWeight', parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, #C6AA76 0%, #C6AA76 ${weights.independenceWeight}%, #e5e7eb ${weights.independenceWeight}%, #e5e7eb 100%)`
                    }}
                />
                <p className="text-xs text-gray-500 mt-1">
                    How important is getting to financial freedom quickly?
                </p>
            </div>

            {/* Total Display */}
            <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Total</span>
                    <span className={`text-xl font-bold ${total === 100 ? 'text-green-600' : 'text-red-600'}`}>
                        {total}%
                    </span>
                </div>
                {total !== 100 && (
                    <p className="text-xs text-red-600 mt-1">
                        Weights must sum to 100%. Adjusting...
                    </p>
                )}
            </div>
        </div>
    );
};

export default PreferenceWeightsForm;
