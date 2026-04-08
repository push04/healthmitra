import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

async function getPayPalAccessToken(clientId: string, clientSecret: string, sandbox: boolean) {
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
    if (!res.ok) throw new Error(data.error_description || 'Failed to get PayPal token');
    return { accessToken: data.access_token, base };
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const adminClient = await createAdminClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { paypalOrderId, planId } = await request.json();

        const { data: settings } = await supabase.from('system_settings')
            .select('key, value')
            .in('key', ['paypal_client_id', 'paypal_client_secret', 'paypal_sandbox']);

        const clientId = settings?.find(s => s.key === 'paypal_client_id')?.value;
        const clientSecret = settings?.find(s => s.key === 'paypal_client_secret')?.value;
        const sandbox = settings?.find(s => s.key === 'paypal_sandbox')?.value !== 'false';

        if (!clientId || !clientSecret) {
            return NextResponse.json({ success: false, error: 'PayPal not configured' }, { status: 400 });
        }

        const { accessToken, base } = await getPayPalAccessToken(clientId, clientSecret, sandbox);

        // Capture the order
        const captureRes = await fetch(`${base}/v2/checkout/orders/${paypalOrderId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const captureData = await captureRes.json();
        if (!captureRes.ok || captureData.status !== 'COMPLETED') {
            throw new Error(captureData.message || 'PayPal capture failed');
        }

        const captureId = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id;

        // Get plan details
        const { data: plan, error: planError } = await supabase
            .from('plans').select('*').eq('id', planId).single();
        if (planError || !plan) {
            return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 });
        }

        // Ensure profile exists — use admin client to bypass RLS
        try {
            await adminClient.from('profiles').upsert({
                id: user.id,
                full_name: user.email?.split('@')[0] || 'User',
                email: user.email,
                role: 'customer',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }, { onConflict: 'id', ignoreDuplicates: true });
        } catch (_) {}

        // Create membership — use admin client
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + (plan.duration_days || 365));

        const { data: member, error: memberError } = await adminClient
            .from('ecard_members')
            .insert({
                user_id: user.id,
                plan_id: planId,
                full_name: user.email?.split('@')[0] || 'User',
                relation: 'Self',
                status: 'active',
                valid_from: startDate.toISOString().split('T')[0],
                valid_till: expiryDate.toISOString().split('T')[0],
                coverage_amount: plan.coverage_amount || plan.price * 100,
                card_unique_id: `HM${Date.now()}${crypto.randomUUID().replace(/-/g,'').slice(0,9).toUpperCase()}`,
            })
            .select().single();

        if (memberError) {
            return NextResponse.json({ success: false, error: 'Failed to create membership: ' + memberError.message }, { status: 500 });
        }

        // Create payment record — use admin client
        await adminClient.from('payments').insert({
            user_id: user.id,
            plan_id: planId,
            amount: plan.price,
            currency: 'INR',
            status: 'captured',
            razorpay_order_id: null,
            razorpay_payment_id: captureId || paypalOrderId,
            payment_method: 'paypal',
        });

        // Create invoice — use admin client
        const gstAmount = Math.round(plan.price * 0.18);
        await adminClient.from('invoices').insert({
            user_id: user.id,
            plan_id: planId,
            invoice_number: `INV-${Date.now()}${crypto.randomUUID().replace(/-/g,'').slice(0,6).toUpperCase()}`,
            plan_name: plan.name,
            amount: plan.price,
            gst: gstAmount,
            total: plan.price + gstAmount,
            payment_method: 'paypal',
            transaction_id: captureId || paypalOrderId,
            status: 'paid',
        });

        return NextResponse.json({
            success: true,
            data: {
                membershipId: member.id,
                planName: plan.name,
                amount: plan.price,
                startDate: startDate.toISOString(),
                expiryDate: expiryDate.toISOString(),
                transactionId: captureId || paypalOrderId,
            },
        });
    } catch (error: any) {
        console.error('PayPal capture error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Payment capture failed' }, { status: 500 });
    }
}
