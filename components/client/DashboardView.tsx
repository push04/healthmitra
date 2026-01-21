"use client";

import { QuickStats } from "@/components/client/QuickStats";
import { QuickActions } from "@/components/client/QuickActions";
import { ActivityFeed } from "@/components/client/ActivityFeed";
import { NotificationsPanel } from "@/components/client/NotificationsPanel";
import { DashboardData } from "@/types/dashboard";

// HARDCODED MOCK DATA - No external dependencies
const MOCK_DATA: DashboardData = {
    user: {
        id: "mock-user-123",
        name: "Demo User",
        email: "demo@healthmitra.com",
        phone: "+91 98765 43210",
        avatar: "",
    },
    activePlan: {
        id: "plan-gold-1",
        name: "Gold Family Protection",
        status: "active",
        validUntil: "2025-12-31",
        daysRemaining: 365,
        coverageAmount: 500000,
    },
    eCardStatus: {
        status: "active",
        totalCards: 4,
        activeCards: 4,
    },
    wallet: {
        balance: 15450,
        currency: "INR",
        minimumBalance: 0,
    },
    pendingRequests: {
        total: 3,
        breakdown: {
            serviceRequests: 2,
            reimbursements: 1,
        },
    },
    recentActivity: [
        {
            id: "act-1",
            type: "service_request",
            title: "Home Doctor Visit",
            description: "General Checkup",
            status: "completed",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
            id: "act-2",
            type: "reimbursement",
            title: "Claim Submitted",
            description: "Amount: ₹1,200",
            status: "pending",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
            id: "act-3",
            type: "purchase",
            title: "Medicine Order",
            description: "Monthly subscription",
            status: "approved",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        },
    ],
    notifications: [
        {
            id: "notif-1",
            type: "success",
            title: "Claim Approved",
            message: "Your reimbursement claim #CLM-2024-001 has been approved.",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            isRead: false,
        },
        {
            id: "notif-2",
            type: "info",
            title: "Plan Renewal",
            message: "Your Gold Plan is active and valid for another 365 days.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            isRead: true,
        },
    ],
};

interface DashboardViewProps {
    initialData?: DashboardData;
}

export function DashboardView({ initialData }: DashboardViewProps) {
    // FORCE USE MOCK DATA - ignore initialData entirely for reliability
    const data = MOCK_DATA;
    const loading = false;
    const markNotificationAsRead = async (id: string) => { };

    const firstName = data.user.name.split(' ')[0];

    return (
        <div className="space-y-10">
            {/* 1. Welcome Banner */}
            <div className="animate-fade-in-up relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 p-8 shadow-2xl text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl animate-float"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30"></div>

                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl font-bold md:text-4xl mb-2 tracking-tight">
                        Welcome back, {firstName}!
                    </h1>
                    <p className="text-teal-50/90 text-lg mb-6">
                        Your health coverage is active. You have <span className="font-bold text-white">{data.notifications.filter(n => !n.isRead).length} new notifications</span>.
                    </p>
                    <div className="flex gap-3 flex-wrap">
                        <button className="btn-premium px-6 py-3 bg-white text-teal-700 font-bold rounded-xl shadow-lg hover:bg-teal-50 hover:scale-105 transition-all active:scale-95">
                            Book Service
                        </button>
                        <button className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all">
                            View Plan
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. Quick Stats */}
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <QuickStats
                    plan={data.activePlan}
                    eCard={data.eCardStatus}
                    wallet={data.wallet}
                    pending={data.pendingRequests}
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
