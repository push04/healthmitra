import { ApiResponse, DashboardData } from "@/types/dashboard";

// MOCK DATA
const MOCK_DASHBOARD_DATA: DashboardData = {
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
        validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
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
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
            id: "act-2",
            type: "reimbursement",
            title: "Claim Submitted",
            description: "Amount: ₹1,200",
            status: "pending",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
        {
            id: "act-3",
            type: "purchase",
            title: "Medicine Order",
            description: "Monthly subscription",
            status: "approved",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        },
        {
            id: "act-4",
            type: "wallet_transaction",
            title: "Wallet Top-up",
            description: "Added funds",
            status: "completed",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
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
        {
            id: "notif-3",
            type: "warning",
            title: "Complete Profile",
            message: "Please update your emergency contact details.",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            isRead: false,
        },
    ],
};

export async function fetchDashboardData(supabaseClient?: any): Promise<ApiResponse<DashboardData>> {
    // MOCK DATA - Return immediately for best performance
    return {
        success: true,
        data: MOCK_DASHBOARD_DATA,
    };
}

export async function createServiceRequest(data: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { data: { id: "mock-sr-" + Date.now(), ...data }, error: null };
}

export async function createClaim(data: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { data: { id: "mock-clm-" + Date.now(), ...data }, error: null };
}

export async function markNotificationAsRead(id: string) {
    // No-op for mock
    return;
}
