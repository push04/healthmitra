'use server'

import {
    MOCK_PATIENTS, MOCK_PHR_RECORDS, MOCK_VENDOR_AUDIT,
    PatientMember, PHRRecord, VendorAuditEntry
} from '@/app/lib/mock/phr-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getPatients(search?: string) {
    await delay(400);
    let patients = [...MOCK_PATIENTS];
    if (search) {
        const q = search.toLowerCase();
        patients = patients.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.phone.includes(q) ||
            p.abhaId?.includes(q) ||
            p.id.toLowerCase().includes(q)
        );
    }
    return { success: true, data: patients };
}

export async function getPatientPHR(memberId: string) {
    await delay(300);
    const patient = MOCK_PATIENTS.find(p => p.id === memberId);
    if (!patient) return { success: false, error: 'Patient not found' };
    const records = MOCK_PHR_RECORDS.filter(r => r.memberId === memberId);
    return { success: true, data: { patient, records } };
}

export async function addVendorRecord(memberId: string, record: Partial<PHRRecord>) {
    await delay(600);
    console.log('Adding vendor record for', memberId, record);
    return { success: true, message: 'Record added successfully' };
}

export async function verifyPatientAccess(input: { type: 'otp' | 'abha'; value: string }) {
    await delay(800);
    if (input.type === 'otp') {
        if (input.value === '123456') {
            return { success: true, data: MOCK_PATIENTS[0], message: 'OTP verified' };
        }
        return { success: false, error: 'Invalid OTP' };
    }
    const patient = MOCK_PATIENTS.find(p => p.abhaId === input.value);
    if (patient) {
        return { success: true, data: patient, message: 'ABHA verified' };
    }
    return { success: false, error: 'ABHA ID not found' };
}

export async function getVendorAuditLog() {
    await delay(300);
    return { success: true, data: MOCK_VENDOR_AUDIT };
}
