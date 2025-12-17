import React, { useState } from 'react';
import { useFinancialData } from './hooks/useFinancialData';
import EditPropertyModal from './components/modals/EditPropertyModal';
import Properties from './components/views/Properties';

const RealEstateManager = () => {
    const financialData = useFinancialData();
    const [editingProperty, setEditingProperty] = useState(null);

    const handleEditClick = (property) => {
        setEditingProperty(property);
    };

    const handleCloseModal = () => {
        setEditingProperty(null);
    };

    const handleSaveChanges = (updatedProperty) => {
        financialData.updateProperty(updatedProperty);
        setEditingProperty(null); // Close modal on save
    };

    return (
        <div className="font-sans text-gray-800 flex flex-col h-full bg-gray-50">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 flex-grow">
                <main className="flex-grow">
                    <Properties
                        data={financialData}
                        onEditProperty={handleEditClick}
                        onDeleteProperty={financialData.deleteProperty}
                        onAddProperty={financialData.addProperty}
                    />
                </main>
            </div>
            {editingProperty && (
                <EditPropertyModal
                    property={editingProperty}
                    onClose={handleCloseModal}
                    onSave={handleSaveChanges}
                />
            )}
        </div>
    );
}

export default RealEstateManager;
