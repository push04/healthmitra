import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const { planId, amount } = await request.json();

        const { data: settings } = await supabase.from('system_settings')
            .select('key, value')
            .in('key', ['paypal_enabled', 'paypal_client_id', 'paypal_client_secret', 'paypal_sandbox']);

        const enabled = settings?.find(s => s.key === 'paypal_enabled')?.value === 'true';
        const clientId = settings?.find(s => s.key === 'paypal_client_id')?.value;
        const clientSecret = settings?.find(s => s.key === 'paypal_client_secret')?.value;
        const sandbox = settings?.find(s => s.key === 'paypal_sandbox')?.value !== 'false';

        if (!enabled || !clientId || !clientSecret) {
            return NextResponse.json({ success: false, error: 'PayPal not configured' }, { status: 400 });
        }

        const { accessToken, base } = await getPayPalAccessToken(clientId, clientSecret, sandbox);

        // Amount is already in USD (prices stored in USD)
        const usdAmount = Number(amount).toFixed(2);

        const res = await fetch(`${base}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: { currency_code: 'USD', value: usdAmount },
                    custom_id: planId,
                    description: `Plan Purchase - ${planId}`,
                }],
                application_context: {
                    brand_name: 'HealthMitra',
                    user_action: 'PAY_NOW',
                },
            }),
        });

        const order = await res.json();
        if (!res.ok) throw new Error(order.message || 'Failed to create PayPal order');

        return NextResponse.json({
            success: true,
            data: { orderId: order.id, clientId },
        });
    } catch (error: any) {
        console.error('PayPal create-order error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to create order' }, { status: 500 });
    }
}
