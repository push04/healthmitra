export type ClaimStatus = 'submitted' | 'processing' | 'approved' | 'rejected' | 'under-review';
export type ClaimType = 'medicine' | 'diagnostic' | 'opd' | 'hospitalization';

export interface ReimbursementClaim {
    id: string;
    claimId: string;
    type: ClaimType;
    patientName: string;
    patientId: string;
    patientAge: number;
    patientRelation: string;
    hospitalName: string; // or pharmacy/lab name
    treatmentDate: string;
    submittedAt: string;
    updatedAt: string;
    amount: number;
    approvedAmount?: number;
    reimbursementPercentage?: number;
    diagnosis: string;
    status: ClaimStatus;
    documents: {
        name: string;
        type: string;
        url: string;
        size: string;
    }[];
    timeline: {
        status: string;
        date: string;
        isCompleted: boolean;
    }[];
    adminReview?: {
        reviewedBy: string;
        reviewedAt: string;
        comments: string;
        status: 'approved' | 'rejected';
        rejectionReason?: string;
        requiredActions?: string[];
    };
    payment?: {
        creditedTo: string;
        amount: number;
        transactionId: string;
        date: string;
    };
}
