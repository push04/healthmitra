'use server';

import { createClient } from "@/lib/supabase/server";

export async function getECards() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase.from('ecard_members')
        .select('*, plans(name, coverage_amount)')
        .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };

    // Format for View
    const cards = data.map(m => ({
        id: m.id,
        user_id: m.user_id,
        card_number: m.card_unique_id || 'PENDING',
        member_name: m.full_name,
        relation: m.relation,
        dob: m.dob,
        gender: m.gender,
        valid_from: m.valid_from,
        valid_till: m.valid_till,
        status: m.status,
        plan_name: m.plans?.name || 'Unknown Plan',
        coverage_amount: m.plans?.coverage_amount || 0,
        emergency_contact: m.contact_number || '+91 1800 123 4567' // Fallback or fetch from profile?
    }));

    return { success: true, data: cards };
}

export async function getAvailableMembers() {
    // This might be same as getECards but just names/relations?
    // The view expects: { id, name, relation, dob, gender, hasCard }
    const res = await getECards();
    if (!res.success) return [];

    return res.data?.map((c: any) => ({
        id: c.id,
        name: c.member_name,
        relation: c.relation,
        dob: c.dob,
        gender: c.gender,
        hasCard: true // Since we fetched from ecard_members
    })) || [];
}

export async function getMyPurchases() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    // Fetch 'Self' members as they represent the primary policy holder/purchase
    const { data, error } = await supabase.from('ecard_members')
        .select('*, plans(*)')
        .eq('user_id', user.id)
        .eq('relation', 'Self');

    if (error) return { success: false, error: error.message };

    const purchases = data.map(m => ({
        id: m.id, // Using Member ID as Purchase ID
        plan_name: m.plans?.name,
        status: m.status,
        coverage_amount: m.plans?.coverage_amount,
        start_date: m.valid_from,
        expiry_date: m.valid_till,
        created_at: m.created_at,
        price: m.plans?.price, // needed for detail
        type: 'Family' // Hardcoded or derive from plan features?
    }));

    return { success: true, data: purchases };
}

export async function getPurchaseDetail(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase.from('ecard_members')
        .select('*, plans(*)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error) return { success: false, error: error.message };

    return {
        success: true, data: {
            id: data.id,
            status: data.status,
            valid_until: data.valid_till,
            created_at: data.created_at,
            plans: {
                name: data.plans?.name,
                coverage_amount: data.plans?.coverage_amount,
                price: data.plans?.price,
                type: 'Family' // Placeholder
            },
            member: { // Extra details for the view if needed
                name: data.full_name,
                relation: data.relation
            }
        }
    };
}
