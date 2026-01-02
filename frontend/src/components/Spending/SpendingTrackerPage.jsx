import React, {
    useState
} from 'react';
import TrackerApp from './TrackerApp';
import LinkCardModal from './components/LinkCardModal';
import BudgetEditorModal from './components/BudgetEditorModal';
import { useFinance } from '../../context/FinanceContext';

const SpendingTrackerPage = () => {
    const {
        expenses,
        budgetItems,
        incomeItems,
        addExpense,
        deleteExpense,
        addBudgetItem,
        deleteBudgetItem
    } = useFinance();

    const [isLinkCardModalOpen, setIsLinkCardModalOpen] = useState(false);
    const [isBudgetEditorOpen, setIsBudgetEditorOpen] = useState(false);

    // Lifted state from TrackerApp
    const [currentView, setCurrentView] = useState('yearly');
    const [currentDate, setCurrentDate] = useState(new Date());

    // Derived key for the current month
    const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Filter budget items for the current month view
    // Strategy: Show items that are specifically for this month OR items that are global (no month)
    // If the user wants "separate", we might want to eventually copy globals to locals on edit. 
    // For now: We display matches.
    const currentMonthBudgetItems = budgetItems.filter(item => {
        // If we are in 'yearly' view, maybe show all? Or just an average?
        // User asked for "separate for each month", so primarily this affects Monthly View and Editing.
        if (!item.month) return true; // Global items
        return item.month === currentMonthKey;
    });

    return (
        <div className="min-h-screen p-4 md:p-8 font-inter bg-slate-950 text-slate-300">
            <style>{`
            :root {
                --glow-color-sky: rgba(56, 189, 248, 0.5);
                --glow-color-emerald: rgba(16, 185, 129, 0.5);
                --glow-color-rose: rgba(244, 63, 94, 0.5);
            }
            .card-glow-sky:hover {
                box-shadow: 0 0 20px var(--glow-color-sky);
            }
            .card-glow-emerald:hover {
                box-shadow: 0 0 15px var(--glow-color-emerald);
            }
            .button-glow-sky:hover {
                box-shadow: 0 0 15px var(--glow-color-sky);
            }
            .tabular-nums {
                font-variant-numeric: tabular-nums;
            }
            @keyframes subtle-fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-subtle-fade-in {
                animation: subtle-fade-in 0.5s ease-out forwards;
            }
        `}</style>
            <header className="text-center mb-10 flex justify-between items-center max-w-7xl mx-auto">
                <div className="w-48 flex justify-start">
                    {currentView === 'monthly' && (
                        <button
                            onClick={() => setCurrentView('yearly')}
                            className="text-sky-400 hover:text-sky-300 transition text-sm font-semibold flex items-center gap-1"
                        >
                            <span>&larr;</span> Back to Yearly
                        </button>
                    )}
                </div>
                <div className="flex-grow">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-violet-400">
                        Expenses
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">Your visual guide to financial clarity.</p>
                </div>
                <button onClick={() => setIsLinkCardModalOpen(true)} className="w-48 bg-sky-600/50 hover:bg-sky-600/80 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-300 button-glow-sky border border-sky-500/50 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Link Card
                </button>
            </header>

            <TrackerApp
                expenses={expenses}
                incomeItems={incomeItems}
                budgetItems={budgetItems} // TrackerApp needs ALL items for Yearly View calculations (ideally)
                onAddExpense={addExpense}
                onDeleteExpense={deleteExpense}
                currentView={currentView}
                setCurrentView={setCurrentView}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                onOpenBudgetEditor={() => setIsBudgetEditorOpen(true)}
            />

            {isLinkCardModalOpen && (
                <LinkCardModal onClose={() => setIsLinkCardModalOpen(false)} />
            )}

            {isBudgetEditorOpen && (
                <BudgetEditorModal
                    // Only pass items relevant to this month (or globals) for the Editor
                    budgetItems={currentMonthBudgetItems}
                    incomeItems={incomeItems}
                    onAddBudgetItem={(newItem) => addBudgetItem({ ...newItem, month: currentMonthKey })}
                    onDeleteBudgetItem={deleteBudgetItem}
                    onClose={() => setIsBudgetEditorOpen(false)}
                />
            )}
        </div>
    );
};

export default SpendingTrackerPage;
