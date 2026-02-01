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
}

export interface User {
    id: string; // USR-2024-XXX, EMP-2024-XXX
    name: string;
    email: string;
    phone: string;
    avatar?: string;

    type: UserType;
    status: UserStatus;

    // Basic Info
    gender?: 'Male' | 'Female' | 'Other';
    dob?: string;
    address?: string;
    city?: string;
    state?: string;

    // Professional (Employee/Admin/Partner)
    departmentId?: string;
    designationId?: string;
    reportingManagerId?: string;
    dateOfJoining?: string;

    // Partner Specific
    referralCode?: string;
    commissionRate?: number;

    // Meta
    joinedDate: string;

    // Access Control (Mock columns)
    permissions?: string[];
}

// Generate some mock users
const generateUsers = (count: number): User[] => {
    const users: User[] = [];
    const types: UserType[] = ['Customer', 'Employee', 'Referral Partner'];
    const depts = ['dept_sales', 'dept_support', 'dept_accounts', 'dept_ops'];

    // Fixed Admin User
    users.push({
        id: 'EMP-2024-001',
        name: 'Super Admin',
        email: 'admin@healthmitra.com',
        phone: '+91 9999999999',
        type: 'Admin',
        status: 'active',
        departmentId: 'dept_it',
        designationId: 'des_cto',
        joinedDate: '2023-01-01',
        permissions: ['all']
    });

    for (let i = 0; i < count; i++) {
        const type = i < 320 ? 'Customer' : i < 405 ? 'Employee' : 'Referral Partner';
        const idPrefix = type === 'Customer' ? 'USR' : type === 'Employee' ? 'EMP' : 'REF';
        const deptId = type === 'Employee' ? depts[Math.floor(Math.random() * depts.length)] : undefined;

        users.push({
            id: `${idPrefix}-2024-${1000 + i}`,
            name: `User ${i + 1}`,
            email: `user${i}@example.com`,
            phone: `+91 ${9000000000 + i}`,
            type,
            status: Math.random() > 0.1 ? 'active' : 'inactive', // 10% inactive
            departmentId: deptId,
            designationId: 'des_exec', // simplify for mock
            joinedDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
            city: ['New Delhi', 'Mumbai', 'Bangalore', 'Chennai'][Math.floor(Math.random() * 4)],
            referralCode: type === 'Referral Partner' ? `REF-${1000 + i}` : undefined
        });
    }
    return users;
};

export const MOCK_USERS = generateUsers(450);
