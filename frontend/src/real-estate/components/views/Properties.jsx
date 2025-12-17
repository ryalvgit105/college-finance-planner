import React from 'react';
import PropertyCard from '../PropertyCard';
import CashFlowChart from '../charts/CashFlowChart';
import StatCard from '../StatCard';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const CashIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1m0-1V4m0 2v-1m0 0V3m0 2v-1m0 0V2m0 2v-1m0 0V1m0 2v-1m0 0V0m1.401 5.991C14.045 5.386 15 4.586 15 3.5c0-1.657-1.343-3-3-3S9 1.843 9 3.5c0 1.086.955 1.886 2.599 2.491m-2.599 0A3.002 3.002 0 007 9.5c0 1.657 1.343 3 3 3s3-1.343 3-3a3.002 3.002 0 00-2.599-3.509m0 0V16m0 8v-1m0 1v-1m0 1v-1m0 1v-1m0 1V19m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1V18m-5-9.409C4.955 8.114 4 7.314 4 6.25c0-1.657 1.343-3 3-3s3 1.343 3 3c0 1.064-.955 1.864-2.599 2.409M7 8.841V16m0 8v-1m0 1v-1m0 1v-1m0 1v-1m0 1V19m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1V18m10-9.159c1.644-.545 2.599-1.345 2.599-2.409 0-1.657-1.343-3-3-3s-3 1.343-3 3c0 1.064.955 1.864 2.599 2.409M17 8.841V16m0 8v-1m0 1v-1m0 1v-1m0 1v-1m0 1V19m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1v-1m0 1V18" /></svg>;
const PortfolioIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const OccupancyIcon = () => <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-1-4a1 1 0 11-2 0 1 1 0 012 0z" /></svg>;


const Properties = ({ data, onEditProperty, onDeleteProperty, onAddProperty }) => {
    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between pt-8 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Properties</h1>
                    <p className="text-gray-500 mt-1">An overview of your real estate portfolio.</p>
                </div>
                <button
                    onClick={onAddProperty}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors"
                    aria-label="Add new property"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Add Property
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Monthly Cash Flow"
                    value={formatCurrency(data.totalMonthlyCashFlow)}
                    icon={<CashIcon />}
                />
                <StatCard
                    title="Est. Portfolio Value"
                    value={formatCurrency(data.totalPortfolioValue)}
                    icon={<PortfolioIcon />}
                />
                <StatCard
                    title="Rental Occupancy"
                    value={`${data.portfolioOccupancy.toFixed(0)}%`}
                    icon={<OccupancyIcon />}
                />
            </div>

            <CashFlowChart data={data.cashFlowByProperty} />

            {data.properties.length > 0 ? (
                <div className="space-y-4">
                    {data.properties.map(property => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                            onEdit={() => onEditProperty(property)}
                            onDelete={() => onDeleteProperty(property.id)}
                            onUpdateProperty={data.updateProperty}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200 mt-6">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="mt-2 text-base font-medium text-gray-800">No properties</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new property.</p>
                </div>
            )}
        </div>
    );
};

export default Properties;
