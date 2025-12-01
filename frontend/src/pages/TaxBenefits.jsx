import React, { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { getTax, updateTax, getBenefits, updateBenefits } from '../api/financeApi';

const TaxBenefits = () => {
    const { currentProfile } = useProfile();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const [taxSettings, setTaxSettings] = useState({
        filingStatus: 'Single',
        federalBracket: 0.22,
        stateBracket: 0.05,
        standardDeduction: 13850,
        additionalDeductions: 0
    });

    const [benefits, setBenefits] = useState({
        healthInsurance: 0,
        retirementContribution: 0,
        employerMatch: 0,
        militaryHousingAllowance: 0,
        militarySubsistenceAllowance: 0
    });

    useEffect(() => {
        if (currentProfile) {
            fetchData();
        }
    }, [currentProfile]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [taxData, benefitsData] = await Promise.all([
                getTax(currentProfile._id),
                getBenefits(currentProfile._id)
            ]);

            if (taxData.success) setTaxSettings(taxData.data);
            if (benefitsData.success) setBenefits(benefitsData.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleTaxChange = (e) => {
        const { name, value } = e.target;
        setTaxSettings(prev => ({
            ...prev,
            [name]: name === 'filingStatus' ? value : parseFloat(value) || 0
        }));
    };

    const handleBenefitsChange = (e) => {
        const { name, value } = e.target;
        setBenefits(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            setSuccessMsg('');
            setError(null);

            await Promise.all([
                updateTax({ profileId: currentProfile._id, ...taxSettings }),
                updateBenefits({ profileId: currentProfile._id, ...benefits })
            ]);

            setSuccessMsg('Settings saved successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error(err);
            setError('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    if (!currentProfile) return <div className="p-8">Please select a profile.</div>;
    if (loading && !taxSettings.profileId) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Tax & Benefits Configuration</h1>
                <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                    Save Changes
                </button>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>}
            {successMsg && <div className="bg-green-100 text-green-700 p-4 rounded-lg">{successMsg}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tax Settings */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">Tax Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filing Status</label>
                            <select
                                name="filingStatus"
                                value={taxSettings.filingStatus}
                                onChange={handleTaxChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Federal Tax Rate</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="federalBracket"
                                        value={taxSettings.federalBracket}
                                        onChange={handleTaxChange}
                                        step="0.01"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="absolute right-3 top-2 text-gray-500 text-sm">{(taxSettings.federalBracket * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State Tax Rate</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="stateBracket"
                                        value={taxSettings.stateBracket}
                                        onChange={handleTaxChange}
                                        step="0.01"
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    <span className="absolute right-3 top-2 text-gray-500 text-sm">{(taxSettings.stateBracket * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Standard Deduction ($)</label>
                            <input
                                type="number"
                                name="standardDeduction"
                                value={taxSettings.standardDeduction}
                                onChange={handleTaxChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Deductions ($)</label>
                            <input
                                type="number"
                                name="additionalDeductions"
                                value={taxSettings.additionalDeductions}
                                onChange={handleTaxChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Benefits Settings */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">Benefits & Deductions</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Health Insurance Premium ($/yr)</label>
                            <input
                                type="number"
                                name="healthInsurance"
                                value={benefits.healthInsurance}
                                onChange={handleBenefitsChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Retirement Contribution ($/yr)</label>
                            <input
                                type="number"
                                name="retirementContribution"
                                value={benefits.retirementContribution}
                                onChange={handleBenefitsChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Employer Match ($/yr)</label>
                            <input
                                type="number"
                                name="employerMatch"
                                value={benefits.employerMatch}
                                onChange={handleBenefitsChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <h3 className="text-md font-semibold text-gray-600 mb-2">Military Allowances (Non-Taxable)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Housing (BAH)</label>
                                    <input
                                        type="number"
                                        name="militaryHousingAllowance"
                                        value={benefits.militaryHousingAllowance}
                                        onChange={handleBenefitsChange}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subsistence (BAS)</label>
                                    <input
                                        type="number"
                                        name="militarySubsistenceAllowance"
                                        value={benefits.militarySubsistenceAllowance}
                                        onChange={handleBenefitsChange}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaxBenefits;
