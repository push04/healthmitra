import { createBrowserClient } from '@supabase/ssr';
import { ApiResponse, DashboardData } from "@/types/dashboard";

function createBrowserSupabaseClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export async function createServiceRequest(supabaseClient: any, data: any) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return { error: 'Not authenticated' };

        const insertPayload: any = {
            ...data,
            user_id: user.id,
            status: 'pending',
            priority: data.priority || 'medium',
        };

        const { data: req, error } = await supabaseClient.from('service_requests').insert(insertPayload).select().single();

        if (error) return { error: error.message };
        return { data: req, error: null };
    } catch (error: any) {
        return { error: error.message || 'Failed to create service request' };
    }
}

export async function createClaim(data: any) {
    try {
        const supabase = createBrowserSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) return { error: 'Not authenticated' };

        const { user_id, ...restData } = data;
        
        const { data: claim, error } = await supabase.from('reimbursement_claims').insert({
            ...restData,
            user_id: user.id,
            status: 'pending'
        }).select().single();

        if (error) return { error: error.message };
        return { data: claim, error: null };
    } catch (error: any) {
        return { error: error.message || 'Failed to create claim' };
    }
}

export async function markNotificationAsRead(id: string) {
    try {
        const supabase = createBrowserSupabaseClient();
        const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function markAllNotificationsAsRead() {
    try {
        const supabase = createBrowserSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'Not authenticated' };
        
        const { error } = await supabase.from('notifications')
            .update({ is_read: true })
            .eq('recipient_id', user.id)
            .eq('is_read', false);
            
        if (error) return { success: false, error: error.message };
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
