import { createClient } from "@/lib/supabase/client";
import { ServiceRequestsResponse, ServiceRequest } from "@/types/service-request";

export async function fetchServiceRequests(params?: { type?: string; status?: string }): Promise<ServiceRequestsResponse> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, data: { requests: [], stats: { all: 0, pending: 0, in_progress: 0, completed: 0 } } };

    let query = supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (params?.type) query = query.eq('service_type', params.type);
    if (params?.status) query = query.eq('status', params.status);

    const { data, error } = await query;

    if (error) {
        console.error("Fetch requests error:", error);
        return { success: false, data: { requests: [], stats: { all: 0, pending: 0, in_progress: 0, completed: 0 } } };
    }

    // Calculate stats client-side for now or fetch aggregated
    const requests = data || [];
    const stats = {
        all: requests.length,
        pending: requests.filter((r: any) => r.status === 'pending').length,
        in_progress: requests.filter((r: any) => r.status === 'in_progress').length,
        completed: requests.filter((r: any) => r.status === 'completed').length
    };

    return {
        success: true,
        data: {
            requests: requests.map((r: any) => ({
                id: r.id,
                requestId: r.request_id || r.id, // Fallback
                type: r.service_type,
                status: r.status,
                createdAt: r.created_at,
                updatedAt: r.updated_at || r.created_at,
                details: r.details || {},
                timeline: r.timeline || [],
                messages: r.messages || []
            })),
            stats
        }
    };
}

export async function fetchServiceRequestById(id: string): Promise<ServiceRequest | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return null;

    return {
        id: data.id,
        requestId: data.request_id || data.id,
        type: data.service_type,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
        details: data.details || {},
        timeline: data.timeline || [],
        messages: data.messages || []
    };
}

export async function createServiceRequest(data: any): Promise<{ success: boolean; id?: string; error?: string }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "User not authenticated" };

    const { data: newRequest, error } = await supabase
        .from('service_requests')
        .insert({
            user_id: user.id,
            service_type: data.type, // Map 'type' to 'service_type'
            status: 'pending',
            details: data, // Store full form data in details jsonb
            created_at: new Date().toISOString()
        })
        .select('id')
        .single();

    if (error) {
        console.error("Create request error:", error);
        return { success: false, error: error.message };
    }

    return { success: true, id: newRequest.id };
}

export async function sendRequestMessage(requestId: string, message: string, attachments: string[] = []): Promise<boolean> {
    // Implementation would depend on a separate messages table or updating jsonb
    // For now, let's assuming we just log it or return true until schema is confirmed
    return true;
}

export async function cancelServiceRequest(requestId: string, reason: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
        .from('service_requests')
        .update({ status: 'cancelled', cancellation_reason: reason })
        .eq('id', requestId);

    return !error;
}
