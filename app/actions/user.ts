'use server';

import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function getUserProfile() {
    const supabase = await createClient();
    const adminClient = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    // Use admin client to bypass RLS for profile fetch
    const { data, error } = await adminClient.from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) {
        // Fallback: try regular client
        const { data: fallbackData, error: fallbackError } = await supabase.from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        
        if (fallbackError) return { success: false, error: fallbackError.message };
        return { success: true, data: fallbackData };
    }

    return { success: true, data };
}

export async function updateUserProfile(formData: Record<string, any>) {
    const supabase = await createClient();
    const adminClient = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    // Strip out fields that should NOT be persisted
    const {
        current_password, new_password, confirm_password,
        bank_confirm_account,
        email_service_updates, email_reimbursement, email_wallet,
        email_renewal, email_promo, email_newsletter,
        sms_critical, sms_wallet, sms_appointments, sms_promo,
        language, theme,
        email, // Don't update email from profile form
        ...profileFields
    } = formData;

    // Only send non-empty values
    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(profileFields)) {
        if (value !== undefined && value !== '') {
            updates[key] = value;
        }
    }

    // Don't update if no fields to update
    if (Object.keys(updates).length === 0) {
        return { success: true, message: 'No changes to save' };
    }

    updates.updated_at = new Date().toISOString();

    // Use admin client to bypass RLS
    const { error } = await adminClient.from('profiles')
        .update(updates)
        .eq('id', user.id);

    if (error) {
        // Fallback: try regular client
        const { error: fallbackError } = await supabase.from('profiles')
            .update(updates)
            .eq('id', user.id);
        
        if (fallbackError) return { success: false, error: fallbackError.message };
    }

    return { success: true, message: 'Profile updated successfully' };
}

export async function getUserInvoices() {
    const supabase = await createClient();
    const adminClient = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    // Try to get from invoices table first
    let { data: invoices, error } = await adminClient.from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fallback to ecard_members if invoices table is empty or has error
    if ((!invoices || invoices.length === 0) && error) {
        console.error('Error fetching invoices:', error);
    }

    if (!invoices || invoices.length === 0) {
        // Get purchases from ecard_members
        let { data: purchases, error: purchaseError } = await adminClient
            .from('ecard_members')
            .select('*, plans(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        // Fallback to regular client
        if (purchaseError || !purchases) {
            ({ data: purchases, error: purchaseError } = await supabase
                .from('ecard_members')
                .select('*, plans(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false }));
        }

        if (purchases && purchases.length > 0) {
            // Get unique purchases by plan
            const planMap = new Map<string, any>();
            for (const p of purchases) {
                const key = p.plan_id || p.id;
                if (!planMap.has(key)) {
                    planMap.set(key, p);
                }
            }

            const fallbackInvoices = Array.from(planMap.values()).map((p: any) => {
                const amount = p.plans?.price || p.coverage_amount || 0;
                const gst = Math.round(amount * 0.18);
                return {
                    id: p.id,
                    user_id: p.user_id,
                    plan_id: p.plan_id,
                    invoice_number: `INV-${(p.id || '').slice(-8).toUpperCase()}`,
                    plan_name: p.plans?.name || 'Health Plan',
                    amount: amount,
                    gst: gst,
                    total: amount + gst,
                    payment_method: 'online',
                    transaction_id: p.card_unique_id || `TXN-${p.id?.slice(-8).toUpperCase()}`,
                    status: p.status === 'active' ? 'paid' : 'pending',
                    created_at: p.created_at,
                };
            });
            return { success: true, data: fallbackInvoices };
        }
    }

    return { success: true, data: invoices || [] };
}
