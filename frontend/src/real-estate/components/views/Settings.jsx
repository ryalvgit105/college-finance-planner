import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import InputField from '../common/InputField';

const Settings = () => {
    const { settings, updateSettings } = useSettings();
    const [errors, setErrors] = useState({});

    const validateAndUpate = (field, value) => {
        let error = '';
        if (isNaN(value)) {
            error = 'Must be a valid number.';
        } else if (value < 0) {
            error = 'Cannot be negative.';
        }

        setErrors(prev => ({ ...prev, [field]: error }));

        if (!error) {
            updateSettings({ [field]: value });
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        validateAndUpate(id, parseFloat(value));
    };

    return (
        <div className="p-4 space-y-4">
            <header className="pt-4 pb-2">
                <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-500">Customize your financial plan and assumptions.</p>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
                <section>
                    <h2 className="text-lg font-semibold border-b pb-2 mb-4">Savings Goals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            id="currentSavings"
                            label="Current Savings"
                            value={String(settings.currentSavings)}
                            onChange={handleChange}
                            type="number"
                            prefix="$"
                            description="The amount you currently have saved for a down payment."
                            error={errors.currentSavings}
                        />
                        <InputField
                            id="savingsTarget"
                            label="Savings Target"
                            value={String(settings.savingsTarget)}
                            onChange={handleChange}
                            type="number"
                            prefix="$"
                            description="Your goal for the next property's down payment."
                            error={errors.savingsTarget}
                        />
                        <InputField
                            id="personalMonthlySavings"
                            label="Personal Monthly Savings"
                            value={String(settings.personalMonthlySavings)}
                            onChange={handleChange}
                            type="number"
                            prefix="$"
                            description="How much you personally save each month, outside of rental income."
                            error={errors.personalMonthlySavings}
                        />
                    </div>
                </section>

                <section>
                    <h2 className="text-lg font-semibold border-b pb-2 mb-4">Market Assumptions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            id="grossRentMultiplier"
                            label="Gross Rent Multiplier (GRM)"
                            value={String(settings.grossRentMultiplier)}
                            onChange={handleChange}
                            type="number"
                            description="Used for property valuation. (e.g., 10)"
                            error={errors.grossRentMultiplier}
                        />
                        <InputField
                            id="annualAppreciationRate"
                            label="Annual Appreciation Rate"
                            value={String(settings.annualAppreciationRate)}
                            onChange={handleChange}
                            type="number"
                            step="0.01"
                            suffix="%"
                            description="Estimated annual property value growth (e.g., 0.05 for 5%)."
                            error={errors.annualAppreciationRate}
                        />
                    </div>
                </section>
            </div>
            <p className="text-center text-xs text-gray-500 pt-4">Your settings are saved automatically.</p>
        </div>
    );
};

export default Settings;
