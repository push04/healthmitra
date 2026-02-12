import { BankDetails } from './users-data';

// --- PARTNER TYPES ---

export interface Partner {
    id: string;
    name: string;
    email: string;
    phone: string;
    altPhone?: string;
    referralCode: string;
    commissionPercent: number;
    status: 'active' | 'inactive' | 'suspended';
    kycStatus: 'pending' | 'submitted' | 'verified' | 'rejected';

    // Location
    city: string;
    state: string;
    address?: string;
    pincode?: string;

    // Financial
    bankDetails?: BankDetails;
    totalSales: number;
    totalCommission: number;
    totalSubPartners: number;

    // MOU
    mouSigned: boolean;
    mouDate?: string;

    // Meta
    canAddSubPartners: boolean;
    designationAccess: boolean;
    joinedDate: string;
    lastActive?: string;

    // Links
    franchiseId?: string;
    franchiseName?: string;
}

export interface SubPartner {
    id: string;
    parentPartnerId: string;
    name: string;
    email: string;
    phone: string;
    referralCode: string;
    commissionPercent: number;
    status: 'active' | 'inactive';
    designation?: string;
    salesCount: number;
    totalRevenue: number;
    joinedDate: string;
}

export interface PartnerCommission {
    id: string;
    partnerId: string;
    partnerName: string;
    saleId: string;
    customerName: string;
    planName: string;
    saleAmount: number;
    commissionPercent: number;
    commissionAmount: number;
    status: 'pending' | 'processed' | 'paid';
    saleDate: string;
    payoutDate?: string;
}

// --- MOCK DATA ---

export const MOCK_PARTNERS: Partner[] = [
    {
        id: 'ptr_1', name: 'Rajesh Healthcare Solutions', email: 'rajesh@healthcare.com',
        phone: '+91 9876543210', referralCode: 'RHS-2024-001', commissionPercent: 12,
        status: 'active', kycStatus: 'verified', city: 'New Delhi', state: 'Delhi',
        address: '45 Medical Plaza, Karol Bagh', pincode: '110005',
        bankDetails: {
            bankName: 'HDFC Bank', branchName: 'Karol Bagh', accountHolder: 'Rajesh Healthcare Solutions',
            accountNumber: '50100987654321', ifscCode: 'HDFC0004567', accountType: 'Current'
        },
        totalSales: 85, totalCommission: 340000, totalSubPartners: 4,
        mouSigned: true, mouDate: '2024-01-15', canAddSubPartners: true,
        designationAccess: true, joinedDate: '2024-01-15', lastActive: '2025-02-12',
        franchiseId: 'fr_1', franchiseName: 'HealthMitra Delhi NCR'
    },
    {
        id: 'ptr_2', name: 'Sunita Wellness Partners', email: 'sunita@wellness.com',
        phone: '+91 8765432109', referralCode: 'SWP-2024-002', commissionPercent: 10,
        status: 'active', kycStatus: 'verified', city: 'Mumbai', state: 'Maharashtra',
        address: '12 Bandra West, Link Road', pincode: '400050',
        bankDetails: {
            bankName: 'ICICI Bank', branchName: 'Bandra West', accountHolder: 'Sunita Wellness',
            accountNumber: '60200123456789', ifscCode: 'ICIC0001234', accountType: 'Current'
        },
        totalSales: 62, totalCommission: 248000, totalSubPartners: 2,
        mouSigned: true, mouDate: '2024-02-20', canAddSubPartners: true,
        designationAccess: false, joinedDate: '2024-02-20', lastActive: '2025-02-10',
        franchiseId: 'fr_2', franchiseName: 'HealthMitra Mumbai'
    },
    {
        id: 'ptr_3', name: 'MedReach Bangalore', email: 'info@medreach.in',
        phone: '+91 7654321098', referralCode: 'MRB-2024-003', commissionPercent: 15,
        status: 'active', kycStatus: 'submitted', city: 'Bangalore', state: 'Karnataka',
        address: '78 Koramangala, Inner Ring Road', pincode: '560034',
        totalSales: 45, totalCommission: 270000, totalSubPartners: 1,
        mouSigned: true, mouDate: '2024-04-01', canAddSubPartners: false,
        designationAccess: false, joinedDate: '2024-04-01', lastActive: '2025-02-11'
    },
    {
        id: 'ptr_4', name: 'HealthFirst Chennai', email: 'ops@healthfirst.in',
        phone: '+91 6543210987', referralCode: 'HFC-2024-004', commissionPercent: 8,
        status: 'inactive', kycStatus: 'pending', city: 'Chennai', state: 'Tamil Nadu',
        address: 'T. Nagar, Mount Road', pincode: '600017',
        totalSales: 12, totalCommission: 38400, totalSubPartners: 0,
        mouSigned: false, canAddSubPartners: false,
        designationAccess: false, joinedDate: '2024-06-10', lastActive: '2025-01-05'
    },
    {
        id: 'ptr_5', name: 'CareLink Hyderabad', email: 'admin@carelink.co.in',
        phone: '+91 9988776655', referralCode: 'CLH-2024-005', commissionPercent: 11,
        status: 'active', kycStatus: 'verified', city: 'Hyderabad', state: 'Telangana',
        address: 'Hitech City, Madhapur', pincode: '500081',
        bankDetails: {
            bankName: 'Axis Bank', branchName: 'Hitech City', accountHolder: 'CareLink Solutions',
            accountNumber: '91020034567890', ifscCode: 'UTIB0002345', accountType: 'Current'
        },
        totalSales: 71, totalCommission: 312400, totalSubPartners: 3,
        mouSigned: true, mouDate: '2024-03-08', canAddSubPartners: true,
        designationAccess: true, joinedDate: '2024-03-08', lastActive: '2025-02-12',
        franchiseId: 'fr_1', franchiseName: 'HealthMitra Delhi NCR'
    },
];

