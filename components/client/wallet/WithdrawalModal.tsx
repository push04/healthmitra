'use client';

import React, { useState } from 'react';
import { X, Building, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
}

export default function WithdrawalModal({ isOpen, onClose, currentBalance }: WithdrawalModalProps) {
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Bank Details State
    const [bankDetails, setBankDetails] = useState({
        accountName: 'Rajesh Kumar',
        accountNumber: '',
        ifsc: '',
        bankName: ''
    });

    if (!isOpen) return null;

    const minBalance = 1;
    const maxWithdrawal = currentBalance - minBalance;

    const handleWithdrawal = () => {
        const withdrawAmount = Number(amount);

        if (withdrawAmount > maxWithdrawal) {
            toast.error('Insufficient Balance', { description: `You must maintain a minimum balance of ₹${minBalance}` });
            return;
        }

        if (withdrawAmount <= 0) {
            toast.error('Invalid Amount');
            return;
        }

        if (!bankDetails.accountNumber || !bankDetails.ifsc) {
            toast.error('Please enter bank details');
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            toast.success('Withdrawal Request Submitted', {
                description: 'Amount will be credited to your bank account within 3-5 business days.'
            });
            onClose();
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Request Withdrawal</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Available Balance:</span>
                            <span className="font-bold text-slate-800">₹{currentBalance.toLocaleString('en-US')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Min. Balance Required:</span>
                            <span className="font-bold text-slate-800">₹{minBalance.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200 mt-2">
                            <span className="text-slate-600 font-medium">Max Withdrawal:</span>
                            <span className="font-bold text-teal-600">₹{maxWithdrawal.toLocaleString('en-US')}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Withdrawal Amount *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:font-normal"
                                    placeholder="0"
                                    max={maxWithdrawal}
                                />
                            </div>
                            {Number(amount) > maxWithdrawal && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle size={12} /> amount exceeds limit
                                </p>
                            )}
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Building size={16} className="text-slate-400" /> Bank Account Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">Account Holder Name *</label>
                                    <input
                                        type="text"
                                        value={bankDetails.accountName}
                                        onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">Account Number *</label>
                                    <input
                                        type="text"
                                        value={bankDetails.accountNumber}
                                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="Enter Account No"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">IFSC Code *</label>
                                    <input
                                        type="text"
                                        value={bankDetails.ifsc}
                                        onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
                                        placeholder="e.g. HDFC000123"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">Bank Name</label>
                                    <input
                                        type="text"
                                        value={bankDetails.bankName}
                                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder="Auto-detected"
                                    />
                                </div>
                            </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" defaultChecked />
                            <span className="text-xs text-slate-600">Save bank details for future withdrawals</span>
                        </label>
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
                        onClick={handleWithdrawal}
                        disabled={isProcessing || !amount || Number(amount) > maxWithdrawal}
                        className="px-6 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] justify-center"
                    >
                        {isProcessing ? (
                            <>Processing <Loader2 size={16} className="animate-spin" /></>
                        ) : (
                            'Request Withdrawal'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
