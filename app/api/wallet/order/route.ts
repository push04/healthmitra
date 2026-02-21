import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { amount } = await request.json();

        // Get Razorpay settings
        const { data: settings } = await supabase.from('system_settings')
            .select('key, value')
            .in('key', ['razorpay_enabled', 'razorpay_key_id', 'razorpay_key_secret']);

        const enabled = settings?.find(s => s.key === 'razorpay_enabled')?.value === 'true';
        const keyId = settings?.find(s => s.key === 'razorpay_key_id')?.value;
        const keySecret = settings?.find(s => s.key === 'razorpay_key_secret')?.value;

        if (!enabled || !keyId || !keySecret) {
            return NextResponse.json({ success: false, error: 'Razorpay not configured' }, { status: 400 });
        }

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `wallet_${Date.now()}`,
            notes: {
                userId: user.id,
                type: 'wallet_topup',
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                keyId,
            }
        });
    } catch (error: any) {
        console.error('Wallet order error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to create order' }, { status: 500 });
    }
}
