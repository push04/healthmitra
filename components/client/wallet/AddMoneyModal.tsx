'use client';

import React, { useState } from 'react';
import { X, CreditCard, Wallet, Smartphone, Globe, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AddMoneyModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
}

export default function AddMoneyModal({ isOpen, onClose, currentBalance }: AddMoneyModalProps) {
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<string>('upi');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const quickAmounts = [500, 1000, 2000, 5000, 10000];

    const handlePayment = () => {
        if (!amount || Number(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsProcessing(true);
        // Simulate Payment Gateway
        setTimeout(() => {
            setIsProcessing(false);
            toast.success('Money added to wallet!', {
                description: `₹${Number(amount).toLocaleString()} credited successfully.`
            });
            onClose();
            setAmount('');
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Add Money to Wallet</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-slate-500 mb-1">Current Balance</p>
                        <p className="text-2xl font-bold text-slate-800">₹ {currentBalance.toLocaleString()}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Enter Amount *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:font-normal"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Quick Select Pills */}
                        <div className="flex flex-wrap gap-2">
                            {quickAmounts.map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => setAmount(amt.toString())}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${amount === amt.toString()
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    ₹{amt.toLocaleString()}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="text-sm font-semibold text-slate-700">Select Payment Method *</label>
                            <div className="space-y-2">
                                {[
                                    { id: 'upi', label: 'UPI', icon: Smartphone },
                                    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                                    { id: 'netbanking', label: 'Net Banking', icon: Globe },
                                    { id: 'wallet', label: 'Wallet', icon: Wallet },
                                ].map((method) => (
                                    <label
                                        key={method.id}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedMethod === method.id
                                            ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
                                            : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            className="accent-emerald-600"
                                            checked={selectedMethod === method.id}
                                            onChange={() => setSelectedMethod(method.id)}
                                        />
                                        <div className={`p-2 rounded-lg ${selectedMethod === method.id ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                            <method.icon size={18} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{method.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <span className="font-bold">*</span> Instant credit after successful payment
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing || !amount}
                        className="px-6 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
                    >
                        {isProcessing ? (
                            <>Processing <Loader2 size={16} className="animate-spin" /></>
                        ) : (
                            'Proceed to Pay'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
