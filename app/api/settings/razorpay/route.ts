import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const adminClient = await createAdminClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const { data: profile } = await adminClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        const { data: settings } = await adminClient.from('system_settings')
            .select('key, value')
            .in('key', ['razorpay_enabled', 'razorpay_key_id', 'razorpay_key_secret']);

        if (!settings) {
            return NextResponse.json({ success: false, error: 'Settings not found' }, { status: 404 });
        }

        const enabled = settings.find(s => s.key === 'razorpay_enabled')?.value === 'true';
        const keyId = settings.find(s => s.key === 'razorpay_key_id')?.value || '';

        return NextResponse.json({
            success: true,
            data: {
                enabled,
                keyId,
            }
        });
    } catch (error) {
        console.error('Razorpay settings error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
    }
}
