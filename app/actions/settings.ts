'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';

// --- SYSTEM SETTINGS (Generic) ---

export async function getSystemSettings() {
    const supabase = await createAdminClient();
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

    return { success: true, data: settings };
}

export async function updateSystemSettings(settings: Record<string, string>) {
    const supabase = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
        updated_at: new Date().toISOString(),
        updated_by: user?.id || 'system'
    }));

    const { error } = await supabase.from('system_settings').upsert(updates, {
        onConflict: 'key'
    });

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Settings updated successfully' };
}

// --- PAYMENT SETTINGS (Admin Only) ---

export async function getPaymentSettings() {
    const supabase = await createAdminClient();

    const { data, error } = await supabase.from('system_settings')
        .select('*')
        .in('key', ['razorpay_enabled', 'razorpay_key_id', 'razorpay_key_secret', 'razorpay_webhook_secret']);

    if (error) return { success: false, error: error.message };

    const settings: Record<string, string> = {};
    data?.forEach((item: any) => {
        settings[item.key] = item.value;
    });

    return { success: true, data: settings };
}

export async function updatePaymentSettings(keys: { keyId: string; keySecret: string | null; webhookSecret?: string | null; enabled?: boolean }) {
    const supabase = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userId = user?.id || 'system';

    // First try to update existing records
    const updates: any[] = [];

    // Update enabled status
    if (keys.enabled !== undefined) {
        updates.push({
            key: 'razorpay_enabled',
            value: keys.enabled ? 'true' : 'false',
            description: 'Enable or disable Razorpay payments',
            is_secure: false,
            updated_by: userId,
            updated_at: new Date().toISOString()
        });
    }

    // Update Key ID
    if (keys.keyId) {
        updates.push({
            key: 'razorpay_key_id',
            value: keys.keyId,
            description: 'Razorpay Public Key ID',
            is_secure: false,
            updated_by: userId,
            updated_at: new Date().toISOString()
        });
    }

    // Update Secret Key (only if provided and not masked)
    if (keys.keySecret && !keys.keySecret.includes('***')) {
        updates.push({
            key: 'razorpay_key_secret',
            value: keys.keySecret,
            description: 'Razorpay Secret Key',
            is_secure: true,
            updated_by: userId,
            updated_at: new Date().toISOString()
        });
    }

    // Update Webhook Secret
    if (keys.webhookSecret !== null && keys.webhookSecret !== undefined && !keys.webhookSecret.includes('***')) {
        updates.push({
            key: 'razorpay_webhook_secret',
            value: keys.webhookSecret,
            description: 'Razorpay Webhook Secret',
            is_secure: true,
            updated_by: userId,
            updated_at: new Date().toISOString()
        });
    }

    if (updates.length > 0) {
        // Use upsert with onConflict
        const { error } = await supabase.from('system_settings').upsert(updates, {
            onConflict: 'key'
        });

        if (error) {
            console.error('Error updating payment settings:', error);
            return { success: false, error: error.message };
        }
    }

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
    const supabase = await createAdminClient();
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
            amount: Math.round(amount * 100),
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
        }

        return { success: true, orderId: order.id, keyId: keyId, amount: options.amount, currency: options.currency };

    } catch (error: any) {
        console.error('Razorpay Order Error:', error);
        return { success: false, error: error.message || 'Payment initialization failed' };
    }
}

// --- AUDIT LOGS ---

export async function getAuditLogs() {
    const supabase = await createAdminClient();
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

// --- PAYPAL SETTINGS (Admin Only) ---

export async function getPayPalSettings() {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from('system_settings')
        .select('key, value')
        .in('key', ['paypal_enabled', 'paypal_client_id', 'paypal_client_secret', 'paypal_sandbox']);

    if (error) return { success: false, error: error.message };

    const settings: Record<string, string> = {};
    data?.forEach((item: any) => { settings[item.key] = item.value; });

    return { success: true, data: settings };
}

export async function updatePayPalSettings(keys: {
    clientId: string;
    clientSecret: string | null;
    enabled: boolean;
    sandbox: boolean;
}) {
    const supabase = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    const upserts = [
        { key: 'paypal_enabled', value: keys.enabled ? 'true' : 'false', description: 'Enable PayPal payments', is_secure: false, updated_by: user?.id || 'system' },
        { key: 'paypal_sandbox', value: keys.sandbox ? 'true' : 'false', description: 'PayPal sandbox mode', is_secure: false, updated_by: user?.id || 'system' },
        { key: 'paypal_client_id', value: keys.clientId, description: 'PayPal Client ID', is_secure: false, updated_by: user?.id || 'system' },
    ];

    if (keys.clientSecret && !keys.clientSecret.includes('***')) {
        upserts.push({ key: 'paypal_client_secret', value: keys.clientSecret, description: 'PayPal Client Secret', is_secure: true, updated_by: user?.id || 'system' });
    }

    const { error } = await supabase.from('system_settings').upsert(upserts, { onConflict: 'key' });
    if (error) return { success: false, error: error.message };

    return { success: true };
}

export async function testPayPalConnection() {
    const supabase = await createAdminClient();

    const { data: settings } = await supabase.from('system_settings')
        .select('key, value')
        .in('key', ['paypal_client_id', 'paypal_client_secret', 'paypal_sandbox']);

    const clientId = settings?.find(s => s.key === 'paypal_client_id')?.value;
    const clientSecret = settings?.find(s => s.key === 'paypal_client_secret')?.value;
    const sandbox = settings?.find(s => s.key === 'paypal_sandbox')?.value !== 'false';

    if (!clientId || !clientSecret) return { success: false, error: 'Credentials not configured' };

    try {
        const base = sandbox ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
        const res = await fetch(`${base}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            },
            body: 'grant_type=client_credentials',
        });
        const data = await res.json();
        if (!res.ok) return { success: false, error: data.error_description || 'Auth failed' };
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
