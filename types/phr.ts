export type PHRRecordCategory = 'Prescriptions' | 'Bills' | 'Test Reports' | 'General Records' | 'Discharge Summaries' | 'Vaccination Records';

export const PHR_CATEGORIES: PHRRecordCategory[] = ['Prescriptions', 'Bills', 'Test Reports', 'General Records', 'Discharge Summaries', 'Vaccination Records'];

export interface PatientMember {
    id: string;
    userId?: string;
    name: string;
    relation: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    abhaId?: string;
    phone: string;
    email: string;
    planName?: string;
    recordCount: number;
    lastUpdated: string;
    bloodGroup?: string;
    avatar?: string;
}

export interface PHRRecord {
    id: string;
    memberId: string;
    fileName: string;
    fileType: 'pdf' | 'jpg' | 'png' | 'dicom';
    fileSize: string;
    category: PHRRecordCategory;
    uploadedAt: string;
    addedBy: 'self' | 'vendor' | 'admin';
    vendorName?: string;
    tags?: string[];
    url: string;
    notes?: string;
    doctorName?: string;
    hospitalName?: string;
}

export interface VendorAuditEntry {
    id: string;
    vendorName: string;
    vendorId: string;
    action: 'add_record' | 'view_record';
    memberId: string;
    memberName: string;
    recordId?: string;
    recordName?: string;
    timestamp: string;
    verificationMethod: 'otp' | 'abha';
    details?: string;
}
