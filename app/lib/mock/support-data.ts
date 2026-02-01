export type RequestStatus = 'pending' | 'in-progress' | 'completed' | 'rejected';
export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';
export type RequestType = 'medical' | 'diagnostic' | 'medicine' | 'ambulance' | 'general';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface ServiceRequest {
    id: string;
    requestId: string; // REQ-2025-0119-001
    type: RequestType;
    status: RequestStatus;
    priority: RequestPriority;

    // Customer
    customerId: string;
    customerName: string;
    customerPhone: string;
    memberType: string; // 'Self', 'Spouse'
    planName: string;

    // Details
    subject: string;
    description: string;
    preferredDate?: string;
    preferredTime?: string;
    specialization?: string;

    // Assignment
    assignedTo?: string; // Admin ID
    submittedAt: string;
    updatedAt: string;

    documents: { name: string; url: string; size: string }[];
}

export interface ThreadMessage {
    id: string;
    requestId: string;
    sender: 'customer' | 'admin';
    senderName: string;
    message: string;
    timestamp: string;
    attachments?: { name: string; url: string }[];
}

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

export const MOCK_REQUESTS: ServiceRequest[] = [
    {
        id: 'req_1',
        requestId: 'REQ-2025-0119-001',
        type: 'medical',
        status: 'pending',
        priority: 'high',
        customerId: 'u_1',
        customerName: 'Rajesh Kumar',
        customerPhone: '+91 98765 43210',
        memberType: 'Self (35y)',
        planName: 'Gold Health Plan',
        subject: 'Medical Consultation (Cardiologist)',
        description: 'Experiencing mild chest pain since yesterday. Need urgent consultation.',
        preferredDate: '2025-01-20',
        preferredTime: '10:00 AM',
        specialization: 'Cardiologist',
        submittedAt: '2025-01-19T10:30:00',
        updatedAt: '2025-01-19T10:30:00',
        documents: [
            { name: 'ecg_report.jpg', url: '#', size: '1.2 MB' }
        ]
    }
];

export const MOCK_THREADS: ThreadMessage[] = [
    {
        id: 'msg_1',
        requestId: 'req_1',
        sender: 'customer',
        senderName: 'Rajesh Kumar',
        message: 'Need urgent consultation for chest pain. Have attached ECG.',
        timestamp: '2025-01-19T10:30:00'
    }
];

export const MOCK_CLAIMS: ReimbursementClaim[] = [
    {
        id: 'clm_1',
        claimId: 'CLM-2025-0119-001',
        status: 'pending',
        customerId: 'u_1',
        customerName: 'Rajesh Kumar',
        planName: 'Gold Health Plan',
        title: 'Medicine Reimbursement',
        amount: 1250,
        billDate: '2025-01-12',
        providerName: 'Apollo Pharmacy',
        submittedAt: '2025-01-15',
        documents: [
            { name: 'prescription.pdf', type: 'Prescription', url: '#' },
            { name: 'invoice.pdf', type: 'Tax Invoice', url: '#' },
            { name: 'payment_slip.jpg', type: 'Payment Proof', url: '#' }
        ]
    }
];
