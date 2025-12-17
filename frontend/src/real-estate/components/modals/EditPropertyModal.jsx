import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import InputField from '../common/InputField';

const EditPropertyModal = ({ property, onClose, onSave }) => {
    const [formData, setFormData] = useState(property);
    const [errors, setErrors] = useState({});
    const [activeOpexTab, setActiveOpexTab] = useState('hack');

    const validate = useCallback((data) => {
        const newErrors = {};
        if (!data.address?.trim()) newErrors.address = 'Address cannot be empty.';
        if (data.mortgagePI < 0) newErrors.mortgagePI = 'Must be non-negative.';
        if (data.propertyTaxes < 0) newErrors.propertyTaxes = 'Must be non-negative.';
        if (data.propertyInsurance < 0) newErrors.propertyInsurance = 'Must be non-negative.';

        const validateExpenseItems = (items) => {
            const itemErrors = [];
            items.forEach((item, index) => {
                const errorsForItem = {};
                if (!item.name.trim()) errorsForItem.name = 'Name cannot be empty.';
                if (item.amount < 0) errorsForItem.amount = 'Must be non-negative.';
                if (Object.keys(errorsForItem).length > 0) itemErrors[index] = errorsForItem;
            });
            return itemErrors;
        };

        const opexHackErrors = validateExpenseItems(data.opexHouseHackItems);
        const opexRentalErrors = validateExpenseItems(data.opexFullRentalItems);
        if (opexHackErrors.length > 0 || opexRentalErrors.length > 0) newErrors.opex = [...opexHackErrors, ...opexRentalErrors];

        const unitErrors = [];
        data.units.forEach((unit, index) => {
            const errorsForUnit = {};
            if (!unit.name.trim()) errorsForUnit.name = 'Name cannot be empty.';
            if (unit.rent < 0) errorsForUnit.rent = 'Must be non-negative.';
            if (unit.rentFullRental < 0) errorsForUnit.rentFullRental = 'Must be non-negative.';
            if (unit.maintenance < 0) errorsForUnit.maintenance = 'Must be non-negative.';
            if (unit.repairs < 0) errorsForUnit.repairs = 'Must be non-negative.';
            if (unit.vacancy < 0) errorsForUnit.vacancy = 'Must be non-negative.';

            if (Object.keys(errorsForUnit).length > 0) unitErrors[index] = errorsForUnit;
        });

        if (unitErrors.some(e => e)) newErrors.units = unitErrors;

        return newErrors;
    }, []);


    useEffect(() => {
        setFormData(property);
    }, [property]);

    useEffect(() => {
        const validationErrors = validate(formData);
        setErrors(validationErrors);
    }, [formData, validate]);

    const handleInputChange = (e, field) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleUnitChange = (index, field, value) => {
        const newUnits = [...formData.units];
        newUnits[index][field] = value;
        setFormData(prev => ({ ...prev, units: newUnits }));
    };

    const addUnit = () => {
        setFormData(prev => ({
            ...prev,
            units: [...prev.units, { id: uuidv4(), name: 'New Unit', rent: 0, rentFullRental: 0, occupancy: 'occupied', maintenance: 0, repairs: 0, vacancy: 0 }]
        }));
    };

    const removeUnit = (id) => setFormData(prev => ({ ...prev, units: prev.units.filter((unit) => unit.id !== id) }));

    const handleOpexItemChange = (index, field, value) => {
        const listKey = activeOpexTab === 'hack' ? 'opexHouseHackItems' : 'opexFullRentalItems';
        const newItems = [...formData[listKey]];
        newItems[index][field] = value;
        setFormData(prev => ({ ...prev, [listKey]: newItems }));
    };

    const addOpexItem = () => {
        const listKey = activeOpexTab === 'hack' ? 'opexHouseHackItems' : 'opexFullRentalItems';
        setFormData(prev => ({
            ...prev,
            [listKey]: [...prev[listKey], { id: uuidv4(), name: 'New Expense', amount: 0 }]
        }));
    };

    const removeOpexItem = (id) => {
        const listKey = activeOpexTab === 'hack' ? 'opexHouseHackItems' : 'opexFullRentalItems';
        setFormData(prev => ({
            ...prev,
            [listKey]: prev[listKey].filter(item => item.id !== id)
        }));
    };

    const isFormValid = Object.keys(errors).length === 0;

    const handleSave = () => { if (isFormValid) onSave(formData); };

    const opexItems = activeOpexTab === 'hack' ? formData.opexHouseHackItems : formData.opexFullRentalItems;

    const unitNumericFields = [
        { key: 'rent', placeholder: 'Hack Rent' },
        { key: 'rentFullRental', placeholder: 'Full Rent' },
        { key: 'maintenance', placeholder: 'Maint.' },
        { key: 'repairs', placeholder: 'Repairs' },
        { key: 'vacancy', placeholder: 'Vacancy' }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b">
                    <h2 className="text-xl font-bold">Edit Property</h2>
                    <p className="text-sm text-gray-500">{property.address}</p>
                </div>
                <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Address" value={formData.address} onChange={(e) => handleInputChange(e, 'address')} error={errors.address} id="address" />
                        <InputField label="Strategy" id="strategy" value={formData.strategy} onChange={(e) => handleInputChange(e, 'strategy')}>
                            <select>
                                <option value="houseHack">Live-in Hack</option>
                                <option value="fullRental">Full Rental</option>
                            </select>
                        </InputField>
                    </div>

                    <h3 className="font-semibold border-b pt-3 pb-2">PITI Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField id="mortgagePI" label="Mortgage (P&I)" value={formData.mortgagePI} onChange={(e) => handleInputChange(e, 'mortgagePI')} type="number" prefix="$" error={errors.mortgagePI} />
                        <InputField id="propertyTaxes" label="Property Taxes" value={formData.propertyTaxes} onChange={(e) => handleInputChange(e, 'propertyTaxes')} type="number" prefix="$" error={errors.propertyTaxes} />
                        <InputField id="propertyInsurance" label="Insurance" value={formData.propertyInsurance} onChange={(e) => handleInputChange(e, 'propertyInsurance')} type="number" prefix="$" error={errors.propertyInsurance} />
                    </div>

                    <h3 className="font-semibold border-b pt-3 pb-2">Operating Expenses</h3>
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            <button onClick={() => setActiveOpexTab('hack')} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeOpexTab === 'hack' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>House Hack</button>
                            <button onClick={() => setActiveOpexTab('rental')} className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeOpexTab === 'rental' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Full Rental</button>
                        </nav>
                    </div>
                    <div className="space-y-2">
                        {opexItems.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-7">
                                    <input type="text" placeholder="Expense Name" value={item.name} onChange={e => handleOpexItemChange(index, 'name', e.target.value)} className="w-full p-1 border rounded border-gray-200" />
                                </div>
                                <div className="col-span-4 relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                    <input type="number" placeholder="Amount" value={item.amount} onChange={e => handleOpexItemChange(index, 'amount', parseFloat(e.target.value) || 0)} className="w-full p-1 border rounded pl-5 border-gray-200" />
                                </div>
                                <div className="col-span-1">
                                    <button onClick={() => removeOpexItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full" aria-label={`Remove expense ${item.name}`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button onClick={addOpexItem} className="text-sm text-blue-500 font-semibold hover:underline">+ Add Expense Item</button>
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-semibold border-b pt-3 pb-2">Units</h3>
                        {formData.units.map((unit, index) => (
                            <div key={unit.id} className="p-2 bg-gray-50 rounded-md space-y-2">
                                <div className="grid grid-cols-12 gap-2 items-start">
                                    <div className="col-span-11">
                                        <input type="text" placeholder="Unit Name" value={unit.name} onChange={e => handleUnitChange(index, 'name', e.target.value)} className={`w-full p-1 border rounded ${errors.units?.[index]?.name ? 'border-red-500' : 'border-gray-200'}`} />
                                    </div>
                                    <div className="col-span-1 text-right flex items-center justify-end">
                                        <button onClick={() => removeUnit(unit.id)} className="text-red-500 hover:text-red-700 p-1 rounded-full" aria-label={`Remove unit ${unit.name}`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                    {unitNumericFields.map(field => (
                                        <div key={field.key} className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <input type="number" placeholder={field.placeholder} value={unit[field.key]} onChange={e => handleUnitChange(index, field.key, parseFloat(e.target.value) || 0)} className={`w-full p-1 border rounded pl-5 ${errors.units?.[index]?.[field.key] ? 'border-red-500' : 'border-gray-200'}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button onClick={addUnit} className="text-sm text-blue-500 font-semibold hover:underline">+ Add Unit</button>
                    </div>
                </div>
                <div className="px-5 py-3 bg-gray-50 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={!isFormValid}>Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default EditPropertyModal;
