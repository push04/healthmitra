'use client';

import React, { useState } from 'react';
import { Wallet, Upload, Download, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import AddMoneyModal from '@/components/client/wallet/AddMoneyModal';
import WithdrawalModal from '@/components/client/wallet/WithdrawalModal';
import TransactionHistory from '@/components/client/wallet/TransactionHistory';

interface WalletViewProps {
    wallet: any;
    stats: any;
}

export function WalletView({ wallet, stats }: WalletViewProps) {
    const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

    const balance = wallet?.balance || 0;

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">My Wallet</h1>
                <p className="text-slate-500 text-sm">Manage your wallet balance and transactions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Col: Balance Card & Actions */}
                <div className="md:col-span-2 space-y-6">
                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg shadow-teal-200/50 relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-emerald-100 font-medium text-sm mb-2 flex items-center gap-2">
                                <Wallet size={16} /> WALLET BALANCE
                            </h2>
                            <div className="text-4xl font-bold mb-1">₹ {balance.toLocaleString('en-US')}</div>
                            <p className="text-emerald-100 text-xs mb-8">Available Balance</p>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => setIsAddMoneyOpen(true)}
                                    className="bg-white text-teal-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <Upload size={16} /> Add Money
                                </button>
                                <button
                                    onClick={() => setIsWithdrawOpen(true)}
                                    className="bg-teal-700/50 hover:bg-teal-700 text-white border border-teal-400/30 px-6 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 backdrop-blur-sm"
                                >
                                    <Download size={16} /> Request Withdrawal
                                </button>
                            </div>
                        </div>

                        {/* Decorative Circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl"></div>
                        <div className="absolute bottom-4 right-6 text-xs text-white/60 bg-black/10 px-3 py-1 rounded-full">
                            Min balance restriction: ₹1.00
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><ArrowDownLeft size={12} /></span>
                                CREDITED
                            </div>
                            <p className="text-lg font-bold text-slate-800">₹{stats.totalCredited.toLocaleString('en-US')}</p>
                            <p className="text-xs text-slate-400 mt-1">{stats.creditedCount} txns</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"><ArrowUpRight size={12} /></span>
                                DEBITED
                            </div>
                            <p className="text-lg font-bold text-slate-800">₹{stats.totalDebited.toLocaleString('en-US')}</p>
                            <p className="text-xs text-slate-400 mt-1">{stats.debitedCount} txns</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><RefreshCw size={12} /></span>
                                THIS MONTH
                            </div>
                            <p className="text-lg font-bold text-slate-800">₹{stats.thisMonthSpend.toLocaleString('en-US')}</p>
                            <p className="text-xs text-slate-400 mt-1">{stats.thisMonthCount} txns</p>
                        </div>
                    </div>

                    <TransactionHistory />
                </div>

                {/* Right Col: Promotions/Info */}
                <div className="hidden md:block md:col-span-1 space-y-6">
                    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 text-white text-center">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">+</div>
                        <h3 className="font-bold mb-2">Refer & Earn</h3>
                        <p className="text-sm text-slate-300 mb-4">Invite friends to Healthmitra and earn ₹500 for each successful referral.</p>
                        <button className="w-full py-2 bg-white text-slate-900 rounded-lg font-bold text-sm hover:bg-slate-100 transition-colors">
                            Invite Now
                        </button>
                    </div>

                    <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6">
                        <h3 className="font-bold text-sky-900 mb-2 text-sm">Need Help?</h3>
                        <p className="text-xs text-sky-800 mb-4">Having trouble with your wallet balance or transaction? Contact our support team.</p>
                        <button className="text-xs font-bold text-sky-600 hover:text-sky-700">Contact Support →</button>
                    </div>
                </div>

            </div>

            {/* Modals */}
            <AddMoneyModal
                isOpen={isAddMoneyOpen}
                onClose={() => setIsAddMoneyOpen(false)}
                currentBalance={balance}
            />

            <WithdrawalModal
                isOpen={isWithdrawOpen}
                onClose={() => setIsWithdrawOpen(false)}
                currentBalance={balance}
            />
        </div>
    );
}
