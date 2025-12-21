import React, { useState } from 'react';

const LinkCardModal = ({ onClose }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        const formattedValue = value.replace(/(.{4})/g, '$1 ').trim(); // Add spaces every 4 digits
        if (formattedValue.length <= 19) {
            setCardNumber(formattedValue);
        }
    };

    const handleExpiryChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        let formattedValue = value;
        if (value.length > 2) {
            formattedValue = `${value.slice(0, 2)}/${value.slice(2)}`;
        }
        if (formattedValue.length <= 5) {
            setExpiry(formattedValue);
        }
    };

    const handleCvvChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        if (value.length <= 4) {
            setCvv(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!cardNumber || !cardName || !expiry || !cvv) {
            setError('Please fill in all card details.');
            return;
        }
        if (cardNumber.length < 19 || expiry.length < 5) {
            setError('Please enter valid card details.');
            return;
        }
        setError('');
        setIsProcessing(true);

        // Simulate API call
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        }, 2000);
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-b from-slate-900 to-slate-950 w-full max-w-md rounded-2xl shadow-2xl border border-slate-700/80 p-6 animate-fade-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-slate-100">Link a New Card</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition text-3xl leading-none">&times;</button>
                </div>

                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center h-80 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-emerald-400 mb-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-2xl font-bold text-emerald-300">Card Linked Successfully!</h3>
                        <p className="text-slate-400 mt-1">You can now track expenses from this card.</p>
                    </div>
                ) : isProcessing ? (
                    <div className="flex flex-col items-center justify-center h-80">
                        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h3 className="text-xl font-semibold text-sky-300">Linking Your Card...</h3>
                        <p className="text-slate-400 mt-1">This may take a moment.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Card Number</label>
                            <input
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                className="w-full bg-slate-800 border border-slate-600 rounded-md p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Cardholder Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={cardName}
                                onChange={e => setCardName(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-md p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-400 mb-1">Expiry Date</label>
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={expiry}
                                    onChange={handleExpiryChange}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-md p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-400 mb-1">CVV</label>
                                <input
                                    type="password"
                                    placeholder="•••"
                                    value={cvv}
                                    onChange={handleCvvChange}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-md p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
                                />
                            </div>
                        </div>
                        {error && <p className="text-rose-500 text-sm text-center pt-2">{error}</p>}
                        <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg mt-4 transition-all duration-300 button-glow-sky flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            Link Card Securely
                        </button>
                    </form>
                )}
            </div>
            <style>{`
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
        </div>
    );
};

export default LinkCardModal;
