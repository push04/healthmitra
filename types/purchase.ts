export type PlanStatus = 'active' | 'expired' | 'expiring_soon';

export interface PlanCoverage {
    type: string;
    limit: number;
    used: number;
    balance: number;
}

export interface PlanMember {
    id: string;
    name: string;
    relation: string;
    age: number;
    gender: string;
    hasECard: boolean;
}

export interface PlanDocument {
    id: string;
    name: string;
    url: string;
    size: number;
    uploadedAt: string;
}

export interface PurchasedPlan {
    id: string;
    name: string;
    planId: string;
    policyNumber: string; // Added field
    status: PlanStatus;
    purchaseDate: string;
    validFrom: string;
    validUntil: string;
    daysRemaining: number;
    coverageAmount: number;
    membersCount: number;
    membersCovered: number; // Added field
    transactionId: string;
    amountPaid: number;
    paymentMode: string;
    benefits: { id: string; text: string }[];
    coverage: PlanCoverage[];
    members: PlanMember[];
    documents: PlanDocument[];
}

export interface PurchaseStats {
    active: number;
    expired: number;
    total: number;
}

export interface PurchasesResponse {
    success: boolean;
    data: {
        plans: PurchasedPlan[];
        stats: PurchaseStats;
    };
}

export interface CreateMemberData {
    planId: string;
    name: string;
    dob: string;
    gender: string;
    relationship: string;
    mobile?: string;
    bloodGroup?: string;
    height?: number;
    weight?: number;
    conditions?: string;
    nomineeName?: string;
    nomineeRelation?: string;
}
