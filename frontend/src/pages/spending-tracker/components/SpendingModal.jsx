import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon, TrashIcon } from './icons';
import { getCategoryChipClasses } from '../utils/colorUtils';

const SpendingModal = ({ isOpen, onClose, selectedDay, spendingForDay, onAddSpending, onDeleteSpending }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const modalRef = useRef(null);
    const descriptionInputRef = useRef(null);

    const categories = ['Shopping', 'Food', 'Clothes', 'Entertainment', 'Utilities', 'Transport', 'Other'];

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
            // Accessibility: Focus the first input when the modal opens
            setTimeout(() => descriptionInputRef.current?.focus(), 100);
        }
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen, onClose]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (description && !isNaN(numAmount) && numAmount > 0 && category) {
            onAddSpending({ description, amount: numAmount, category: category });
            setDescription('');
            setAmount('');
            setCategory('');
            descriptionInputRef.current?.focus();
        }
    };

    if (!isOpen) return null;

    const dayFormat = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    return (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg p-8 relative animate-fade-in-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 bg-slate-700 hover:bg-slate-600 rounded-full p-2 transition-colors"
                    aria-label="Close modal"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>

                <div className="mb-8">
                    <h2 className="text-3xl font-extrabold text-white">Spending for</h2>
                    <p className="text-xl text-blue-400 font-medium">{dayFormat.format(selectedDay)}</p>
                </div>


                <form onSubmit={handleSubmit} className="space-y-4 pb-6 mb-6 border-b border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="description" className="sr-only">Description</label>
                            <input
                                id="description"
                                ref={descriptionInputRef}
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Description (e.g., Coffee)"
                                className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="sr-only">Category</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                required
                            >
                                <option value="" disabled>Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-grow">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">$</span>
                            <label htmlFor="amount" className="sr-only">Amount</label>
                            <input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Amount"
                                className="w-full p-3 pl-7 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5">Add Expense</button>
                    </div>
                </form>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                    {spendingForDay.length > 0 ? (
                        spendingForDay.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-slate-700/50 p-4 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors">
                                <div>
                                    <p className="font-medium text-gray-100">{item.description}</p>
                                    {item.category && (
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mt-1.5 inline-block ${getCategoryChipClasses(item.category)}`}>
                                            {item.category}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-lg text-white">{currencyFormatter.format(item.amount)}</span>
                                    <button
                                        onClick={() => onDeleteSpending(item.id)}
                                        className="text-slate-400 hover:text-red-400 bg-slate-700 hover:bg-red-900/50 rounded-full p-2 transition-colors"
                                        aria-label={`Delete ${item.description}`}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-slate-400">No spending recorded for this day.</p>
                            <p className="text-sm text-slate-500">Add an expense using the form above.</p>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #475569; /* slate-600 */
            border-radius: 20px;
            border: 3px solid transparent;
            background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #64748b; /* slate-500 */
        }
      `}</style>
        </div>
    );
};

export default SpendingModal;
