'use server'

import { Plan, PlanCategory, MOCK_PLANS, MOCK_CATEGORIES } from '@/app/lib/mock/plans-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- PLANS ACTIONS ---

export async function getPlans(filters?: {
    query?: string;
    status?: string;
    type?: string;
    categoryId?: string;
}) {
    await delay(500);
    let plans = [...MOCK_PLANS];

    if (filters?.query) {
        const q = filters.query.toLowerCase();
        plans = plans.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }

    if (filters?.status && filters.status !== 'all') {
        plans = plans.filter(p => p.status === filters.status);
    }

    if (filters?.type && filters.type !== 'all') {
        plans = plans.filter(p => p.type === filters.type);
    }

    if (filters?.categoryId && filters.categoryId !== 'all') {
        plans = plans.filter(p => p.categoryIds.includes(filters.categoryId || ''));
    }

    return { success: true, data: plans };
}

export async function getPlan(id: string) {
    await delay(300);
    const plan = MOCK_PLANS.find(p => p.id === id);
    if (!plan) return { success: false, error: 'Plan not found' };
    return { success: true, data: plan };
}

export async function createPlan(data: Partial<Plan>) {
    await delay(800);
    console.log('Creating Plan:', data);
    const newPlan: Plan = {
        ...data as Plan,
        id: `PLAN-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    return { success: true, message: 'Plan created successfully', data: newPlan };
}

export async function updatePlan(id: string, data: Partial<Plan>) {
    await delay(600);
    console.log(`Updating Plan ${id}:`, data);
    return { success: true, message: 'Plan updated successfully' };
}

export async function deletePlan(id: string) {
    await delay(500);
    console.log(`Deleting Plan ${id}`);
    return { success: true, message: 'Plan deleted successfully' };
}

export async function togglePlanStatus(id: string, status: 'active' | 'inactive' | 'draft') {
    await delay(400);
    console.log(`Toggling Plan ${id} to ${status}`);
    return { success: true, message: `Plan status updated to ${status}` };
}

export async function copyPlan(id: string) {
    await delay(600);
    const originalPlan = MOCK_PLANS.find(p => p.id === id);
    if (!originalPlan) return { success: false, error: 'Plan not found' };

    const copiedPlan: Plan = {
        ...originalPlan,
        id: `PLAN-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        name: `${originalPlan.name} (Copy)`,
        status: 'draft',
        showOnWebsite: false,
        isFeatured: false,
        slug: originalPlan.slug ? `${originalPlan.slug}-copy` : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    console.log('Copied Plan:', copiedPlan);
    return { success: true, message: 'Plan copied successfully', data: copiedPlan };
}


// --- CATEGORIES ACTIONS ---

export async function getCategories() {
    await delay(300);
    return { success: true, data: MOCK_CATEGORIES };
}

export async function upsertCategory(data: Partial<PlanCategory>) {
    await delay(500);
    console.log('Upserting Category:', data);
    return { success: true, message: 'Category saved successfully' };
}

export async function deleteCategory(id: string) {
    await delay(400);
    console.log(`Deleting Category ${id}`);
    return { success: true, message: 'Category deleted successfully' };
}
