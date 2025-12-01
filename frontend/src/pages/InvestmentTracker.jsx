import React, { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { getInvestments, createInvestment, deleteInvestment } from '../api/financeApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LuTrendingUp, LuPlus, LuTrash2 } from 'react-icons/lu';

const InvestmentTracker = () => {
    const { currentProfile } = useProfile();
    const [investments, setInvestments] = useState([]);
    const [projections, setProjections] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newInv, setNewInv] = useState({
        assetType: 'stock',
        ticker: '',
        currentValue: 0,
        monthlyContribution: 0,
        expectedAnnualReturn: 0.07
    });

    useEffect(() => {
        if (currentProfile) fetchInvestments();
    }, [currentProfile]);

    const fetchInvestments = async () => {
        try {
            const res = await getInvestments(currentProfile._id);
            if (res.success) {
                setInvestments(res.data);
                setProjections(res.projections);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createInvestment({ ...newInv, profileId: currentProfile._id });
            setShowForm(false);
            fetchInvestments();
            setNewInv({ assetType: 'stock', ticker: '', currentValue: 0, monthlyContribution: 0, expectedAnnualReturn: 0.07 });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this investment?')) {
            await deleteInvestment(id);
            fetchInvestments();
        }
    };

    // Prepare chart data
    const chartData = [];
    if (projections && projections.totalPortfolio) {
        Object.keys(projections.totalPortfolio).forEach(year => {
            chartData.push({
                year: `Year ${year}`,
                value: projections.totalPortfolio[year]
            });
        });
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Investment Tracker</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    <LuPlus /> <span>Add Investment</span>
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-bold mb-4">New Investment</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                            value={newInv.assetType}
                            onChange={e => setNewInv({ ...newInv, assetType: e.target.value })}
                            className="p-2 border rounded"
                        >
                            <option value="stock">Stock</option>
                            <option value="ETF">ETF</option>
                            <option value="crypto">Crypto</option>
                            <option value="savings">Savings</option>
                            <option value="brokerage">Brokerage</option>
                        </select>
                        <input
                            type="text" placeholder="Ticker/Name"
                            value={newInv.ticker}
                            onChange={e => setNewInv({ ...newInv, ticker: e.target.value })}
                            className="p-2 border rounded"
                            required
                        />
                        <input
                            type="number" placeholder="Current Value"
                            value={newInv.currentValue}
                            onChange={e => setNewInv({ ...newInv, currentValue: parseFloat(e.target.value) })}
                            className="p-2 border rounded"
                            required
                        />
                        <input
                            type="number" placeholder="Monthly Contribution"
                            value={newInv.monthlyContribution}
                            onChange={e => setNewInv({ ...newInv, monthlyContribution: parseFloat(e.target.value) })}
                            className="p-2 border rounded"
                        />
                        <input
                            type="number" placeholder="Expected Return (0.07 = 7%)"
                            value={newInv.expectedAnnualReturn}
                            onChange={e => setNewInv({ ...newInv, expectedAnnualReturn: parseFloat(e.target.value) })}
                            className="p-2 border rounded"
                            step="0.01"
                        />
                        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Save</button>
                    </form>
                </div>
            )}

            {/* Portfolio Projection */}
            {projections && (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center space-x-2 mb-4">
                        <LuTrendingUp className="text-green-600" size={24} />
                        <h2 className="text-xl font-bold">Portfolio Projection (30 Years)</h2>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                                <Tooltip formatter={(val) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
                                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Investment List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {investments.map(inv => (
                    <div key={inv._id} className="bg-white p-4 rounded-xl shadow border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg">{inv.ticker || inv.assetType}</h3>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 uppercase">{inv.assetType}</span>
                            </div>
                            <button onClick={() => handleDelete(inv._id)} className="text-red-400 hover:text-red-600">
                                <LuTrash2 />
                            </button>
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Value</span>
                                <span className="font-semibold">${inv.currentValue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Monthly</span>
                                <span className="font-semibold">+${inv.monthlyContribution.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Return</span>
                                <span className="font-semibold text-green-600">{(inv.expectedAnnualReturn * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InvestmentTracker;
