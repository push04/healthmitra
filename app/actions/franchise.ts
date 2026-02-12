'use server'

import {
    MOCK_FRANCHISES, MOCK_FRANCHISE_MODULES,
    MOCK_FRANCHISE_ACTIVITIES, MOCK_FRANCHISE_PARTNERS,
} from '@/app/lib/mock/franchise-data';
import { Franchise, FranchiseModule } from '@/types/franchise';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getFranchises(query?: string) {
    await delay(400);
    let franchises = [...MOCK_FRANCHISES];
    if (query) {
        const q = query.toLowerCase();
        franchises = franchises.filter(f =>
            f.name.toLowerCase().includes(q) ||
            f.email.toLowerCase().includes(q) ||
            f.city.toLowerCase().includes(q) ||
            f.referralCode.toLowerCase().includes(q)
        );
    }
    return { success: true, data: franchises };
}

export async function getFranchise(id: string) {
    await delay(300);
    const franchise = MOCK_FRANCHISES.find(f => f.id === id);
    if (!franchise) return { success: false, error: 'Franchise not found' };
    const modules = MOCK_FRANCHISE_MODULES[id] || [];
    const activities = MOCK_FRANCHISE_ACTIVITIES.filter(a => a.franchiseId === id);
    const partners = MOCK_FRANCHISE_PARTNERS[id] || [];
    return { success: true, data: { franchise, modules, activities, partners } };
}

export async function createFranchise(data: Partial<Franchise>) {
    await delay(600);
    console.log('Creating franchise:', data);
    return { success: true, message: 'Franchise created successfully' };
}

export async function updateFranchise(id: string, data: Partial<Franchise>) {
    await delay(500);
    console.log('Updating franchise', id, data);
    return { success: true, message: 'Franchise updated successfully' };
}

export async function deleteFranchise(id: string) {
    await delay(400);
    console.log('Deleting franchise', id);
    return { success: true, message: 'Franchise deleted' };
}

export async function assignModules(franchiseId: string, modules: FranchiseModule[]) {
    await delay(500);
    console.log('Assigning modules to', franchiseId, modules);
    return { success: true, message: 'Modules updated successfully' };
}

export async function getFranchiseActivity(franchiseId: string) {
    await delay(300);
    const activities = MOCK_FRANCHISE_ACTIVITIES.filter(a => a.franchiseId === franchiseId);
    return { success: true, data: activities };
}

export async function franchiseLogin(email: string, password: string) {
    await delay(600);
    const franchise = MOCK_FRANCHISES.find(f => f.email === email);
    if (!franchise) return { success: false, error: 'Invalid credentials' };
    if (franchise.status !== 'active') return { success: false, error: 'Franchise account is inactive' };
    return { success: true, data: franchise, message: 'Login successful' };
}
