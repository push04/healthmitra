import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: settings } = await supabase.from('system_settings')
            .select('key, value')
            .in('key', ['razorpay_enabled', 'razorpay_key_id', 'razorpay_key_secret']);

        const enabled = settings?.find(s => s.key === 'razorpay_enabled')?.value === 'true';
        const keyId = settings?.find(s => s.key === 'razorpay_key_id')?.value || '';

        return NextResponse.json({
            success: true,
            data: {
                enabled,
                keyId,
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
    }
}
