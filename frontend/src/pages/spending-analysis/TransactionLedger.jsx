import React, { useState, useMemo } from 'react';
import { LuSearch, LuDownload, LuFilter, LuTrash2, LuPencil, LuCheck, LuX, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { CSVLink } from 'react-csv';

const TransactionLedger = ({ transactions, onDelete, onUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filters
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchesSearch =
                t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
                t.amount.toString().includes(searchTerm);

            const matchesCategory = filterCategory === 'All' || t.category === filterCategory;

            return matchesSearch && matchesCategory;
        });
    }, [transactions, searchTerm, filterCategory]);

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const currentData = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Bulk selection logic
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(new Set(currentData.map(t => t._id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    // Bulk Delete
    const handleBulkDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.size} transactions?`)) {
            // Ideally we'd have a bulk delete API, but we'll specific onDelete for each for now or ask parent to handle
            // For MVP, just delete individually from parent
            onDelete(Array.from(selectedIds));
            setSelectedIds(new Set());
        }
    };

    // CSV Headers
    const csvHeaders = [
        { label: 'Date', key: 'date' },
        { label: 'Category', key: 'category' },
        { label: 'Amount', key: 'amount' },
        { label: 'Type', key: 'type' },
        { label: 'Notes', key: 'notes' }
    ];

    const uniqueCategories = ['All', ...new Set(transactions.map(t => t.category))].sort();

    return (
        <div className="bg-[#111214] rounded-xl border border-[#2C2C2E] overflow-hidden shadow-xl">
            {/* Toolbar */}
            <div className="p-4 border-b border-[#2C2C2E] flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#1C1C1E] border border-[#2C2C2E] text-white rounded-lg pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:ring-1 focus:ring-[#C6AA76] outline-none"
                        />
                    </div>
                    <div className="relative">
                        <LuFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="bg-[#1C1C1E] border border-[#2C2C2E] text-white rounded-lg pl-10 pr-8 py-2 text-sm appearance-none focus:ring-1 focus:ring-[#C6AA76] outline-none cursor-pointer"
                        >
                            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-3 py-2 bg-red-900/30 text-red-400 border border-red-900/50 rounded-lg text-sm hover:bg-red-900/50 transition-colors"
                        >
                            <LuTrash2 size={16} /> Delete ({selectedIds.size})
                        </button>
                    )}
                    <CSVLink
                        data={filteredTransactions}
                        headers={csvHeaders}
                        filename={"transactions_export.csv"}
                        className="flex items-center gap-2 px-3 py-2 bg-[#1C1C1E] text-[#C6AA76] border border-[#2C2C2E] rounded-lg text-sm hover:bg-[#2C2C2E] transition-colors"
                    >
                        <LuDownload size={16} /> Export CSV
                    </CSVLink>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-[#9EA2A8] uppercase bg-[#1C1C1E]">
                        <tr>
                            <th className="p-4 w-4">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={currentData.length > 0 && selectedIds.size === currentData.length}
                                    className="rounded border-gray-600 bg-gray-700 text-[#C6AA76] focus:ring-0 focus:ring-offset-0"
                                />
                            </th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Notes</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2C2E] text-gray-300">
                        {currentData.length > 0 ? (
                            currentData.map((t) => (
                                <tr key={t._id} className="hover:bg-[#1C1C1E]/50 transition-colors group">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(t._id)}
                                            onChange={() => handleSelectOne(t._id)}
                                            className="rounded border-gray-600 bg-gray-700 text-[#C6AA76] focus:ring-0 focus:ring-offset-0"
                                        />
                                    </td>
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        {new Date(t.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="bg-[#2C2C2E] px-2 py-1 rounded text-xs text-white border border-gray-700">
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`text-xs ${t.isIncome ? 'text-green-400' : 'text-gray-400'}`}>
                                            {t.isIncome ? 'Income' : (t.type === 'fixed' ? 'Fixed Bill' : 'Variable')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-gray-500 truncate max-w-[200px]" title={t.notes}>
                                        {t.notes || '-'}
                                    </td>
                                    <td className={`px-6 py-3 text-right font-medium ${t.isIncome ? 'text-green-400' : 'text-white'}`}>
                                        {t.isIncome ? '+' : '-'}${Math.abs(t.amount).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        {/* Simple actions for MVP */}
                                        <button
                                            onClick={() => { if (window.confirm('Delete this transaction?')) onDelete([t._id]); }}
                                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <LuTrash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                    No transactions found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-[#2C2C2E] flex justify-between items-center text-xs text-gray-400">
                <span>Showing {currentData.length} of {filteredTransactions.length} entries</span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-1 rounded hover:bg-[#2C2C2E] disabled:opacity-50"
                    >
                        <LuChevronLeft size={16} />
                    </button>
                    <span className="text-white">Page {currentPage} of {totalPages || 1}</span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-1 rounded hover:bg-[#2C2C2E] disabled:opacity-50"
                    >
                        <LuChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionLedger;
