'use server';

import { MOCK_USERS, User, UserType } from '@/app/lib/mock/users-data';
import { MOCK_DEPARTMENTS, Department } from '@/app/lib/mock/departments';

// Simulator delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- USER ACTIONS ---

interface GetUsersFilters {
    query?: string;
    type?: string;
    status?: string;
    department?: string;
    page?: number;
    limit?: number;
}

export async function getUsers(filters: GetUsersFilters) {
    await delay(600);

    let users = [...MOCK_USERS];

    if (filters.query) {
        const q = filters.query.toLowerCase();
        users = users.filter(u =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.id.toLowerCase().includes(q)
        );
    }

    if (filters.type && filters.type !== 'all') {
        users = users.filter(u => u.type === filters.type);
    }

    if (filters.status && filters.status !== 'all') {
        users = users.filter(u => u.status === filters.status);
    }

    if (filters.department && filters.department !== 'all') {
        users = users.filter(u => u.departmentId === filters.department);
    }

    // Stats for tabs
    const stats = {
        total: MOCK_USERS.length,
        customers: MOCK_USERS.filter(u => u.type === 'Customer').length,
        employees: MOCK_USERS.filter(u => u.type === 'Employee').length,
        admins: MOCK_USERS.filter(u => u.type === 'Admin').length,
        partners: MOCK_USERS.filter(u => u.type === 'Referral Partner').length,
    };

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 50; // default large limit for mock
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    return {
        success: true,
        data: paginatedUsers,
        total: users.length,
        stats
    };
}

export async function getUser(id: string) {
    await delay(300);
    const user = MOCK_USERS.find(u => u.id === id);
    if (!user) return { success: false, error: 'User not found' };
    return { success: true, data: user };
}

export async function createUser(data: Partial<User>) {
    await delay(1000);
    console.log("Creating User:", data);

    // Generate ID logic mock
    const prefix = data.type === 'Customer' ? 'USR' : data.type === 'Referral Partner' ? 'REF' : 'EMP';
    const newUser: User = {
        ...data as User,
        id: `${prefix}-2024-${Math.floor(Math.random() * 10000)}`,
        status: data.status || 'active',
        joinedDate: new Date().toISOString().split('T')[0]
    };

    return { success: true, message: 'User created successfully', data: newUser };
}

export async function updateUser(id: string, data: Partial<User>) {
    await delay(800);
    console.log(`Updating User ${id}:`, data);
    return { success: true, message: 'User updated successfully' };
}

export async function toggleUserStatus(id: string, status: 'active' | 'inactive') {
    await delay(400);
    console.log(`Toggling user ${id} to ${status}`);
    return { success: true, message: `User ${status === 'active' ? 'activated' : 'deactivated'}` };
}

export async function updateBankDetails(id: string, bankDetails: any) {
    await delay(600);
    console.log(`Updating bank details for ${id}:`, bankDetails);
    return { success: true, message: 'Bank details updated successfully' };
}

export async function updateDocuments(id: string, documents: any) {
    await delay(600);
    console.log(`Updating documents for ${id}:`, documents);
    return { success: true, message: 'Documents updated successfully' };
}

export async function changePlan(id: string, planId: string, planName: string) {
    await delay(600);
    console.log(`Changing plan for ${id} to ${planName}`);
    return { success: true, message: `Plan changed to ${planName}` };
}

export async function resendCredentials(id: string, method: 'whatsapp' | 'email') {
    await delay(400);
    console.log(`Resending credentials to ${id} via ${method}`);
    return { success: true, message: `Credentials sent via ${method === 'whatsapp' ? 'WhatsApp' : 'Email'}` };
}

export async function activateNewPlan(id: string, planId: string) {
    await delay(600);
    console.log(`Activating plan ${planId} for user ${id}`);
    return { success: true, message: 'New plan activated from backend' };
}

// --- DEPARTMENT ACTIONS ---

export async function getDepartments() {
    await delay(400);
    return { success: true, data: MOCK_DEPARTMENTS };
}

export async function createDepartment(dept: Partial<Department>) {
    await delay(500);
    console.log("Creating Dept:", dept);
    return { success: true, message: 'Department added' };
}

export async function deleteDepartment(id: string) {
    await delay(500);
    return { success: true, message: 'Department deleted' };
}
