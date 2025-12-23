import React from 'react';
import { BUDGET_CATEGORIES } from '../constants';
import BudgetSection from './BudgetSection';

const BudgetEditorModal = ({ onClose, budgetItems, onAddBudgetItem, onDeleteBudgetItem }) => {
    return (
        <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#0C0C0D] w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl border border-slate-800 flex flex-col animate-fade-in overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-100">Edit Budget Plan</h2>
                        <p className="text-slate-400">Adjust your planned spending for each category.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition font-semibold border border-slate-700"
                    >
                        Done
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(BUDGET_CATEGORIES).map(([catKey, details]) => {
                            const categoryItems = budgetItems.filter(item => item.category === catKey);
                            return (
                                <BudgetSection
                                    key={catKey}
                                    category={catKey}
                                    title={catKey}
                                    description={details.description}
                                    items={categoryItems}
                                    onAddItem={onAddBudgetItem}
                                    onDeleteItem={onDeleteBudgetItem}
                                    isEditing={true}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Footer Summary */}
                <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end items-center gap-4">
                    <span className="text-slate-400">Total Monthly Budget:</span>
                    <span className="text-2xl font-bold text-sky-400 tabular-nums">
                        ${budgetItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BudgetEditorModal;
