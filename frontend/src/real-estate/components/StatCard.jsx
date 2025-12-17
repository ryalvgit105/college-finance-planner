import React from 'react';

const StatCard = ({ title, value, icon }) => {
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative">
            <div className="absolute top-4 right-4 bg-blue-50 text-blue-500 p-2 rounded-lg">
                {icon}
            </div>
            <h3 className="text-base font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
    );
};

export default StatCard;
