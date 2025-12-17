import React from 'react';
import { PlusCircleIcon, TrashIcon } from './Icons';

const CategoryCard = ({ category, items, config, onAddItem, onRemoveItem, onUpdateItem }) => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);

    const handleAmountChange = (id, value) => {
        const amount = parseFloat(value);
        onUpdateItem(id, { amount: isNaN(amount) ? 0 : amount });
    };

    const handleNameChange = (id, value) => {
        onUpdateItem(id, { name: value });
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${config.color}`}>
            <div className="p-6">
                <header className="mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{category}</h2>
                    <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                </header>

                <div className="space-y-3">
                    {items.length > 0 && (
                        <div className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-7"><label className="text-xs font-medium text-gray-500 pl-1">Item/Description</label></div>
                            <div className="col-span-4"><label className="text-xs font-medium text-gray-500 pl-1">Amount</label></div>
                        </div>
                    )}
                    {items.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center animate-fade-in">
                            <div className="col-span-7">
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleNameChange(item.id, e.target.value)}
                                    placeholder="e.g., Groceries, Rent..."
                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                                />
                            </div>
                            <div className="col-span-4">
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">$</span>
                                    <input
                                        type="number"
                                        value={item.amount}
                                        onChange={(e) => handleAmountChange(item.id, e.target.value)}
                                        placeholder="0.00"
                                        className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                                    />
                                </div>
                            </div>
                            <div className="col-span-1 flex items-center justify-center h-full">
                                <button onClick={() => onRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50">
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-between items-center border-t border-gray-200 pt-4">
                    <button
                        onClick={onAddItem}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium text-sm py-2 px-3 rounded-md hover:bg-indigo-50 transition-colors"
                    >
                        <PlusCircleIcon />
                        Add Item
                    </button>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-500">Category Total</p>
                        <p className="text-xl font-bold text-gray-800">
                            {total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryCard;
