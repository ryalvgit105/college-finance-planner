import React, { useState, useEffect, useRef } from 'react';
import BudgetPlanner from './budget-planner/BudgetPlanner';
import BudgetComparisonPage from './spending-analysis/BudgetComparisonPage';
import SpendingTracker from './spending-tracker/SpendingTracker';
import { LuShoppingCart, LuScale, LuCalendar } from 'react-icons/lu';

const SpendingManager = () => {
    const [activeTab, setActiveTab] = useState('budget');
    const [tabs, setTabs] = useState([
        { id: 'budget', label: 'Budget Planner', icon: LuShoppingCart },
        { id: 'comparison', label: 'Budget Comparison', icon: LuScale },
        { id: 'tracker', label: 'Calendar Tracker', icon: LuCalendar }
    ]);
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    // Load saved order from local storage on mount
    useEffect(() => {
        const savedOrder = localStorage.getItem('spendingManagerTabOrder');
        if (savedOrder) {
            try {
                const parsedOrder = JSON.parse(savedOrder);
                // Verify all saved IDs exist in current tabs definition to avoid stale data issues
                const currentIds = new Set(['budget', 'comparison', 'tracker']);
                const isValid = parsedOrder.every(t => currentIds.has(t.id)) && parsedOrder.length === 3;

                if (isValid) {
                    // Reconstruct the full tab objects with icons
                    const reorderedTabs = parsedOrder.map(savedTab => {
                        const originalTab = tabs.find(t => t.id === savedTab.id);
                        return { ...savedTab, icon: originalTab?.icon || LuShoppingCart }; // Fallback icon
                    });
                    setTabs(reorderedTabs);
                }
            } catch (e) {
                console.error("Failed to parse tab order", e);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDragStart = (e, position) => {
        dragItem.current = position;
        e.dataTransfer.effectAllowed = "move";
        e.target.classList.add('opacity-50');
    };

    const handleDragEnter = (e, position) => {
        dragOverItem.current = position;
        e.preventDefault();
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-50');
        const copyListItems = [...tabs];
        const dragItemContent = copyListItems[dragItem.current];

        // Remove item from old pos and insert at new pos
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);

        dragItem.current = null;
        dragOverItem.current = null;
        setTabs(copyListItems);

        // Save order (only IDs and labels needed for persistence structure, but saving full object is fine for simple use)
        const orderToSave = copyListItems.map(({ id, label }) => ({ id, label }));
        localStorage.setItem('spendingManagerTabOrder', JSON.stringify(orderToSave));
    };

    // Prevent default behavior to allow drop
    const handleDragOver = (e) => {
        e.preventDefault();
    }

    return (
        <div className="flex flex-col h-full bg-[#0C0C0D] min-h-screen">
            {/* Tab Navigation Bar */}
            <div className="bg-[#111214] border-b border-[#2C2C2E] px-6 py-2 sticky top-0 z-20">
                <div className="flex gap-4 overflow-x-auto hidden-scrollbar">
                    {tabs.map((tab, index) => {
                        const Icon = tab.icon;
                        return (
                            <div
                                key={tab.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={handleDragOver}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors border-b-2 cursor-pointer 
                                ${activeTab === tab.id
                                        ? 'text-[#C6AA76] border-[#C6AA76] bg-[#1C1C1E]'
                                        : 'text-gray-400 border-transparent hover:text-gray-200 hover:bg-[#1C1C1E]/50'
                                    }`}
                                title="Drag to reorder"
                            >
                                <Icon size={18} />
                                <span className="whitespace-nowrap">{tab.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow overflow-auto hidden-scrollbar">
                {activeTab === 'budget' && (
                    <div className="animate-fadeIn h-full">
                        <BudgetPlanner />
                    </div>
                )}
                {activeTab === 'comparison' && (
                    <div className="animate-fadeIn">
                        <BudgetComparisonPage />
                    </div>
                )}
                {activeTab === 'tracker' && (
                    <div className="animate-fadeIn">
                        <SpendingTracker />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpendingManager;
