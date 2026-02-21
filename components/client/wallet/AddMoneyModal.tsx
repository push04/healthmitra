'use client';

import React, { useState, useEffect } from 'react';
import { X, CreditCard, Wallet, Smartphone, Globe, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { loadRazorpay } from '@/lib/razorpay';

interface AddMoneyModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentBalance: number;
    onSuccess?: () => void;
}

export default function AddMoneyModal({ isOpen, onClose, currentBalance, onSuccess }: AddMoneyModalProps) {
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<string>('upi');
    const [isProcessing, setIsProcessing] = useState(false);
    const [razorpayEnabled, setRazorpayEnabled] = useState(false);
    const [razorpayKeyId, setRazorpayKeyId] = useState('');
    const supabase = createClient();

    useEffect(() => {
        const fetchRazorpaySettings = async () => {
            const { data } = await supabase
                .from('system_settings')
                .select('key, value')
                .in('key', ['razorpay_enabled', 'razorpay_key_id']);
            
            if (data) {
                const enabled = data.find(s => s.key === 'razorpay_enabled')?.value === 'true';
                const keyId = data.find(s => s.key === 'razorpay_key_id')?.value || '';
                setRazorpayEnabled(enabled);
                setRazorpayKeyId(keyId);
            }
        };
        if (isOpen) fetchRazorpaySettings();
    }, [isOpen]);

    if (!isOpen) return null;

    const quickAmounts = [500, 1000, 2000, 5000, 10000];

    const handleTestPayment = async () => {
        if (!amount || Number(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsProcessing(true);
        
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Please login to add money');
                setIsProcessing(false);
                return;
            }

            // Check if wallet exists, if not create one
            const { data: existingWallet } = await supabase
                .from('wallets')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (!existingWallet) {
                const { error: createWalletError } = await supabase
                    .from('wallets')
                    .insert({
                        user_id: user.id,
                        balance: Number(amount),
                    });

                if (createWalletError) {
                    console.error('Wallet creation error:', createWalletError);
                    toast.error('Failed to create wallet: ' + createWalletError.message);
                    setIsProcessing(false);
                    return;
                }
            } else {
                // Update wallet balance
                const newBalance = (existingWallet.balance || 0) + Number(amount);
                const { error: updateError } = await supabase
                    .from('wallets')
                    .update({
                        balance: newBalance,
                    })
                    .eq('user_id', user.id);

                if (updateError) {
                    console.error('Wallet update error:', updateError);
                    toast.error('Failed to add money: ' + updateError.message);
                    setIsProcessing(false);
                    return;
                }
            }

            toast.success('Money added to wallet!', {
                description: `₹${Number(amount).toLocaleString('en-US')} credited successfully.`
            });
            
            if (onSuccess) onSuccess();
            onClose();
            setAmount('');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Something went wrong');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRazorpayPayment = async () => {
        if (!amount || Number(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setIsProcessing(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Please login to add money');
                setIsProcessing(false);
                return;
            }

            // Create order via API
            const response = await fetch('/api/wallet/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Number(amount),
                }),
            });

            const result = await response.json();

            if (!result.success) {
                toast.error(result.error || 'Failed to create payment order');
                setIsProcessing(false);
                return;
            }

            // Load Razorpay
            const razorpay = await loadRazorpay(result.data.keyId);

            const options = {
                key: result.data.keyId,
                amount: result.data.amount,
                currency: result.data.currency,
                name: 'HealthMitra',
                description: 'Wallet Top-up',
                order_id: result.data.orderId,
                handler: async (response: any) => {
                    // Payment successful - update wallet
                    const { data: existingWallet } = await supabase
                        .from('wallets')
                        .select('balance')
                        .eq('user_id', user.id)
                        .single();
                    
                    const currentBal = existingWallet?.balance || 0;
                    const newBalance = currentBal + Number(amount);
                    
                    await supabase
                        .from('wallets')
                        .update({
                            balance: newBalance,
                        })
                        .eq('user_id', user.id);

                    toast.success('Money added to wallet!', {
                        description: `₹${Number(amount).toLocaleString('en-US')} credited successfully.`
                    });
                    
                    if (onSuccess) onSuccess();
                    onClose();
                    setAmount('');
                },
                prefill: {
                    name: user.email?.split('@')[0] || '',
                    email: user.email || '',
                },
                theme: {
                    color: '#0d9488',
                },
            };

            razorpay.open(options);
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Payment failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePayment = () => {
        if (razorpayEnabled && razorpayKeyId) {
            handleRazorpayPayment();
        } else {
            handleTestPayment();
        }
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
                    {/* Payment Mode Indicator */}
                    <div className={`p-3 rounded-lg ${razorpayEnabled ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                        <div className="flex items-center gap-2">
                            {razorpayEnabled ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <span className="text-amber-600 text-sm font-medium">TEST MODE</span>
                            )}
                            <span className={`text-sm ${razorpayEnabled ? 'text-green-700' : 'text-amber-700'}`}>
                                {razorpayEnabled ? 'Live Payment - Real money will be deducted' : 'Test Mode - No real payment'}
                            </span>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-slate-500 mb-1">Current Balance</p>
                        <p className="text-2xl font-bold text-slate-800">₹ {currentBalance.toLocaleString('en-US')}</p>
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
                                    ₹{amt.toLocaleString('en-US')}
                                </button>
                            ))}
                        </div>

                        {razorpayEnabled && (
                            <div className="space-y-3 pt-2">
                                <label className="text-sm font-semibold text-slate-700">Select Payment Method *</label>
                                <div className="space-y-2">
                                    {[
                                        { id: 'upi', label: 'UPI', icon: Smartphone },
                                        { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                                        { id: 'netbanking', label: 'Net Banking', icon: Globe },
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
                        )}
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
                        ) : razorpayEnabled ? (
                            `Pay ₹${Number(amount || 0).toLocaleString('en-US')}`
                        ) : (
                            'Add Money (Test)'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
