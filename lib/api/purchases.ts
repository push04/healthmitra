import { PurchasesResponse, CreateMemberData } from "@/types/purchase";

// Mock Data for fallback/initial development
const MOCK_PURCHASES: PurchasesResponse = {
    success: true,
    data: {
        plans: [
            {
                id: "plan_001",
                name: "Gold Health Plan",
                planId: "HLTH-2024-001",
                policyNumber: "POL-88776655",
                status: "active",
                purchaseDate: "2024-01-15T00:00:00Z",
                validFrom: "2024-01-15T00:00:00Z",
                validUntil: "2025-12-31T23:59:59Z",
                daysRemaining: 345,
                coverageAmount: 500000,
                membersCount: 4,
                membersCovered: 4,
                transactionId: "TXN-20240115-ABC123",
                amountPaid: 12500,
                paymentMode: "UPI",
                benefits: [
                    { id: "b1", text: "Free health checkups" },
                    { id: "b2", text: "Telemedicine" },
                    { id: "b3", text: "Cashless hospitalization" },
                    { id: "b4", text: "Ambulance service" },
                    { id: "b5", text: "Reimbursement up to 80%" },
                    { id: "b6", text: "24/7 support" }
                ],
                coverage: [
                    {
                        type: "OPD Consultation",
                        limit: 25000,
                        used: 4200,
                        balance: 20800
                    }
                ],
                members: [
                    {
                        id: "mem_001",
                        name: "Rajesh Kumar",
                        relation: "Self",
                        age: 35,
                        gender: "Male",
                        hasECard: true
                    }
                ],
                documents: [
                    {
                        id: "doc_001",
                        name: "Policy Document.pdf",
                        url: "#",
                        size: 2400000,
                        uploadedAt: "2024-01-15T10:00:00Z"
                    }
                ]
            }
        ],
        stats: {
            active: 1,
            expired: 0,
            total: 1
        }
    }
};

export async function fetchPurchases(params?: { status?: string; search?: string; sort?: string }): Promise<PurchasesResponse> {
    // In a real app, this would be:
    // const searchParams = new URLSearchParams(params as any);
    // const res = await fetch(`/api/client/purchases?${searchParams}`);
    // return res.json();

    // For now, return mock data with delay
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_PURCHASES), 500);
    });
}

export async function addPlanMember(data: CreateMemberData): Promise<{ success: boolean; data: any }> {
    console.log("Adding member:", data);
    return new Promise((resolve) => setTimeout(() => resolve({ success: true, data: { ...data, id: "new_mem_" + Date.now() } }), 1000));
}

export async function updatePlanMember(memberId: string, data: Partial<CreateMemberData>): Promise<{ success: boolean }> {
    console.log("Updating member:", memberId, data);
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
}
