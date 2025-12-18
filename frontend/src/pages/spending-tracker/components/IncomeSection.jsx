import React, { useState } from 'react';

const IncomeSection = ({ title, description, items, onAddItem, onDeleteItem, isEditing }) => {
    const [itemDescription, setItemDescription] = useState('');
    const [itemAmount, setItemAmount] = useState('');

    const categoryTotal = items.reduce((sum, item) => sum + item.amount, 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(itemAmount);
        if (!itemDescription || isNaN(amount) || amount <= 0) return;

        onAddItem({
            description: itemDescription,
            amount,
        });

        setItemDescription('');
        setItemAmount('');
    };

    return (
        <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/70 p-4 rounded-xl border border-slate-700/80 flex flex-col">
            <div>
                <h3 className="text-xl font-bold text-emerald-400">{title}</h3>
                <p className="text-sm text-slate-400 mb-4 h-10">{description}</p>
            </div>

            <div className="space-y-2 flex-grow mb-4 min-h-[6rem]">
                {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-md">
                        <span className="text-slate-200 text-sm">{item.description}</span>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-100 text-sm tabular-nums">${item.amount.toFixed(2)}</span>
                            {isEditing && (
                                <button onClick={() => onDeleteItem(item.id)} className="text-rose-500 hover:text-rose-400 transition text-lg font-bold leading-none flex items-center justify-center w-4 h-4">
                                    &times;
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {items.length === 0 && !isEditing && (
                    <div className="text-center text-slate-500 pt-4">No income sources.</div>
                )}
            </div>

            {isEditing && (
                <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
                    <input
                        type="text"
                        placeholder="Income Source"
                        value={itemDescription}
                        onChange={e => setItemDescription(e.target.value)}
                        className="flex-grow bg-slate-800 border border-slate-600 rounded-md p-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                    />
                    <input
                        type="number"
                        placeholder="Amt"
                        value={itemAmount}
                        onChange={e => setItemAmount(e.target.value)}
                        className="w-20 bg-slate-800 border border-slate-600 rounded-md p-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
                    />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 rounded-md text-sm transition-colors card-glow-emerald">
                        Add
                    </button>
                </form>
            )}

            <div className="text-right font-bold mt-4 border-t border-slate-700 pt-3">
                <span className="text-slate-300">Total Income: </span>
                <span className="text-xl text-white tabular-nums">${categoryTotal.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default IncomeSection;
