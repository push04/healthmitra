'use server';

import { createClient } from "@/lib/supabase/server";

export async function getUserProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase.from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) return { success: false, error: error.message };

    return { success: true, data };
}

export async function updateUserProfile(formData: Record<string, any>) {
    const supabase = await createClient();
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
        ...profileFields
    } = formData;

    // Only send non-empty values
    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(profileFields)) {
        if (value !== undefined && value !== '') {
            updates[key] = value;
        }
    }

    const { error } = await supabase.from('profiles')
        .update(updates)
        .eq('id', user.id);

    if (error) return { success: false, error: error.message };

    return { success: true, message: 'Profile updated successfully' };
}

export async function getUserInvoices() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase.from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invoices:', error);
        return { success: true, data: [] };
    }

    return { success: true, data };
}
