'use client';

import React from 'react';
import { ShoppingBag, Calendar, CheckCircle, AlertCircle, Eye, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface MyPurchasesViewProps {
    purchases: any[];
}

export function MyPurchasesView({ purchases }: MyPurchasesViewProps) {
    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">My Purchases</h1>
                <p className="text-slate-500 text-sm">History of all plans and services purchased</p>
            </div>

            <div className="space-y-4">
                {purchases.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No purchases yet</h3>
                        <p className="text-slate-500">You haven't purchased any plans or services.</p>
                    </div>
                ) : (
                    purchases.map((purchase) => (
                        <div key={purchase.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
                                        <ShoppingBag size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800">{purchase.plans?.name || 'Health Plan'}</h3>
                                            <Badge variant={purchase.status === 'active' ? 'default' : 'secondary'} className={purchase.status === 'active' ? 'bg-emerald-100 text-emerald-700' : ''}>
                                                {purchase.status}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                Purchased: {new Date(purchase.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <CheckCircle size={14} />
                                                Valid until: {new Date(purchase.valid_until).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-right">
                                        <span className="text-2xl font-bold text-slate-800">₹{purchase.amount || purchase.plans?.price || 0}</span>
                                        <p className="text-xs text-slate-500">Inclusive of taxes</p>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto mt-2">
                                        <Link href={`/invoices`} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
                                            <Download size={14} /> Invoice
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
