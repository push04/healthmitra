export interface PatientMember {
    id: string;
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
}

export type PHRRecordCategory = 'Prescriptions' | 'Bills' | 'Test Reports' | 'General Records' | 'Discharge Summaries' | 'Vaccination Records';

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
}

export const MOCK_PATIENTS: PatientMember[] = [
    { id: 'pm_1', name: 'Rajesh Kumar', relation: 'Self', age: 42, gender: 'Male', abhaId: '91-1234-5678-9012', phone: '+91 99887 76655', email: 'rajesh@gmail.com', planName: 'Gold Health Plan', recordCount: 12, lastUpdated: '2025-02-10' },
    { id: 'pm_2', name: 'Priya Kumar', relation: 'Spouse', age: 38, gender: 'Female', abhaId: '91-1234-5678-9013', phone: '+91 99887 76656', email: 'priya.k@gmail.com', planName: 'Gold Health Plan', recordCount: 8, lastUpdated: '2025-02-08' },
    { id: 'pm_3', name: 'Sunita Devi', relation: 'Self', age: 65, gender: 'Female', phone: '+91 88776 65544', email: 'sunita.d@gmail.com', planName: 'Elder Care Premium', recordCount: 22, lastUpdated: '2025-02-09' },
    { id: 'pm_4', name: 'Amit Gupta', relation: 'Self', age: 30, gender: 'Male', abhaId: '91-5678-1234-5678', phone: '+91 77665 54433', email: 'amit.g@yahoo.com', planName: 'Basic Care Plan', recordCount: 5, lastUpdated: '2025-01-28' },
    { id: 'pm_5', name: 'Meera Joshi', relation: 'Self', age: 28, gender: 'Female', phone: '+91 66554 43322', email: 'meera.j@hotmail.com', recordCount: 3, lastUpdated: '2025-02-05' },
];

export const MOCK_PHR_RECORDS: PHRRecord[] = [
    { id: 'phr_1', memberId: 'pm_1', fileName: 'prescription_cardiologist_jan.pdf', fileType: 'pdf', fileSize: '1.2 MB', category: 'Prescriptions', uploadedAt: '2025-01-18T10:30:00Z', addedBy: 'self', tags: ['cardiologist', 'chest pain'], url: '#' },
    { id: 'phr_2', memberId: 'pm_1', fileName: 'blood_report_full_body.jpg', fileType: 'jpg', fileSize: '856 KB', category: 'Test Reports', uploadedAt: '2025-01-15T14:00:00Z', addedBy: 'vendor', vendorName: 'Apollo Diagnostics', tags: ['CBC', 'lipid profile'], url: '#' },
    { id: 'phr_3', memberId: 'pm_1', fileName: 'hospital_bill_dec.pdf', fileType: 'pdf', fileSize: '2.1 MB', category: 'Bills', uploadedAt: '2024-12-20T09:00:00Z', addedBy: 'self', url: '#' },
    { id: 'phr_4', memberId: 'pm_1', fileName: 'discharge_summary_nov.pdf', fileType: 'pdf', fileSize: '3.5 MB', category: 'Discharge Summaries', uploadedAt: '2024-11-25T11:00:00Z', addedBy: 'vendor', vendorName: 'Max Hospital', url: '#' },
    { id: 'phr_5', memberId: 'pm_2', fileName: 'eye_checkup_report.pdf', fileType: 'pdf', fileSize: '1.8 MB', category: 'Test Reports', uploadedAt: '2025-02-01T09:30:00Z', addedBy: 'self', tags: ['ophthalmology'], url: '#' },
    { id: 'phr_6', memberId: 'pm_3', fileName: 'bp_monitoring_chart.pdf', fileType: 'pdf', fileSize: '450 KB', category: 'General Records', uploadedAt: '2025-02-09T08:00:00Z', addedBy: 'admin', notes: 'Monthly BP monitoring chart', url: '#' },
    { id: 'phr_7', memberId: 'pm_3', fileName: 'vaccination_covid_booster.pdf', fileType: 'pdf', fileSize: '320 KB', category: 'Vaccination Records', uploadedAt: '2025-01-10T10:00:00Z', addedBy: 'vendor', vendorName: 'Govt. PHC', url: '#' },
    { id: 'phr_8', memberId: 'pm_4', fileName: 'dental_xray.png', fileType: 'png', fileSize: '4.2 MB', category: 'Test Reports', uploadedAt: '2025-01-28T15:00:00Z', addedBy: 'vendor', vendorName: 'Clove Dental', tags: ['dental'], url: '#' },
];

export const MOCK_VENDOR_AUDIT: VendorAuditEntry[] = [
    { id: 'va_1', vendorName: 'Apollo Diagnostics', vendorId: 'v_1', action: 'add_record', memberId: 'pm_1', memberName: 'Rajesh Kumar', recordId: 'phr_2', recordName: 'blood_report_full_body.jpg', timestamp: '2025-01-15T14:00:00Z', verificationMethod: 'otp' },
    { id: 'va_2', vendorName: 'Max Hospital', vendorId: 'v_2', action: 'add_record', memberId: 'pm_1', memberName: 'Rajesh Kumar', recordId: 'phr_4', recordName: 'discharge_summary_nov.pdf', timestamp: '2024-11-25T11:00:00Z', verificationMethod: 'abha' },
    { id: 'va_3', vendorName: 'Govt. PHC', vendorId: 'v_3', action: 'add_record', memberId: 'pm_3', memberName: 'Sunita Devi', recordId: 'phr_7', recordName: 'vaccination_covid_booster.pdf', timestamp: '2025-01-10T10:00:00Z', verificationMethod: 'otp' },
    { id: 'va_4', vendorName: 'Clove Dental', vendorId: 'v_4', action: 'add_record', memberId: 'pm_4', memberName: 'Amit Gupta', recordId: 'phr_8', recordName: 'dental_xray.png', timestamp: '2025-01-28T15:00:00Z', verificationMethod: 'abha' },
];

export const PHR_CATEGORIES: PHRRecordCategory[] = ['Prescriptions', 'Bills', 'Test Reports', 'General Records', 'Discharge Summaries', 'Vaccination Records'];
