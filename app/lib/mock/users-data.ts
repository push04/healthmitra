import { Department } from './departments';

export type UserType = 'Customer' | 'Employee' | 'Admin' | 'Referral Partner';
export type UserStatus = 'active' | 'inactive';

export interface KYCDetails {
    aadhaarNumber?: string;
    panNumber?: string;
    status: 'verified' | 'pending' | 'rejected';
}

export interface BankDetails {
    accountHolder?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
    accountType?: 'Savings' | 'Current';
}

export interface User {
    id: string; // USR-2024-XXX, EMP-2024-XXX
    name: string;
    email: string;
    phone: string;
    avatar?: string;

    type: UserType;
    status: UserStatus;

    // Personal Info
    gender?: 'Male' | 'Female' | 'Other';
    dob?: string;
    password?: string;
    designation?: string;
    department?: string;

    // Contact & Location
    altPhone?: string;
    secondEmail?: string;
    landline?: string;
    country?: string;
    state?: string;
    city?: string;
    address?: string;
    pincode?: string;

    // Professional (Employee/Admin/Partner)
    departmentId?: string;
    designationId?: string;
    reportingManagerId?: string;
    dateOfJoining?: string;

    // Partner Specific
    referralCode?: string;
    commissionRate?: number;

    // Financial & KYC
    bankDetails?: BankDetails;
    kycDetails?: KYCDetails;
    profilePicture?: string;

    // Plan
    planId?: string;
    planName?: string;

    // Meta
    joinedDate: string;

    // Access Control (Mock columns)
    permissions?: string[];
}

const CITIES = ['New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata'];
const STATES = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal'];
const BANKS = ['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra'];
const PLANS = [
    { id: 'plan_gold', name: 'Gold Health Plan' },
    { id: 'plan_silver', name: 'Silver Health Plan' },
    { id: 'plan_platinum', name: 'Platinum Health Plan' },
];

const generateUsers = (count: number): User[] => {
    const users: User[] = [];
    const depts = ['dept_sales', 'dept_support', 'dept_accounts', 'dept_ops'];

    users.push({
        id: 'EMP-2024-001',
        name: 'Super Admin',
        email: 'admin@healthmitra.com',
        phone: '+91 9999999999',
        type: 'Admin',
        status: 'active',
        gender: 'Male',
        dob: '1985-06-15',
        country: 'India',
        state: 'Delhi',
        city: 'New Delhi',
        address: '123 Admin Tower, Connaught Place',
        pincode: '110001',
        departmentId: 'dept_it',
        designationId: 'des_cto',
        designation: 'CTO',
        department: 'IT',
        joinedDate: '2023-01-01',
        permissions: ['all'],
        bankDetails: {
            bankName: 'HDFC Bank', branchName: 'CP Delhi', accountHolder: 'Super Admin',
            accountNumber: '50100123456789', ifscCode: 'HDFC0001234', accountType: 'Savings'
        },
        kycDetails: { aadhaarNumber: '1234-5678-9012', panNumber: 'ABCDE1234F', status: 'verified' },
    });

    for (let i = 0; i < count; i++) {
        const type: UserType = i < 320 ? 'Customer' : i < 405 ? 'Employee' : 'Referral Partner';
        const idPrefix = type === 'Customer' ? 'USR' : type === 'Employee' ? 'EMP' : 'REF';
        const deptId = type === 'Employee' ? depts[Math.floor(Math.random() * depts.length)] : undefined;
        const cityIdx = Math.floor(Math.random() * CITIES.length);
        const plan = type === 'Customer' ? PLANS[Math.floor(Math.random() * PLANS.length)] : undefined;

        users.push({
            id: `${idPrefix}-2024-${1000 + i}`,
            name: `User ${i + 1}`,
            email: `user${i}@example.com`,
            phone: `+91 ${9000000000 + i}`,
            altPhone: Math.random() > 0.5 ? `+91 ${8000000000 + i}` : undefined,
            secondEmail: Math.random() > 0.7 ? `user${i}.alt@example.com` : undefined,
            type,
            status: Math.random() > 0.1 ? 'active' : 'inactive',
            gender: ['Male', 'Female', 'Other'][Math.floor(Math.random() * 3)] as any,
            dob: `199${Math.floor(Math.random() * 9)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            country: 'India',
            state: STATES[cityIdx],
            city: CITIES[cityIdx],
            address: `${100 + i} Street, Sector ${Math.floor(Math.random() * 50) + 1}`,
            pincode: `${110000 + Math.floor(Math.random() * 90000)}`,
            departmentId: deptId,
            designationId: type === 'Employee' ? 'des_exec' : undefined,
            designation: type === 'Employee' ? 'Executive' : type === 'Referral Partner' ? 'Partner' : undefined,
            department: deptId?.replace('dept_', '').replace(/^./, c => c.toUpperCase()),
            joinedDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
            referralCode: type === 'Referral Partner' ? `REF-${1000 + i}` : undefined,
            commissionRate: type === 'Referral Partner' ? Math.floor(Math.random() * 10) + 5 : undefined,
            planId: plan?.id,
            planName: plan?.name,
            bankDetails: Math.random() > 0.4 ? {
                bankName: BANKS[Math.floor(Math.random() * BANKS.length)],
                branchName: `${CITIES[cityIdx]} Main`,
                accountHolder: `User ${i + 1}`,
                accountNumber: `${50100000000000 + i}`,
                ifscCode: `BANK000${1000 + i}`,
                accountType: Math.random() > 0.5 ? 'Savings' : 'Current',
            } : undefined,
            kycDetails: {
                aadhaarNumber: Math.random() > 0.3 ? `${1000 + i}-${2000 + i}-${3000 + i}` : undefined,
                panNumber: Math.random() > 0.4 ? `ABCD${String(i).padStart(4, '0')}E` : undefined,
                status: Math.random() > 0.6 ? 'verified' : Math.random() > 0.3 ? 'pending' : 'rejected',
            },
        });
    }
    return users;
};

export const MOCK_USERS = generateUsers(450);
