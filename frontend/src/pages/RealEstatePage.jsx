import React from 'react';
import { SettingsProvider } from '../real-estate/contexts/SettingsContext';
import RealEstateManager from '../real-estate/RealEstateManager';

const RealEstatePage = () => {
    return (
        <SettingsProvider>
            <RealEstateManager />
        </SettingsProvider>
    );
};

export default RealEstatePage;
