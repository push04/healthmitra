"use client";

import Link from "next/link";
import {
    Stethoscope,
    FlaskConical,
    Pill,
    Ambulance,
    Receipt,
    CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIONS = [
    { icon: Stethoscope, label: 'Medical Consultation', href: '/service-requests/new?type=medical', color: 'text-teal-600', bg: 'bg-teal-50', border: 'hover:border-teal-300 hover:bg-teal-50' },
    { icon: FlaskConical, label: 'Book Test', href: '/service-requests/new?type=diagnostic', color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-300 hover:bg-blue-50' },
    { icon: Pill, label: 'Order Medicine', href: '/service-requests/new?type=medicine', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-300 hover:bg-emerald-50' },
    { icon: Ambulance, label: 'Ambulance', href: '/service-requests/new?type=ambulance', color: 'text-red-600', bg: 'bg-red-50', border: 'hover:border-red-300 hover:bg-red-50' },
    { icon: Receipt, label: 'Reimbursement', href: '/reimbursements/new', color: 'text-amber-600', bg: 'bg-amber-50', border: 'hover:border-amber-300 hover:bg-amber-50' },
    { icon: CreditCard, label: 'View E-Card', href: '/e-cards', color: 'text-purple-600', bg: 'bg-purple-50', border: 'hover:border-purple-300 hover:bg-purple-50' }
];

export function QuickActions() {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-6">
                {ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.label}
                            href={action.href}
                            className={cn(
                                "flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-4 transition-all duration-200 shadow-sm md:min-h-[120px]",
                                "hover:shadow-md hover:scale-105 active:scale-95",
                                action.border // Applying specific hover colors
                            )}
                        >
                            <div className={cn("mb-3 rounded-full p-2.5", action.bg)}>
                                <Icon className={cn("size-6", action.color)} />
                            </div>
                            <span className="text-center text-sm font-medium text-slate-700">
                                {action.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
