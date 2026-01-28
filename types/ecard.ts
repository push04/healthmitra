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
    validFrom: string;  // START VALIDITY - NEW
    validTill: string;  // END VALIDITY (1 year from start)
    policyNo: string;
    issuedDate: string;
    emergencyContact: string;
    coverageAmount?: number; // Now optional - removed from display
    status: ECardStatus;
    // NEW FIELDS
    cardUniqueId: string;  // Unique Card ID
    planDescription?: string; // Plan basic details
    planFeatures?: string[]; // Plan features for more info
    aadhaarLast4?: string; // Last 4 digits of Aadhaar for verification
    mobile?: string;
    email?: string;
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
    // All fields mandatory for E-Card generation
    aadhaarNumber?: string;
    address?: string;
}

// Generate a unique card ID
function generateCardUniqueId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'HM-';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '-';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Calculate validity dates (1 year)
function getValidityDates(): { validFrom: string; validTill: string } {
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const formatDate = (d: Date) =>
        `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    return {
        validFrom: formatDate(today),
        validTill: formatDate(nextYear)
    };
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
        validFrom: '28/01/2025',
        validTill: '27/01/2026',
        policyNo: 'HLTH-2024-001',
        issuedDate: '28/01/2025',
        emergencyContact: '1800-123-4567',
        status: 'active',
        cardUniqueId: 'HM-XK7P-9W2L',
        planDescription: 'Comprehensive health coverage for you and your family with cashless treatment at 1000+ hospitals.',
        planFeatures: [
            'Cashless hospitalization at 1000+ hospitals',
            '24/7 medical assistance & support',
            'Free annual health checkup',
            'Ambulance service included',
            'Pre & Post hospitalization cover',
            'Daycare procedures covered'
        ],
        mobile: '9876543210',
        email: 'rajesh.kumar@email.com',
        aadhaarLast4: '4567'
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
        validFrom: '',
        validTill: '',
        policyNo: '',
        issuedDate: '',
        emergencyContact: '',
        status: 'pending',
        cardUniqueId: '',
        planDescription: 'Comprehensive health coverage for you and your family with cashless treatment at 1000+ hospitals.',
    },
    {
        id: 'm3',
        name: 'Aarav Kumar',
        relation: 'Son',
        dob: '10/08/2015',
        age: 9,
        gender: 'M',
        bloodGroup: 'B+',
        memberId: 'HM-2024-001-003',
        planId: 'p1',
        planName: 'Gold Health Plan',
        validFrom: '28/01/2025',
        validTill: '27/01/2026',
        policyNo: 'HLTH-2024-001',
        issuedDate: '28/01/2025',
        emergencyContact: '1800-123-4567',
        status: 'active',
        cardUniqueId: 'HM-AB3C-7X9Y',
        planDescription: 'Comprehensive health coverage for you and your family with cashless treatment at 1000+ hospitals.',
        planFeatures: [
            'Cashless hospitalization at 1000+ hospitals',
            '24/7 medical assistance & support',
            'Free annual health checkup',
            'Ambulance service included'
        ],
        mobile: '9876543210',
        email: 'rajesh.kumar@email.com'
    },
    {
        id: 'm4',
        name: 'Ananya Kumar',
        relation: 'Daughter',
        dob: '25/12/2018',
        age: 6,
        gender: 'F',
        bloodGroup: 'O+',
        memberId: 'HM-2024-001-004',
        planId: 'p1',
        planName: 'Gold Health Plan',
        validFrom: '28/01/2025',
        validTill: '27/01/2026',
        policyNo: 'HLTH-2024-001',
        issuedDate: '28/01/2025',
        emergencyContact: '1800-123-4567',
        status: 'active',
        cardUniqueId: 'HM-KL5M-2N8P',
        planDescription: 'Comprehensive health coverage for you and your family with cashless treatment at 1000+ hospitals.',
        planFeatures: [
            'Cashless hospitalization at 1000+ hospitals',
            '24/7 medical assistance & support',
            'Free annual health checkup',
            'Ambulance service included'
        ],
        mobile: '9876543210',
        email: 'rajesh.kumar@email.com'
    }
];
