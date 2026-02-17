'use server';

import { createClient } from '@/lib/supabase/server';
import { Plan, PlanCategory } from '@/types/plans';

// --- PLANS ACTIONS ---

export async function getPlans(filters?: {
    query?: string;
    status?: string;
    type?: string;
    categoryId?: string;
}) {
    const supabase = await createClient();
    let query = supabase.from('plans').select('*');

    if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }

    if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
    }

    if (filters?.query) {
        query = query.ilike('name', `%${filters.query}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    // Mapping to match Plan interface
    const plans: Plan[] = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        description: p.description,
        basePrice: p.price,
        gstPercent: 18, // Default or fetch
        totalPrice: p.price * 1.18, // Calc
        status: p.status,
        planImage: p.image_url,
        validityType: 'year', // Default for now
        validityValue: p.duration_months / 12,
        memberCountMin: 1,
        memberCountMax: 4,
        categoryIds: [],
        services: p.features ? p.features.map((f: string, i: number) => ({ id: `f_${i}`, name: f, status: 'enabled' })) : [],
        planDetails: [],
        showOnWebsite: true,
        isFeatured: p.is_featured,
        createdAt: p.created_at,
        updatedAt: p.updated_at
    }));

    return { success: true, data: plans };
}

export async function getPlan(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('plans').select('*').eq('id', id).single();

    if (error || !data) return { success: false, error: 'Plan not found' };

    const plan: Plan = {
        id: data.id,
        name: data.name,
        type: data.type,
        description: data.description,
        basePrice: data.price,
        gstPercent: 18,
        totalPrice: data.price ? data.price * 1.18 : 0,
        status: data.status,
        planImage: data.image_url,
        validityType: 'year',
        validityValue: data.duration_months ? data.duration_months / 12 : 1,
        memberCountMin: 1,
        memberCountMax: 4,
        categoryIds: [],
        services: data.features ? data.features.map((f: string, i: number) => ({ id: `f_${i}`, name: f, status: 'enabled' })) : [],
        planDetails: [],
        showOnWebsite: true,
        isFeatured: data.is_featured,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };

    return { success: true, data: plan };
}

export async function createPlan(data: Partial<Plan>) {
    const supabase = await createClient();
    const { error } = await supabase.from('plans').insert({
        name: data.name,
        price: data.basePrice,
        description: data.description,
        features: data.services?.map(s => s.name),
        duration_months: (data.validityValue || 1) * 12, // simple assertion
        type: data.type,
        status: data.status || 'draft',
        is_featured: data.isFeatured,
        image_url: data.planImage
    });

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Plan created successfully' };
}

export async function updatePlan(id: string, data: Partial<Plan>) {
    const supabase = await createClient();
    const { error } = await supabase.from('plans').update({
        name: data.name,
        price: data.basePrice,
        description: data.description,
        features: data.services?.map(s => s.name),
        status: data.status,
        is_featured: data.isFeatured,
        image_url: data.planImage
    }).eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Plan updated successfully' };
}

export async function deletePlan(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Plan deleted successfully' };
}

export async function togglePlanStatus(id: string, status: 'active' | 'inactive' | 'draft') {
    const supabase = await createClient();
    const { error } = await supabase.from('plans').update({ status }).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, message: `Plan status updated to ${status}` };
}

export async function copyPlan(id: string) {
    const supabase = await createClient();
    const { data: original } = await supabase.from('plans').select('*').eq('id', id).single();
    if (!original) return { success: false, error: 'Plan not found' };

    const { id: _, created_at, updated_at, ...rest } = original;
    const { error } = await supabase.from('plans').insert({
        ...rest,
        name: `${original.name} (Copy)`,
        status: 'draft'
    });

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Plan copied successfully' };
}

// --- CATEGORIES ACTIONS ---

export async function getCategories() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('plan_categories').select('*').order('display_order', { ascending: true });

    // Fallback if table doesn't exist yet or is empty
    if (error || !data) return { success: true, data: [] };

    const categories: PlanCategory[] = data.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        icon: c.icon,
        status: c.status,
        displayOrder: c.display_order
    }));

    return { success: true, data: categories };
}

export async function upsertCategory(data: Partial<PlanCategory>) {
    const supabase = await createClient();
    const payload = {
        name: data.name,
        description: data.description,
        icon: data.icon,
        status: data.status,
        display_order: data.displayOrder
    };

    let error;
    if (data.id) {
        ({ error } = await supabase.from('plan_categories').update(payload).eq('id', data.id));
    } else {
        ({ error } = await supabase.from('plan_categories').insert(payload));
    }

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Category saved successfully' };
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('plan_categories').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Category deleted successfully' };
}
