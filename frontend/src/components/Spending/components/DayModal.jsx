import React, { useState } from 'react';
import { BUDGET_CATEGORIES, MONTH_NAMES } from '../constants';
import { BudgetCategory } from '../types';

const DayModal = ({ date, expenses, onClose, onAddExpense, onDeleteExpense }) => {
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(BudgetCategory.FunMoney);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    const formattedDate = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description || !amount) {
            setError('Description and amount are required.');
            return;
        }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }
        setError('');

        onAddExpense({
            date: date.toISOString().split('T')[0],
            description,
            category,
            amount: parsedAmount,
        });

        setDescription('');
        setCategory(BudgetCategory.FunMoney);
        setAmount('');
    };

    const totalDayExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-b from-slate-900 to-slate-950 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-700/80 p-6 animate-fade-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-slate-100">
                        Expenses for <span className="text-sky-400">{formattedDate}</span>
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition text-3xl leading-none">&times;</button>
                </div>

                {/* Expense List */}
                <div className="max-h-60 overflow-y-auto pr-2 space-y-2 mb-4 custom-scrollbar">
                    {expenses.length > 0 ? (
                        expenses.map(exp => (
                            <div key={exp.id} className="bg-slate-800/70 p-3 rounded-lg flex items-center justify-between border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{BUDGET_CATEGORIES[exp.category].emoji}</span>
                                    <div>
                                        <p className="font-semibold text-slate-200">{exp.description}</p>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${BUDGET_CATEGORIES[exp.category].chip}`}>
                                            {exp.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-bold text-slate-100 tabular-nums">${exp.amount.toFixed(2)}</p>
                                    <button onClick={() => onDeleteExpense(exp.id)} className="text-rose-500 hover:text-rose-400 transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-slate-500 py-8">
                            <p className="text-lg">No expenses logged.</p>
                            <p className="text-sm">Add one below to get started!</p>
                        </div>
                    )}
                </div>

                <div className="text-right font-bold text-lg mb-4 pr-2 text-slate-300 border-t border-slate-700 pt-4">
                    Daily Total: <span className={`tabular-nums ${totalDayExpenses > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>${totalDayExpenses.toFixed(2)}</span>
                </div>


                {/* Add Expense Form */}
                <form onSubmit={handleSubmit} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="font-bold text-lg mb-3 text-slate-200">Add New Expense</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Description (e.g., Coffee)"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="bg-slate-800 border border-slate-600 rounded-md p-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="bg-slate-800 border border-slate-600 rounded-md p-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                        />
                    </div>
                    <div className="mt-4">
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                        >
                            {Object.values(BudgetCategory).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    {error && <p className="text-rose-500 text-sm mt-2">{error}</p>}
                    <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-md mt-4 transition-all duration-300 button-glow-sky">
                        Add Expense
                    </button>
                </form>
            </div>
            <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
        </div>
    );
};

export default DayModal;
