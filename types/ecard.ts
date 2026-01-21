export type ECardStatus = 'active' | 'pending' | 'expired';

export interface ECardMember {
    id: string;
    name: string;
    relation: string;
    dob: string;
    age: number;
    gender: 'M' | 'F' | 'Other';
    bloodGroup: string;
    memberId: string;
    photoUrl?: string;
    planId: string;
    planName: string;
    validTill: string;
    policyNo: string;
    issuedDate: string;
    emergencyContact: string;
    coverageAmount: number;
    status: ECardStatus;
}

export interface ECardGenerationState {
    step: 1 | 2 | 3;
    selectedMemberId: string | null;
    formData: ECardFormData;
}

export interface ECardFormData {
    fullName: string;
    dob: string;
    gender: string;
    bloodGroup: string;
    mobile: string;
    email: string;
    height: string;
    weight: string;
    conditions: string;
    nomineeName: string;
    nomineeRelation: string;
    photo?: File | null;
}

export const MOCK_ECARDS: ECardMember[] = [
    {
        id: 'm1',
        name: 'Rajesh Kumar',
        relation: 'Self',
        dob: '15/03/1989',
        age: 35,
        gender: 'M',
        bloodGroup: 'B+',
        memberId: 'HM-2024-001-001',
        planId: 'p1',
        planName: 'Gold Health Plan',
        validTill: '31/12/2025',
        policyNo: 'HLTH-2024-001',
        issuedDate: '15/01/2024',
        emergencyContact: '1800-123-4567',
        coverageAmount: 500000,
        status: 'active'
    },
    {
        id: 'm2',
        name: 'Priya Kumar',
        relation: 'Spouse',
        dob: '20/05/1992',
        age: 32,
        gender: 'F',
        bloodGroup: '',
        memberId: '',
        planId: 'p1',
        planName: 'Gold Health Plan',
        validTill: '',
        policyNo: '',
        issuedDate: '',
        emergencyContact: '',
        coverageAmount: 0,
        status: 'pending'
    }
];
