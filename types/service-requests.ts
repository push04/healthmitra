export type SRStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type SRType = 'medical_consultation' | 'diagnostic' | 'medicine' | 'ambulance' | 'caretaker' | 'nursing' | 'other';
export type SRPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Agent {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'available' | 'busy' | 'offline';
}

export interface ServiceRequest {
    id: string;
    requestId: string; // Changed from requestNo: number
    userId?: string;
    customerName: string;
    customerEmail?: string;
    customerContact?: string;
    type: SRType;
    status: SRStatus;
    description?: string;
    priority?: SRPriority;
    notes?: string;

    // Assignment
    assignedToId?: string;
    assignedToName?: string;

    // Timestamps
    requestedAt: string;
    assignedAt?: string;
    completedAt?: string;

    // Partner
    franchiseId?: string;
    franchiseName?: string;

    // Raw details if needed
    details?: any;
}
