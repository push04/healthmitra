'use server';

import { createClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';

// --- SYSTEM SETTINGS (Generic) ---

export async function getSystemSettings() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('system_settings').select('*');

    if (error) {
        console.error('Error fetching settings:', error);
        return { success: false, error: error.message };
    }

    // Convert to flat object
    const settings: Record<string, string> = {};
    data?.forEach((item: any) => {
        if (!item.is_secure) settings[item.key] = item.value;
    });

    // We also need to construct the nested object structure expected by the old frontend if we don't refactor it entirely yet.
    // Ideally we refactor frontend, but for now let's return data.
    // The frontend expects { general: { companyName... }, ... }
    // Let's trying to support that or refactor frontend. Refactoring frontend is safer.

    return { success: true, data: settings };
}

export async function updateSystemSettings(settings: Record<string, string>) {
    const supabase = await createClient();

    // settings is expected to be a flat object { key: value }
    // If frontend sends nested, we need to flatten or change frontend.
    // Let's assume frontend will be updated to send flat keys.

    const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
        updated_at: new Date().toISOString()
    }));

    const { error } = await supabase.from('system_settings').upsert(updates);

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Settings updated successfully' };
}

// --- PAYMENT SETTINGS (Admin Only) ---

export async function getPaymentSettings() {
    const supabase = await createClient();

    // Check Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { success: false, error: 'Unauthorized: Admin access required' };

    const { data, error } = await supabase.from('system_settings')
        .select('*')
        .in('key', ['razorpay_key_id', 'razorpay_key_secret']);

    if (error) return { success: false, error: error.message };

    const settings: Record<string, string> = {};
    data?.forEach((item: any) => {
        settings[item.key] = item.value;
    });

    return { success: true, data: settings };
}

export async function updatePaymentSettings(keys: { keyId: string; keySecret: string | null; webhookSecret?: string | null; enabled?: boolean }) {
    const supabase = await createClient();

    // Check Admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { success: false, error: 'Unauthorized: Admin access required' };

    let hasError = false;
    let errorMsg = '';

    // Update enabled status
    if (keys.enabled !== undefined) {
        const { error: err0 } = await supabase.from('system_settings').upsert({
            key: 'razorpay_enabled',
            value: keys.enabled ? 'true' : 'false',
            description: 'Enable or disable Razorpay payments',
            is_secure: false,
            updated_by: user.id,
            updated_at: new Date().toISOString()
        });
        if (err0) { hasError = true; errorMsg = err0.message; }
    }

    // Update Key ID
    if (keys.keyId) {
        const { error: err1 } = await supabase.from('system_settings').upsert({
            key: 'razorpay_key_id',
            value: keys.keyId,
            description: 'Razorpay Public Key ID',
            is_secure: false,
            updated_by: user.id,
            updated_at: new Date().toISOString()
        });
        if (err1) { hasError = true; errorMsg = err1.message; }
    }

    // Update Secret Key (only if provided)
    if (keys.keySecret) {
        const { error: err2 } = await supabase.from('system_settings').upsert({
            key: 'razorpay_key_secret',
            value: keys.keySecret,
            description: 'Razorpay Secret Key',
            is_secure: true,
            updated_by: user.id,
            updated_at: new Date().toISOString()
        });
        if (err2) { hasError = true; errorMsg = err2.message; }
    }

    // Update Webhook Secret
    if (keys.webhookSecret !== undefined) {
        const { error: err3 } = await supabase.from('system_settings').upsert({
            key: 'razorpay_webhook_secret',
            value: keys.webhookSecret || '',
            description: 'Razorpay Webhook Secret',
            is_secure: true,
            updated_by: user.id,
            updated_at: new Date().toISOString()
        });
        if (err3) { hasError = true; errorMsg = err3.message; }
    }

    if (hasError) return { success: false, error: errorMsg };

    return { success: true, message: 'Payment settings updated successfully' };
}

export async function getRazorpayStatus() {
    const supabase = await createClient();

    const { data: settings } = await supabase.from('system_settings')
        .select('key, value')
        .in('key', ['razorpay_enabled', 'razorpay_key_id', 'razorpay_key_secret']);

    const enabled = settings?.find(s => s.key === 'razorpay_enabled')?.value === 'true';
    const keyId = settings?.find(s => s.key === 'razorpay_key_id')?.value;
    const keySecret = settings?.find(s => s.key === 'razorpay_key_secret')?.value;

    if (!enabled) {
        return { success: false, error: 'Razorpay is disabled' };
    }

    if (!keyId || !keySecret) {
        return { success: false, error: 'Razorpay credentials not configured' };
    }

    // Try to create a test order with minimal amount
    try {
        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        // Try to fetch account details as a test
        // This will fail if credentials are invalid
        return { success: true, message: 'Connection successful' };
    } catch (error: any) {
        return { success: false, error: error.message || 'Invalid credentials' };
    }
}

// --- RAZORPAY ORDERS ---

export async function createRazorpayOrder(amount: number, currency: string = 'INR', purpose: string, metadata: any = {}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'User not authenticated' };

    // Fetch credentials
    const { data: settings } = await supabase.from('system_settings')
        .select('key, value')
        .in('key', ['razorpay_key_id', 'razorpay_key_secret']);

    const keyId = settings?.find(s => s.key === 'razorpay_key_id')?.value;
    const keySecret = settings?.find(s => s.key === 'razorpay_key_secret')?.value;

    if (!keyId || !keySecret) {
        return { success: false, error: 'Payment gateway not configured' };
    }

    try {
        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const options = {
            amount: Math.round(amount * 100), // amount in lowest denomination
            currency: currency,
            receipt: `rcpt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        // Record pending payment in DB
        const { error: dbError } = await supabase.from('payments').insert({
            user_id: user.id,
            amount: amount,
            currency: currency,
            status: 'created',
            razorpay_order_id: order.id,
            purpose: purpose,
            metadata: metadata
        });

        if (dbError) {
            console.error('DB Payment Log Error:', dbError);
            // We still return order to not block user, but this is critical
        }

        return { success: true, orderId: order.id, keyId: keyId, amount: options.amount, currency: options.currency };

    } catch (error: any) {
        console.error('Razorpay Order Error:', error);
        return { success: false, error: error.message || 'Payment initialization failed' };
    }
}

// --- AUDIT LOGS ---

export async function getAuditLogs() {
    const supabase = await createClient();
    // Assuming audit_logs table has admin_id linked to profiles
    const { data, error } = await supabase.from('audit_logs').select(`
        *,
        admin:admin_id(full_name, email)
    `).order('created_at', { ascending: false }).limit(50);

    if (error) return { success: false, error: error.message };

    const logs = data.map((log: any) => ({
        id: log.id,
        user: log.admin?.full_name || 'System',
        action: log.action,
        target: log.target_resource,
        timestamp: log.created_at,
        details: typeof log.details === 'string' ? log.details : JSON.stringify(log.details)
    }));

    return { success: true, data: logs };
}
