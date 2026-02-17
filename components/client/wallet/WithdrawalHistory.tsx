'use client';

import React from 'react';
import { Download, Building2, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface WithdrawalRecord {
    id: string;
    requestId: string;
    requestedDate: string;
    updatedDate: string;
    amount: number;
    bankAccount: string; // censored
    bankName: string;
    status: 'pending' | 'approved' | 'rejected';
    utr?: string;
    rejectionReason?: string;
}

interface WithdrawalHistoryProps {
    withdrawals?: WithdrawalRecord[];
}

export default function WithdrawalHistory({ withdrawals = [] }: WithdrawalHistoryProps) {
    return (
        <div className="space-y-4">
            {withdrawals.length === 0 ? (
                <div className="p-8 text-center text-slate-400">No withdrawal history</div>
            ) : withdrawals.map((wd) => (
                <div key={wd.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <span className="text-lg">💸</span> WITHDRAWAL REQUEST
                                </h4>
                                {wd.status === 'approved' && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Approved</span>
                                )}
                                {wd.status === 'pending' && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Under Review</span>
                                )}
                                {wd.status === 'rejected' && (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">Rejected</span>
                                )}
                            </div>

                            <div className="text-xs text-slate-500 space-x-3">
                                <span className="font-mono text-slate-600">{wd.requestId}</span>
                                <span>|</span>
                                <span>Requested: {wd.requestedDate}</span>
                            </div>

                            <div className="flex items-start gap-4 pt-2">
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Withdrawal Amount</p>
                                    <p className="text-lg font-bold text-slate-800">₹{wd.amount.toLocaleString('en-US')}</p>
                                </div>
                                <div className="border-l border-slate-100 pl-4">
                                    <p className="text-xs text-slate-500 mb-0.5">Bank Details</p>
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                        <Building2 size={14} className="text-slate-400" />
                                        {wd.bankName} ({wd.bankAccount})
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Details Right Side */}
                        <div className="md:border-l border-slate-100 md:pl-6 flex flex-col justify-center min-w-[200px]">
                            {wd.status === 'approved' && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                                        <CheckCircle size={14} /> Approved & Processed
                                    </p>
                                    <div className="text-xs text-slate-500">
                                        <p>UTR: {wd.utr}</p>
                                        <p>Credited On: {wd.updatedDate}</p>
                                    </div>
                                    <button className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1 mt-1">
                                        <Download size={14} /> Download Receipt
                                    </button>
                                </div>
                            )}

                            {wd.status === 'pending' && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                                        <Clock size={14} /> Processing
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Expected by: Jan 20, 2025
                                    </p>
                                </div>
                            )}

                            {wd.status === 'rejected' && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                                        <XCircle size={14} /> Rejected
                                    </p>
                                    <p className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-100">
                                        Reason: {wd.rejectionReason}
                                    </p>
                                    <button className="text-xs font-bold text-slate-600 hover:text-slate-800 border border-slate-200 px-3 py-1 rounded bg-slate-50 hover:bg-slate-100 transition-colors">
                                        Contact Support
                                    </button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
