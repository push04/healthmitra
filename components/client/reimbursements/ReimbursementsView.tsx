'use client';

import React from 'react';
import Link from 'next/link';
import { ReimbursementClaim } from '@/types/reimbursement';
import { Plus, FileText, Activity, AlertCircle, Search, Filter } from 'lucide-react';

interface ReimbursementsViewProps {
    initialClaims: any[];
}

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'approved':
            return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Approved</span>;
        case 'processing':
            return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">Processing</span>;
        case 'rejected':
            return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Rejected</span>;
        default:
            return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">Submitted</span>;
    }
};

export function ReimbursementsView({ initialClaims }: ReimbursementsViewProps) {
    const totalValue = initialClaims.reduce((sum, claim) => sum + (claim.amount || 0), 0);
    const pendingCount = initialClaims.filter(c => c.status === 'processing' || c.status === 'pending').length;
    const settledCount = initialClaims.filter(c => c.status === 'approved' || c.status === 'settled').length;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Reimbursements</h1>
                    <p className="text-slate-500">Track and manage your insurance claims</p>
                </div>
                <Link
                    href="/reimbursements/new"
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-teal-200 transition-all hover:-translate-y-0.5"
                >
                    <Plus size={18} /> New Claim
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-5 rounded-2xl shadow-lg text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-indigo-100 font-medium text-sm">Total Claims Value</p>
                        <h3 className="text-3xl font-bold mt-1">₹{totalValue.toLocaleString()}</h3>
                        <p className="text-xs text-indigo-200 mt-2 bg-white/10 inline-block px-2 py-1 rounded">{initialClaims.length} Claims total</p>
                    </div>
                    <Activity className="absolute bottom-[-10px] right-[-10px] w-24 h-24 text-white opacity-10" />
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Pending Processing</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{pendingCount}</h3>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <ClockIcon size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Settled Claims</p>
                            <h3 className="text-2xl font-bold text-slate-800 mt-1">{settledCount}</h3>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircleIcon size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Claims List */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="min-w-full overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Claim ID</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-xs uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {initialClaims.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No claims found. Create a new claim to get started.
                                    </td>
                                </tr>
                            ) : (
                                initialClaims.map((claim) => (
                                    <tr key={claim.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm font-medium text-slate-800">{claim.id.slice(0, 8)}...</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-slate-700">{claim.claim_type || claim.type || 'General'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-slate-500">{new Date(claim.created_at).toISOString().split('T')[0]}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-800">₹{claim.amount?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={claim.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center justify-end gap-1 ml-auto">
                                                View Details <FileText size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

const ClockIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);

const CheckCircleIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
);
