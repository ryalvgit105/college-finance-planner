export const getCategoryChipClasses = (category) => {
    switch (category) {
        case 'Shopping':
            return 'bg-sky-100 text-sky-800 dark:bg-sky-900/70 dark:text-sky-300';
        case 'Food':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-300';
        case 'Clothes':
            return 'bg-rose-100 text-rose-800 dark:bg-rose-900/70 dark:text-rose-300';
        case 'Entertainment':
            return 'bg-violet-100 text-violet-800 dark:bg-violet-900/70 dark:text-violet-300';
        case 'Utilities':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-300';
        case 'Transport':
            return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/70 dark:text-cyan-300';
        case 'Other':
        default:
            return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
};

export const getCategoryDotBgClass = (category) => {
    switch (category) {
        case 'Shopping': return 'bg-sky-500';
        case 'Food': return 'bg-emerald-500';
        case 'Clothes': return 'bg-rose-500';
        case 'Entertainment': return 'bg-violet-500';
        case 'Utilities': return 'bg-amber-500';
        case 'Transport': return 'bg-cyan-500';
        case 'Other':
        default: return 'bg-slate-400 dark:bg-slate-500';
    }
};

export const getCategoryRowClasses = (category) => {
    const baseClasses = 'px-1.5 py-0.5 rounded';
    switch (category) {
        case 'Shopping':
            return `${baseClasses} bg-sky-50 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200`;
        case 'Food':
            return `${baseClasses} bg-emerald-50 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200`;
        case 'Clothes':
            return `${baseClasses} bg-rose-50 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200`;
        case 'Entertainment':
            return `${baseClasses} bg-violet-50 text-violet-700 dark:bg-violet-900/60 dark:text-violet-200`;
        case 'Utilities':
            return `${baseClasses} bg-amber-50 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200`;
        case 'Transport':
            return `${baseClasses} bg-cyan-50 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-200`;
        case 'Other':
        default:
            return `${baseClasses} bg-slate-100 text-slate-600 dark:bg-slate-700/80 dark:text-slate-300`;
    }
};
