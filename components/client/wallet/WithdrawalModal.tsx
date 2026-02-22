'use client';

import React, { useState, useEffect } from 'react';
import { X, Building, AlertCircle, Loader2, FileText, Upload, Receipt, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { createWithdrawalRequest } from '@/app/actions/withdrawals';

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
    userName?: string;
}

// BILL TYPES for bill-based withdrawal
const BILL_TYPES = [
    { value: 'hospital', label: 'Hospital Bill' },
    { value: 'pharmacy', label: 'Pharmacy / Medicine Bill' },
    { value: 'diagnostic', label: 'Diagnostic / Lab Bill' },
    { value: 'consultation', label: 'Doctor Consultation Bill' },
    { value: 'other', label: 'Other Medical Bill' },
];

export default function WithdrawalModal({ isOpen, onClose, currentBalance, userName = '' }: WithdrawalModalProps) {
    const [amount, setAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [billType, setBillType] = useState('');
    const [billFile, setBillFile] = useState<File | null>(null);
    const [billNumber, setBillNumber] = useState('');
    const [billDate, setBillDate] = useState('');

    // Bank Details State
    const [bankDetails, setBankDetails] = useState({
        accountName: userName,
        accountNumber: '',
        ifsc: '',
        bankName: ''
    });

    useEffect(() => {
        setBankDetails(prev => ({ ...prev, accountName: userName }));
    }, [userName]);

    // Daily withdrawal limit tracking (mock - would be from API)
    const [todayWithdrawals] = useState(2); // Simulating 2 withdrawals today
    const MAX_DAILY_WITHDRAWALS = 5;
    const remainingWithdrawals = MAX_DAILY_WITHDRAWALS - todayWithdrawals;

    if (!isOpen) return null;

    const minBalance = 1;
    const maxWithdrawal = currentBalance - minBalance;

    const handleWithdrawal = async () => {
        const withdrawAmount = Number(amount);

        if (remainingWithdrawals <= 0) {
            toast.error('Daily Limit Reached', {
                description: 'You have reached the maximum of 5 withdrawals per day. Try again tomorrow.'
            });
            return;
        }

        if (!billType) {
            toast.error('Please select a bill type');
            return;
        }

        if (!billFile) {
            toast.error('Please upload the bill/invoice');
            return;
        }

        if (!billNumber || !billDate) {
            toast.error('Please enter bill number and date');
            return;
        }

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

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            setIsProcessing(false);
            toast.error('Please login to request withdrawal');
            return;
        }

        const result = await createWithdrawalRequest(
            user.id,
            bankDetails.accountName,
            user.email || '',
            withdrawAmount,
            bankDetails.bankName || 'Bank',
            bankDetails.accountNumber,
            bankDetails.ifsc
        );

        setIsProcessing(false);

        if (result.success) {
            toast.success('Withdrawal Request Submitted', {
                description: `Amount ₹${withdrawAmount.toLocaleString('en-IN')} will be credited within 3-5 business days.`
            });
            onClose();
        } else {
            toast.error('Failed to submit withdrawal request', {
                description: result.error || 'Please try again'
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-4">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Bill-Based Withdrawal</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Daily Limit Warning */}
                    <div className={`p-3 rounded-xl flex items-start gap-3 ${remainingWithdrawals <= 2 ? 'bg-amber-50 border border-amber-200' : 'bg-blue-50 border border-blue-200'}`}>
                        <Clock className={remainingWithdrawals <= 2 ? 'text-amber-600' : 'text-blue-600'} size={18} />
                        <div>
                            <p className={`text-sm font-semibold ${remainingWithdrawals <= 2 ? 'text-amber-800' : 'text-blue-800'}`}>
                                Daily Withdrawal Limit
                            </p>
                            <p className={`text-xs ${remainingWithdrawals <= 2 ? 'text-amber-600' : 'text-blue-600'}`}>
                                {remainingWithdrawals} of {MAX_DAILY_WITHDRAWALS} withdrawals remaining today
                            </p>
                        </div>
                    </div>

                    {/* Balance Info */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-1">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Available Balance:</span>
                            <span className="font-bold text-slate-800">₹{currentBalance.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200 mt-2">
                            <span className="text-slate-600 font-medium">Max Withdrawal:</span>
                            <span className="font-bold text-teal-600">₹{maxWithdrawal.toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    {/* BILL DETAILS SECTION - NEW */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Receipt size={16} className="text-teal-600" /> Bill Details (Required)
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Bill Type *</label>
                                <select
                                    value={billType}
                                    onChange={(e) => setBillType(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="">Select Bill Type</option>
                                    {BILL_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Bill Number *</label>
                                <input
                                    type="text"
                                    value={billNumber}
                                    onChange={(e) => setBillNumber(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder="e.g. INV-2025-001"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Bill Date *</label>
                                <input
                                    type="date"
                                    value={billDate}
                                    onChange={(e) => setBillDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>

                            <div className="col-span-2 space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Upload Bill / Invoice *</label>
                                <div
                                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${billFile ? 'border-teal-300 bg-teal-50' : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                                        }`}
                                    onClick={() => document.getElementById('billUpload')?.click()}
                                >
                                    <input
                                        type="file"
                                        id="billUpload"
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setBillFile(e.target.files?.[0] || null)}
                                    />
                                    {billFile ? (
                                        <div className="flex items-center justify-center gap-2 text-teal-700">
                                            <FileText size={18} />
                                            <span className="text-sm font-medium">{billFile.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                                            <p className="text-sm text-slate-500">Click to upload bill</p>
                                            <p className="text-xs text-slate-400">PDF, JPG, PNG (max 5MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Withdrawal Amount */}
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
                                <AlertCircle size={12} /> Amount exceeds maximum limit
                            </p>
                        )}
                    </div>

                    {/* Bank Details */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Building size={16} className="text-slate-400" /> Bank Account Details
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500">Account Holder *</label>
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
                                    onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value.toUpperCase() })}
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
                        disabled={isProcessing || !amount || Number(amount) > maxWithdrawal || remainingWithdrawals <= 0}
                        className="px-6 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] justify-center"
                    >
                        {isProcessing ? (
                            <>Processing <Loader2 size={16} className="animate-spin" /></>
                        ) : (
                            'Submit Request'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
