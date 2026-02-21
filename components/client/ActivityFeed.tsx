"use client";

import { RecentActivity } from "@/types/dashboard";
import {
    Stethoscope,
    Receipt,
    Wallet,
    CreditCard,
    ShoppingBag,
    Activity
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ActivityFeedProps {
    activities?: RecentActivity[];
    loading?: boolean;
}

const getActivityIcon = (type: string) => {
    switch (type) {
        case 'service_request': return { icon: Stethoscope, bg: 'bg-blue-100', text: 'text-blue-600' };
        case 'reimbursement': return { icon: Receipt, bg: 'bg-emerald-100', text: 'text-emerald-600' };
        case 'wallet_transaction': return { icon: Wallet, bg: 'bg-purple-100', text: 'text-purple-600' };
        case 'e_card': return { icon: CreditCard, bg: 'bg-teal-100', text: 'text-teal-600' };
        case 'purchase': return { icon: ShoppingBag, bg: 'bg-amber-100', text: 'text-amber-600' };
        default: return { icon: Activity, bg: 'bg-slate-100', text: 'text-slate-600' };
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed': case 'approved': return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200";
        case 'pending': return "bg-amber-100 text-amber-700 hover:bg-amber-200";
        case 'rejected': return "bg-red-100 text-red-700 hover:bg-red-200";
        default: return "bg-slate-100 text-slate-700 hover:bg-slate-200";
    }
};

export function ActivityFeed({ activities = [], loading }: ActivityFeedProps) {
    if (loading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm min-h-[400px]">
                <div className="mb-6 h-6 w-32 rounded bg-slate-100" />
                <div className="space-y-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md h-full">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
                <Link href="/service-requests" className="text-sm font-medium text-teal-600 hover:underline">
                    View All
                </Link>
            </div>

            {!activities || activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="mb-4 size-16 text-slate-200" />
                    <p className="text-lg font-medium text-slate-500">No recent activity</p>
                    <p className="text-sm text-slate-400">Your activities will appear here</p>
                </div>
            ) : (
                <div className="relative space-y-0">
                    {activities.map((activity, index) => {
                        const { icon: Icon, bg, text } = getActivityIcon(activity.type);
                        const isLast = index === activities.length - 1;

                        return (
                            <div
                                key={activity.id}
                                className="relative flex gap-4 pb-8 last:pb-0 group cursor-pointer"
                                onClick={() => {
                                    // Simple navigation logic based on type
                                    let path = '/dashboard';
                                    switch (activity.type) {
                                        case 'service_request': path = '/service-requests'; break;
                                        case 'reimbursement': path = '/reimbursements'; break;
                                        case 'e_card': path = '/e-cards'; break;
                                        case 'wallet_transaction': path = '/wallet'; break;
                                        default: path = '/dashboard';
                                    }
                                    // Use standard anchor navigation or Next.js router if available in parent
                                    // For now, ensuring correct path
                                    window.location.href = path;
                                }}
                            >
                                {/* Timeline Line */}
                                {!isLast && (
                                    <div className="absolute left-5 top-10 h-full w-0.5 bg-slate-200 group-hover:bg-slate-300 transition-colors" />
                                )}

                                {/* Icon */}
                                <div className={cn("relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110 shadow-sm", bg, text)}>
                                    <Icon className="h-5 w-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-1">
                                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                                        <h3 className="text-sm font-medium text-slate-700 group-hover:text-teal-700 transition-colors">
                                            {activity.title}
                                        </h3>
                                        <Badge variant="secondary" className={cn("text-[10px] uppercase h-5", getStatusColor(activity.status))}>
                                            {activity.status.replace('_', ' ')}
                                        </Badge>
                                    </div>

                                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{activity.description}</p>

                                    <p className="mt-1.5 text-xs font-medium text-slate-400">
                                        {(() => {
                                            const date = new Date(activity.timestamp);
                                            const day = date.getDate();
                                            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                            const month = months[date.getMonth()];
                                            return `${day} ${month}`;
                                        })()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