export const MOCK_SUB_PARTNERS: SubPartner[] = [
    { id: 'sp_1', parentPartnerId: 'ptr_1', name: 'Vikram Sales', email: 'vikram@rhs.com', phone: '+91 9876000001', referralCode: 'RHS-SUB-001', commissionPercent: 5, status: 'active', designation: 'Senior Associate', salesCount: 22, totalRevenue: 88000, joinedDate: '2024-03-10' },
    { id: 'sp_2', parentPartnerId: 'ptr_1', name: 'Priya Sharma', email: 'priya@rhs.com', phone: '+91 9876000002', referralCode: 'RHS-SUB-002', commissionPercent: 4, status: 'active', designation: 'Associate', salesCount: 15, totalRevenue: 60000, joinedDate: '2024-05-01' },
    { id: 'sp_3', parentPartnerId: 'ptr_1', name: 'Amit Gupta', email: 'amit@rhs.com', phone: '+91 9876000003', referralCode: 'RHS-SUB-003', commissionPercent: 4, status: 'inactive', designation: 'Associate', salesCount: 8, totalRevenue: 32000, joinedDate: '2024-06-15' },
    { id: 'sp_4', parentPartnerId: 'ptr_1', name: 'Neha Verma', email: 'neha@rhs.com', phone: '+91 9876000004', referralCode: 'RHS-SUB-004', commissionPercent: 3, status: 'active', salesCount: 5, totalRevenue: 20000, joinedDate: '2024-08-20' },
    { id: 'sp_5', parentPartnerId: 'ptr_2', name: 'Rahul Patel', email: 'rahul@swp.com', phone: '+91 8765000001', referralCode: 'SWP-SUB-001', commissionPercent: 4, status: 'active', designation: 'Sales Lead', salesCount: 18, totalRevenue: 72000, joinedDate: '2024-04-12' },
    { id: 'sp_6', parentPartnerId: 'ptr_2', name: 'Deepa Nair', email: 'deepa@swp.com', phone: '+91 8765000002', referralCode: 'SWP-SUB-002', commissionPercent: 3, status: 'active', salesCount: 10, totalRevenue: 40000, joinedDate: '2024-07-01' },
    { id: 'sp_7', parentPartnerId: 'ptr_5', name: 'Kiran Reddy', email: 'kiran@carelink.co.in', phone: '+91 9988000001', referralCode: 'CLH-SUB-001', commissionPercent: 5, status: 'active', designation: 'Regional Manager', salesCount: 30, totalRevenue: 132000, joinedDate: '2024-04-20' },
];

export const MOCK_COMMISSIONS: PartnerCommission[] = [
    { id: 'com_1', partnerId: 'ptr_1', partnerName: 'Rajesh Healthcare Solutions', saleId: 'SALE-001', customerName: 'Ramesh Kumar', planName: 'Gold Health Plan', saleAmount: 50000, commissionPercent: 12, commissionAmount: 6000, status: 'paid', saleDate: '2025-01-15', payoutDate: '2025-02-01' },
    { id: 'com_2', partnerId: 'ptr_1', partnerName: 'Rajesh Healthcare Solutions', saleId: 'SALE-002', customerName: 'Sunita Devi', planName: 'Silver Health Plan', saleAmount: 30000, commissionPercent: 12, commissionAmount: 3600, status: 'paid', saleDate: '2025-01-20', payoutDate: '2025-02-05' },
    { id: 'com_3', partnerId: 'ptr_1', partnerName: 'Rajesh Healthcare Solutions', saleId: 'SALE-003', customerName: 'Priya Singh', planName: 'Platinum Health Plan', saleAmount: 80000, commissionPercent: 12, commissionAmount: 9600, status: 'processed', saleDate: '2025-02-01' },
    { id: 'com_4', partnerId: 'ptr_2', partnerName: 'Sunita Wellness Partners', saleId: 'SALE-004', customerName: 'Amit Joshi', planName: 'Gold Health Plan', saleAmount: 50000, commissionPercent: 10, commissionAmount: 5000, status: 'paid', saleDate: '2025-01-18', payoutDate: '2025-02-03' },
    { id: 'com_5', partnerId: 'ptr_5', partnerName: 'CareLink Hyderabad', saleId: 'SALE-005', customerName: 'Lakshmi Reddy', planName: 'Gold Health Plan', saleAmount: 50000, commissionPercent: 11, commissionAmount: 5500, status: 'pending', saleDate: '2025-02-10' },
    { id: 'com_6', partnerId: 'ptr_3', partnerName: 'MedReach Bangalore', saleId: 'SALE-006', customerName: 'Venkat Rao', planName: 'Platinum Health Plan', saleAmount: 80000, commissionPercent: 15, commissionAmount: 12000, status: 'pending', saleDate: '2025-02-11' },
];
