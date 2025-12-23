import React, { useState } from 'react';

const BudgetSection = ({ category, title, description, items, onAddItem, onDeleteItem, isEditing = true }) => {
    const [itemDescription, setItemDescription] = useState('');
    const [itemAmount, setItemAmount] = useState('');

    const categoryTotal = items.reduce((sum, item) => sum + item.amount, 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        const amount = parseFloat(itemAmount);
        if (!itemDescription || isNaN(amount) || amount <= 0) return;

        onAddItem({
            category,
            description: itemDescription,
            amount,
        });

        setItemDescription('');
        setItemAmount('');
    };

    return (
        <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/70 p-4 rounded-xl border border-slate-700/80 flex flex-col h-full">
            <div>
                <h3 className="text-xl font-bold text-sky-400">{title}</h3>
                <p className="text-sm text-slate-400 mb-4 min-h-[2.5rem]">{description}</p>
            </div>

            <div className="space-y-2 flex-grow mb-4 min-h-[6rem] overflow-y-auto max-h-48 custom-scrollbar pr-1">
                {items.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-md group">
                        <span className="text-slate-200 text-sm truncate mr-2">{item.description}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-semibold text-slate-100 text-sm tabular-nums">${item.amount.toFixed(2)}</span>
                            {isEditing && (
                                <button onClick={() => onDeleteItem(item.id)} className="text-slate-500 hover:text-rose-500 transition text-lg font-bold leading-none flex items-center justify-center w-5 h-5 opacity-0 group-hover:opacity-100">
                                    &times;
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {items.length === 0 && !isEditing && (
                    <div className="text-center text-slate-500 pt-4">No items budgeted.</div>
                )}
            </div>

            {isEditing && (
                <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
                    <input
                        type="text"
                        placeholder="Item"
                        value={itemDescription}
                        onChange={e => setItemDescription(e.target.value)}
                        className="flex-grow min-w-0 bg-slate-800 border border-slate-600 rounded-md p-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                    />
                    <input
                        type="number"
                        placeholder="$"
                        value={itemAmount}
                        onChange={e => setItemAmount(e.target.value)}
                        className="w-16 bg-slate-800 border border-slate-600 rounded-md p-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                    />
                    <button type="submit" className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 rounded-md text-sm transition-colors">
                        +
                    </button>
                </form>
            )}

            <div className="text-right font-bold mt-4 border-t border-slate-700 pt-3 flex justify-between items-center">
                <span className="text-slate-400 text-xs uppercase tracking-wider">Total</span>
                <span className="text-lg text-white tabular-nums">${categoryTotal.toFixed(2)}</span>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }
            `}</style>
        </div>
    );
};

export default BudgetSection;
