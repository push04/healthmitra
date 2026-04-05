import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: settings } = await supabase.from('system_settings')
            .select('key, value')
            .in('key', ['paypal_enabled', 'paypal_client_id', 'paypal_sandbox']);

        const enabled = settings?.find(s => s.key === 'paypal_enabled')?.value === 'true';
        const clientId = settings?.find(s => s.key === 'paypal_client_id')?.value || '';
        const sandbox = settings?.find(s => s.key === 'paypal_sandbox')?.value !== 'false';

        return NextResponse.json({ success: true, data: { enabled, clientId, sandbox } });
    } catch {
        return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
    }
}
