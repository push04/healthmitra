export type UserType = 'Customer' | 'Admin' | 'Referral Partner' | 'Employee' | 'Doctor' | 'Diagnostic Center' | 'Pharmacy';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: UserType;
    status: UserStatus;
    joinedDate: string;
    departmentId?: string; // For employees
    avatar?: string;
    planId?: string;
    planName?: string;

    // Detailed Profile (Optional in list view)
    dob?: string;
    gender?: 'Male' | 'Female' | 'Other';
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
}
