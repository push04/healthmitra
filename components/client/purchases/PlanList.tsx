"use client";

import { useState } from "react";
import { PurchasedPlan } from "@/types/purchase";
import { PlanCard } from "./PlanCard";
import { cn } from "@/lib/utils";

interface PlanListProps {
    initialPlans: PurchasedPlan[];
}

export function PlanList({ initialPlans }: PlanListProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired'>('active');

    const filteredPlans = initialPlans.filter(plan => {
        if (activeTab === 'all') return true;
        return plan.status === activeTab || (activeTab === 'active' && plan.status === 'expiring_soon');
    });

    const counts = {
        all: initialPlans.length,
        active: initialPlans.filter(p => p.status === 'active' || p.status === 'expiring_soon').length,
        expired: initialPlans.filter(p => p.status === 'expired').length
    };

    return (
        <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('active')}
                    className={cn(
                        "px-4 py-3 text-sm font-medium transition-colors border-b-2",
                        activeTab === 'active'
                            ? "text-teal-600 border-teal-600 bg-teal-50/50"
                            : "text-slate-600 border-transparent hover:text-slate-800"
                    )}
                >
                    Active Plans ({counts.active})
                </button>
                <button
                    onClick={() => setActiveTab('expired')}
                    className={cn(
                        "px-4 py-3 text-sm font-medium transition-colors border-b-2",
                        activeTab === 'expired'
                            ? "text-teal-600 border-teal-600 bg-teal-50/50"
                            : "text-slate-600 border-transparent hover:text-slate-800"
                    )}
                >
                    Expired Plans ({counts.expired})
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={cn(
                        "px-4 py-3 text-sm font-medium transition-colors border-b-2",
                        activeTab === 'all'
                            ? "text-teal-600 border-teal-600 bg-teal-50/50"
                            : "text-slate-600 border-transparent hover:text-slate-800"
                    )}
                >
                    All Plans ({counts.all})
                </button>
            </div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 gap-6">
                {filteredPlans.length > 0 ? (
                    filteredPlans.map(plan => (
                        <PlanCard key={plan.id} plan={plan} />
                    ))
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                        <p className="text-slate-500">No plans found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
