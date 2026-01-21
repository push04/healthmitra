'use client';

import React from 'react';
import { MOCK_TRANSACTIONS, TransactionType } from '@/types/wallet';
import { ArrowDownLeft, ArrowUpRight, Search, Filter, Calendar } from 'lucide-react';

export default function TransactionHistory() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header / Filters */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Recent Transactions</h3>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-48">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                    <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:border-slate-300">
                        <Filter size={16} />
                    </button>
                    <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:border-slate-300">
                        <Calendar size={16} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100">
                {MOCK_TRANSACTIONS.map((txn) => (
                    <div key={txn.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${txn.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {txn.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                            </div>

                            <div>
                                <p className="font-medium text-slate-800 text-sm">{txn.description}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-slate-400">{txn.date}</span>
                                    {txn.status === 'pending' && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded font-bold uppercase">Pending</span>}
                                    {txn.status === 'failed' && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 rounded font-bold uppercase">Failed</span>}
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{txn.referenceId}</p>
                            </div>
                        </div>

                        <div className={`font-bold text-sm ${txn.type === 'credit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {txn.type === 'credit' ? '+' : '-'} ₹{txn.amount.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <button className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                    View All Transactions
                </button>
            </div>
        </div>
    );
}
