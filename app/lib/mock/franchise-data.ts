import { Franchise, FranchiseModule, FranchiseActivity, FranchisePartner, DEFAULT_MODULES } from '@/types/franchise';

export const MOCK_FRANCHISES: Franchise[] = [
    {
        id: 'fr_1', name: 'HealthMitra Delhi NCR', startDate: '2024-01-15', endDate: '2027-01-15',
        contact: '+91 98765 00001', altContact: '+91 98765 00002', email: 'delhi@healthmitra.com', password: 'franchise123',
        referralCode: 'HMDEL2024', website: 'https://delhi.healthmitra.com', gst: '07AABCU9603R1ZM',
        commissionPercent: 15, kycStatus: 'verified', verificationStatus: 'verified',
        address: '42, Connaught Place, Block B', city: 'New Delhi', state: 'Delhi',
        payoutDelay: 7, status: 'active', createdAt: '2024-01-15T10:00:00Z',
        totalPartners: 28, totalRevenue: 1250000,
    },
    {
        id: 'fr_2', name: 'HealthMitra Mumbai', startDate: '2024-03-01', endDate: '2027-03-01',
        contact: '+91 98765 00003', altContact: '+91 98765 00004', email: 'mumbai@healthmitra.com', password: 'franchise456',
        referralCode: 'HMMUM2024', website: 'https://mumbai.healthmitra.com', gst: '27AABCU9603R1ZN',
        commissionPercent: 12, kycStatus: 'verified', verificationStatus: 'verified',
        address: '15, Bandra West, Hill Road', city: 'Mumbai', state: 'Maharashtra',
        payoutDelay: 10, status: 'active', createdAt: '2024-03-01T10:00:00Z',
        totalPartners: 42, totalRevenue: 2100000,
    },
    {
        id: 'fr_3', name: 'HealthMitra Bangalore', startDate: '2024-06-01', endDate: '2027-06-01',
        contact: '+91 98765 00005', altContact: '+91 98765 00006', email: 'blr@healthmitra.com', password: 'franchise789',
        referralCode: 'HMBLR2024', website: '', gst: '29AABCU9603R1ZO',
        commissionPercent: 14, kycStatus: 'submitted', verificationStatus: 'in_review',
        address: '88, Koramangala 4th Block', city: 'Bangalore', state: 'Karnataka',
        payoutDelay: 14, status: 'active', createdAt: '2024-06-01T10:00:00Z',
        totalPartners: 15, totalRevenue: 680000,
    },
    {
        id: 'fr_4', name: 'HealthMitra Jaipur', startDate: '2025-01-01', endDate: '2028-01-01',
        contact: '+91 98765 00007', altContact: '', email: 'jaipur@healthmitra.com', password: 'franchise000',
        referralCode: 'HMJPR2025', website: '', gst: '',
        commissionPercent: 18, kycStatus: 'pending', verificationStatus: 'unverified',
        address: '22, MI Road, C-Scheme', city: 'Jaipur', state: 'Rajasthan',
        payoutDelay: 7, status: 'inactive', createdAt: '2025-01-01T10:00:00Z',
        totalPartners: 0, totalRevenue: 0,
    },
];

export const MOCK_FRANCHISE_MODULES: Record<string, FranchiseModule[]> = {
    fr_1: DEFAULT_MODULES.map(m => ({ ...m })),
    fr_2: DEFAULT_MODULES.map(m => ({ ...m, deleteAccess: false, uploadAccess: m.moduleName === 'PHR Management' })),
    fr_3: DEFAULT_MODULES.map(m => ({ ...m, addAccess: false, editAccess: false })),
    fr_4: [],
};

export const MOCK_FRANCHISE_ACTIVITIES: FranchiseActivity[] = [
    { id: 'fa_1', franchiseId: 'fr_1', action: 'Service Request Created', description: 'Created service request SR-1001 for Rajesh Kumar', timestamp: '2025-02-10T09:30:00Z', performedBy: 'Franchise Admin' },
    { id: 'fa_2', franchiseId: 'fr_1', action: 'Partner Added', description: 'Added new partner "Apollo Clinic, Noida"', timestamp: '2025-02-09T14:00:00Z', performedBy: 'Franchise Admin' },
    { id: 'fa_3', franchiseId: 'fr_2', action: 'City Added', description: 'Added Thane as a new service city', timestamp: '2025-02-08T11:00:00Z', performedBy: 'Franchise Admin' },
    { id: 'fa_4', franchiseId: 'fr_1', action: 'Plan Modified', description: 'Updated pricing for Gold Health Plan', timestamp: '2025-02-07T16:00:00Z', performedBy: 'Franchise Admin' },
    { id: 'fa_5', franchiseId: 'fr_2', action: 'Service Request Completed', description: 'Completed emergency ambulance service SR-1004', timestamp: '2025-02-07T08:00:00Z', performedBy: 'Agent Anjali' },
    { id: 'fa_6', franchiseId: 'fr_3', action: 'KYC Submitted', description: 'Submitted KYC documents for verification', timestamp: '2025-02-06T10:00:00Z', performedBy: 'Franchise Admin' },
];

export const MOCK_FRANCHISE_PARTNERS: Record<string, FranchisePartner[]> = {
    fr_1: [
        { id: 'fp_1', name: 'Apollo Clinic Noida', email: 'apollo.noida@partner.com', phone: '+91 9876500010', status: 'active', joinedAt: '2024-03-15', plansCount: 145, revenue: 420000 },
        { id: 'fp_2', name: 'Max Care Delhi', email: 'maxcare.del@partner.com', phone: '+91 9876500011', status: 'active', joinedAt: '2024-04-20', plansCount: 98, revenue: 310000 },
        { id: 'fp_3', name: 'Wellness Hub Gurgaon', email: 'wellness.grg@partner.com', phone: '+91 9876500012', status: 'inactive', joinedAt: '2024-06-01', plansCount: 42, revenue: 150000 },
    ],
    fr_2: [
        { id: 'fp_4', name: 'LifeCare Hospital Andheri', email: 'lifecare.and@partner.com', phone: '+91 9876500013', status: 'active', joinedAt: '2024-05-10', plansCount: 210, revenue: 680000 },
        { id: 'fp_5', name: 'Medstar Thane', email: 'medstar.th@partner.com', phone: '+91 9876500014', status: 'active', joinedAt: '2024-07-15', plansCount: 175, revenue: 520000 },
    ],
};
