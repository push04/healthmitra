"use client";

import Link from "next/link";
import { QuickStats } from "@/components/client/QuickStats";
import { QuickActions } from "@/components/client/QuickActions";
import { ActivityFeed } from "@/components/client/ActivityFeed";
import { NotificationsPanel } from "@/components/client/NotificationsPanel";
import { DashboardData } from "@/types/dashboard";

// Empty-state fallback when API returns no data
const DEFAULT_EMPTY_DATA: DashboardData = {
    user: {
        id: "guest",
        name: "Guest User",
        email: "guest@example.com",
        phone: "",
        avatar: "",
    },
    activePlan: {
        id: "no-plan",
        name: "No Active Plan",
        status: "expired" as const,
        validUntil: "",
        daysRemaining: 0,
        coverageAmount: 0,
    },
    eCardStatus: {
        status: "pending" as const,
        totalCards: 0,
        activeCards: 0,
    },
    wallet: {
        balance: 0,
        currency: "INR",
        minimumBalance: 0,
    },
    vouchers: {
        available: 0,
        used: 0,
        expired: 0,
        totalValue: 0,
    },
    services: {
        activeServices: 0,
        completedThisMonth: 0,
        pendingApproval: 0,
    },
    members: {
        totalMembers: 0,
        withActiveCards: 0,
        familyMembers: [],
    },
    reimbursementSummary: {
        totalClaimed: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
    },
    pendingRequests: {
        total: 0,
        breakdown: {
            serviceRequests: 0,
            reimbursements: 0,
        },
    },
    recentActivity: [],
    notifications: [],
};

interface DashboardViewProps {
    initialData?: DashboardData;
}

export function DashboardView({ initialData }: DashboardViewProps) {
    // USE REAL DATA
    const data = initialData || DEFAULT_EMPTY_DATA;
    const loading = false;
    const markNotificationAsRead = async (id: string) => { };

    const firstName = data.user.name?.split(' ')[0] || 'User';
    const hasActivePlan = data.activePlan?.id && data.activePlan?.id !== 'no-plan';

    return (
        <div className="space-y-10">
            {/* 1. Welcome Banner */}
            <div className={`animate-fade-in-up relative overflow-hidden rounded-3xl p-8 shadow-2xl text-white ${
                hasActivePlan 
                    ? 'bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600' 
                    : 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600'
            }`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl animate-float"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30"></div>

                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl font-bold md:text-4xl mb-2 tracking-tight">
                        Welcome back, {firstName}!
                    </h1>
                    <p className="text-lg mb-6">
                        {data.activePlan?.id && data.activePlan?.id !== 'no-plan' ? (
                            <span className="text-teal-50/90">
                                Your health coverage is <span className="font-bold text-white bg-green-500/30 px-2 py-0.5 rounded">ACTIVE</span>. You have <span className="font-bold text-white">{data.notifications.filter(n => !n.isRead).length} new notifications</span>.
                            </span>
                        ) : (
                            <span className="text-red-200">
                                Your health coverage is <span className="font-bold text-white bg-red-500/80 px-2 py-0.5 rounded">INACTIVE</span>. You have no active plan. <Link href="/shop/plans" className="underline hover:text-white">Buy a plan now</Link>
                            </span>
                        )}
                    </p>
                    <div className="flex gap-3 flex-wrap">
                        <Link href="/service-requests/new" className="btn-premium px-6 py-3 bg-white text-teal-700 font-bold rounded-xl shadow-lg hover:bg-teal-50 hover:scale-105 transition-all active:scale-95">
                            Book Service
                        </Link>
                        <Link href={data.activePlan?.id && data.activePlan?.id !== 'no-plan' ? '/my-purchases' : '/shop/plans'} className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all">
                            {data.activePlan?.id && data.activePlan?.id !== 'no-plan' ? 'View Plan' : 'Browse Plans'}
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. Quick Stats - Now with 8 cards */}
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <QuickStats
                    plan={data.activePlan}
                    eCard={data.eCardStatus}
                    wallet={data.wallet}
                    pending={data.pendingRequests}
                    vouchers={data.vouchers}
                    services={data.services}
                    members={data.members}
                    reimbursement={data.reimbursementSummary}
                    loading={loading}
                />
            </div>

            {/* 3. Quick Actions */}
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <QuickActions />
            </div>

            {/* 4. Activity Feed & Notifications */}
            <div className="grid gap-6 lg:grid-cols-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <ActivityFeed activities={data.recentActivity} loading={loading} />
                <NotificationsPanel
                    notifications={data.notifications}
                    loading={loading}
                    onMarkRead={markNotificationAsRead}
                />
            </div>
        </div>
    );
}
