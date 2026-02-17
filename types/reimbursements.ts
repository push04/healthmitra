export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface ReimbursementClaim {
    id: string;
    claimId: string; // CLM-2025...
    status: ClaimStatus;

    customerId: string;
    customerName: string;
    planName: string;

    title: string;
    amount: number;
    approvedAmount?: number;

    billDate: string;
    providerName: string; // Pharmacy/Hospital name

    submittedAt: string;
    documents: { name: string; type: string; url: string }[];

    adminNotes?: string;
    customerComments?: string;
}
