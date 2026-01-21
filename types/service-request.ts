export type RequestType = 'medical_consultation' | 'diagnostic' | 'medicine' | 'ambulance' | 'caretaker' | 'nursing' | 'other';
export type RequestStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TimelineStatus = 'submitted' | 'under_review' | 'appointment_scheduled' | 'action_taken' | 'completed' | 'cancelled';

export interface RequestDetails {
    // Shared
    memberName?: string;
    memberId?: string;
    symptoms?: string;

    // Consultation
    consultationType?: 'telemedicine' | 'in_clinic';
    specialization?: string;
    doctorName?: string;
    preferredDoctorId?: string;

    // Diagnostic
    testNames?: string[];
    collectionType?: 'home' | 'center';

    // Medicine
    deliveryType?: 'home' | 'pickup';
    pharmacyName?: string;

    // Ambulance
    ambulanceType?: 'bls' | 'als' | 'patient_transport';
    pickupAddress?: string;
    destinationAddress?: string;

    // Scheduling
    preferredDate?: string;
    preferredTime?: string;
    scheduledDateTime?: string;

    documents?: string[]; // Array of file URLs or IDs
}

export interface TimelineStep {
    status: TimelineStatus;
    timestamp: string;
    completed: boolean;
    label?: string; // Optional helper for UI
}

export interface Message {
    id: string;
    sender: 'user' | 'admin';
    senderName?: string;
    message: string;
    timestamp: string;
    attachments: string[];
}

export interface ServiceRequest {
    id: string;
    requestId: string;
    type: RequestType;
    status: RequestStatus;
    createdAt: string;
    updatedAt: string;
    details: RequestDetails;
    timeline: TimelineStep[];
    messages: Message[];
}

export interface ServiceRequestStats {
    all: number;
    pending: number;
    in_progress: number;
    completed: number;
}

export interface ServiceRequestsResponse {
    success: boolean;
    data: {
        requests: ServiceRequest[];
        stats: ServiceRequestStats;
    };
}
