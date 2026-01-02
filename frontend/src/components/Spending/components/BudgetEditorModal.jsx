import React from 'react';
import { BUDGET_CATEGORIES } from '../constants';
import BudgetSection from './BudgetSection';

const BudgetEditorModal = ({ onClose, budgetItems, incomeItems = [], onAddBudgetItem, onDeleteBudgetItem }) => {
    const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
    const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);
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

                {/* Visualization Section */}
                <div className="px-8 pb-6 pt-6 bg-slate-900/40 border-b border-slate-800/50 backdrop-blur-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Income vs Budget Bar */}
                        <div className="bg-slate-800/20 p-5 rounded-2xl border border-slate-700/30 shadow-lg shadow-black/20 hover:border-slate-600/50 transition-colors">
                            <div className="flex justify-between items-end mb-3">
                                <div>
                                    <h3 className="text-slate-200 font-bold text-lg tracking-tight">Budget Usage</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">Planned vs. Capacity</p>
                                </div>
                                <div className="text-right">
                                    <span className={`block text-xl font-bold tabular-nums tracking-tight ${totalBudget > totalIncome ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        ${totalBudget.toFixed(2)}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">
                                        of ${totalIncome.toFixed(2)} Income
                                    </span>
                                </div>
                            </div>

                            <div className="relative w-full bg-slate-950/50 rounded-full h-4 shadow-inner ring-1 ring-white/5">
                                <div
                                    className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out shadow-lg 
                                        ${totalBudget > totalIncome
                                            ? 'bg-gradient-to-r from-rose-500 to-rose-400 shadow-rose-500/20'
                                            : 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-500/20'}`}
                                    style={{ width: `${Math.min((totalBudget / Math.max(totalIncome, 1)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Budget Dispersion */}
                        <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                            <div className="flex justify-between text-sm font-semibold mb-2">
                                <span className="text-slate-300">Budget Dispersion</span>
                                <span className="text-slate-400">{Math.round((totalBudget / Math.max(totalIncome, 1)) * 100)}% of Income</span>
                            </div>
                            <div className="w-full bg-slate-700/50 rounded-full h-3 flex overflow-hidden">
                                {Object.entries(BUDGET_CATEGORIES).map(([catKey, details]) => {
                                    const categoryTotal = budgetItems
                                        .filter(item => item.category === catKey)
                                        .reduce((sum, item) => sum + item.amount, 0);

                                    if (categoryTotal === 0) return null;

                                    const percent = (categoryTotal / Math.max(totalBudget, 1)) * 100;
                                    const colorClass = details.chip.split(' ')[0].split('/')[0];

                                    return (
                                        <div
                                            key={catKey}
                                            className={`${colorClass}`}
                                            style={{ width: `${percent}%` }}
                                            title={`${catKey}: $${categoryTotal.toFixed(2)}`}
                                        />
                                    );
                                })}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 font-medium">
                                {Object.entries(BUDGET_CATEGORIES).map(([catKey, details]) => {
                                    const colorMap = {
                                        'Debt Payoff': 'bg-rose-500',
                                        'Savings & Investments': 'bg-emerald-500',
                                        'Giving & Donations': 'bg-amber-500',
                                        'Fixed Expenses': 'bg-sky-500',
                                        'Fun Money': 'bg-violet-500'
                                    };
                                    const colorKey = colorMap[catKey] || 'bg-slate-500';

                                    return (
                                        <div key={catKey} className="flex items-center">
                                            <div className={`w-2 h-2 rounded-full ${colorKey} mr-1.5 shadow-sm shadow-black/50`}></div>
                                            <span className="opacity-80 hover:opacity-100 transition-opacity cursor-default">{catKey}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
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
