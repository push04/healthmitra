'use server';

import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function getECards() {
    const supabase = await createClient();
    const adminClient = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    // Use admin client to bypass RLS
    let { data, error } = await adminClient.from('ecard_members')
        .select('*, plans(name, price, coverage_amount, features)')
        .eq('user_id', user.id);

    // Fallback to regular client if admin fails
    if (error) {
        ({ data, error } = await supabase.from('ecard_members')
            .select('*, plans(name, price, coverage_amount, features)')
            .eq('user_id', user.id));
    }

    if (error) return { success: false, error: error.message };

    // Format for View
    const cards = (data || []).map((m: any) => ({
        id: m.id,
        user_id: m.user_id,
        plan_id: m.plan_id,
        card_number: m.card_unique_id || 'PENDING',
        member_name: m.full_name,
        relation: m.relation,
        dob: m.dob,
        gender: m.gender,
        valid_from: m.valid_from,
        valid_till: m.valid_till,
        status: m.status,
        plan_name: m.plans?.name || 'Health Plan',
        plan_price: m.plans?.price || 0,
        plan_features: m.plans?.features || [],
        coverage_amount: m.plans?.coverage_amount || m.coverage_amount || 0,
        emergency_contact: m.contact_number || null
    }));

    return { success: true, data: cards };
}

export async function getAvailableMembers() {
    const supabase = await createClient();
    const adminClient = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    // Fetch all members directly
    let { data, error } = await adminClient.from('ecard_members')
        .select('id, full_name, relation, dob, gender')
        .eq('user_id', user.id);

    if (error) {
        ({ data, error } = await supabase.from('ecard_members')
            .select('id, full_name, relation, dob, gender')
            .eq('user_id', user.id));
    }

    if (error || !data) return [];

    return data.map((m: any) => ({
        id: m.id,
        name: m.full_name || m.relation,
        relation: m.relation,
        dob: m.dob,
        gender: m.gender,
        hasCard: !!m.full_name
    }));
}

export async function getMyPurchases() {
    const supabase = await createClient();
    const adminClient = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    // Fetch ALL member purchases for this user (including Self and family members)
    // Group by plan_id to show unique plan purchases
    const { data, error } = await adminClient.from('ecard_members')
        .select('*, plans(*)')
        .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };

    // Group by plan_id and take first 'Self' member for each plan
    const planMap = new Map<string, any>();
    
    for (const m of data) {
        // If we haven't seen this plan_id yet, add this member
        if (!planMap.has(m.plan_id)) {
            planMap.set(m.plan_id, m);
        } else if (m.relation === 'Self') {
            // If this is 'Self' relation, prioritize it
            planMap.set(m.plan_id, m);
        }
    }

    const purchases = Array.from(planMap.values()).map((m: any) => {
        // Determine status based on valid_till
        const isExpired = m.valid_till && new Date(m.valid_till) < new Date();
        const status = isExpired ? 'expired' : (m.status === 'active' ? 'active' : m.status);
        
        return {
            id: m.id,
            plan_name: m.plans?.name || 'Health Plan',
            status: status,
            coverage_amount: m.coverage_amount || m.plans?.coverage_amount || 0,
            start_date: m.valid_from,
            expiry_date: m.valid_till,
            created_at: m.created_at,
            price: m.plans?.price || 0,
            type: 'Family',
            members_count: data.filter((d: any) => d.plan_id === m.plan_id).length,
            isFirstPurchase: m.relation === 'Self' && m.created_at === data.find((d: any) => d.plan_id === m.plan_id && d.relation === 'Self')?.created_at
        };
    });

    // Sort by creation date, newest first
    purchases.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { success: true, data: purchases };
}

export async function getPurchaseDetail(id: string) {
    const supabase = await createClient();
    const adminClient = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    // Use admin client to bypass RLS
    let { data, error } = await adminClient.from('ecard_members')
        .select('*, plans(*)')
        .eq('id', id)
        .single();

    // Fallback to regular client if admin fails
    if (error || !data) {
        ({ data, error } = await supabase.from('ecard_members')
            .select('*, plans(*)')
            .eq('id', id)
            .eq('user_id', user.id)
            .single());
    }

    // Final fallback: just check if the record exists for this user
    if (error || !data) {
        return { success: false, error: 'Purchase not found' };
    }

    // Verify ownership
    if (data.user_id !== user.id) {
        return { success: false, error: 'Unauthorized access' };
    }

    return {
        success: true, data: {
            id: data.id,
            status: data.status,
            valid_until: data.valid_till,
            created_at: data.created_at,
            plans: {
                name: data.plans?.name || 'Health Plan',
                coverage_amount: data.plans?.coverage_amount || data.coverage_amount || 0,
                price: data.plans?.price || 0,
                type: 'Family'
            },
            member: {
                name: data.full_name,
                relation: data.relation
            }
        }
    };
}
