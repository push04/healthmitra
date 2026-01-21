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

export const MOCK_CLAIMS: ReimbursementClaim[] = [
    {
        id: 'c1',
        claimId: 'CLM-2025-0115-001',
        type: 'medicine',
        patientName: 'Rajesh Kumar',
        patientId: 'HM-2024-001',
        patientAge: 35,
        patientRelation: 'Self',
        hospitalName: 'Apollo Pharmacy',
        treatmentDate: 'Jan 12, 2025',
        submittedAt: 'Jan 15, 2025',
        updatedAt: 'Jan 16, 2025',
        amount: 1250,
        approvedAmount: 1250,
        reimbursementPercentage: 100,
        diagnosis: 'Viral Fever Medication',
        status: 'approved',
        documents: [
            { name: 'prescription.pdf', type: 'Prescription', url: '#', size: '856 KB' },
            { name: 'invoice.pdf', type: 'Invoice', url: '#', size: '1.2 MB' },
            { name: 'payment_receipt.jpg', type: 'Receipt', url: '#', size: '450 KB' }
        ],
        timeline: [
            { status: 'Submitted', date: 'Jan 15, 02:30 PM', isCompleted: true },
            { status: 'Under Review', date: 'Jan 15, 04:00 PM', isCompleted: true },
            { status: 'Approved', date: 'Jan 16, 11:45 AM', isCompleted: true },
            { status: 'Amount Credited', date: 'Jan 16, 11:45 AM', isCompleted: true }
        ],
        adminReview: {
            reviewedBy: 'Claims Team',
            reviewedAt: 'Jan 16, 2025 at 11:45 AM',
            comments: 'All documents verified successfully. Prescription is valid and matches the invoice. Full amount of ₹1,250 has been approved and credited to your wallet. Documents have been saved to your Personal Health Records under "Prescriptions" category.',
            status: 'approved'
        },
        payment: {
            creditedTo: 'Healthmitra Wallet',
            amount: 1250,
            transactionId: 'TXN-2025-0116-XYZ789',
            date: 'Jan 16, 2025 at 11:45 AM'
        }
    },
    {
        id: 'c2',
        claimId: 'CLM-2025-0119-002',
        type: 'diagnostic',
        patientName: 'Priya Kumar',
        patientId: 'HM-2024-002',
        patientAge: 32,
        patientRelation: 'Spouse',
        hospitalName: 'Dr. Lal PathLabs',
        treatmentDate: 'Jan 18, 2025',
        submittedAt: 'Jan 19, 2025',
        updatedAt: 'Jan 19, 2025',
        amount: 2500,
        diagnosis: 'Full Body Checkup',
        status: 'processing',
        documents: [
            { name: 'bill.pdf', type: 'Invoice', url: '#', size: '1.5 MB' }
        ],
        timeline: [
            { status: 'Submitted', date: 'Jan 19, 10:00 AM', isCompleted: true },
            { status: 'Under Review', date: 'Pending', isCompleted: false },
            { status: 'Decision', date: 'Pending', isCompleted: false },
            { status: 'Credited', date: 'Pending', isCompleted: false }
        ]
    },
    {
        id: 'c3',
        claimId: 'CLM-2025-0110-005',
        type: 'opd',
        patientName: 'Rajesh Kumar',
        patientId: 'HM-2024-001',
        patientAge: 35,
        patientRelation: 'Self',
        hospitalName: 'Max Hospital',
        treatmentDate: 'Jan 05, 2025',
        submittedAt: 'Jan 08, 2025',
        updatedAt: 'Jan 10, 2025',
        amount: 1750,
        diagnosis: 'General Physician',
        status: 'rejected',
        documents: [
            { name: 'invoice.pdf', type: 'Invoice', url: '#', size: '1.1 MB' }
        ],
        timeline: [
            { status: 'Submitted', date: 'Jan 08, 09:30 AM', isCompleted: true },
            { status: 'Under Review', date: 'Jan 09, 11:00 AM', isCompleted: true },
            { status: 'Rejected', date: 'Jan 10, 02:15 PM', isCompleted: true }
        ],
        adminReview: {
            reviewedBy: 'Claims Team',
            reviewedAt: 'Jan 10, 2025 at 02:15 PM',
            comments: 'Invoice date (Jan 5, 2025) is outside the current policy period. Please ensure bills are within the valid policy dates.',
            status: 'rejected',
            rejectionReason: 'Invoice date is outside policy period',
            requiredActions: [
                'Verify policy validity dates',
                'Resubmit with bills within policy period',
                'Contact support for clarification'
            ]
        }
    }
];
