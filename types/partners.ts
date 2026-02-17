export interface BankDetails {
    bankName: string;
    branchName: string;
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    accountType: 'Savings' | 'Current';
}

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
