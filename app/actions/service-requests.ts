'use server';

import { createClient, createAdminClient } from "@/lib/supabase/server";

// --- CLIENT ACTIONS ---

export async function getServiceRequests() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase.from('service_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    return { success: true, data };
}

export async function getServiceRequest(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    const { data, error } = await supabase.from('service_requests')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (error) return { success: false, error: error.message };

    return { success: true, data };
}

export async function createServiceRequest(data: { type: string; memberId?: string; details: Record<string, any> }) {
    const supabase = await createClient();
    const adminClient = await createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    // Generate request_id_display using UUID to avoid race conditions
    // Format: SR-YYYY-XXXXXX where XXXXXX is first 6 chars of UUID (ensures uniqueness)
    const year = new Date().getFullYear();
    const uniqueSuffix = crypto.randomUUID().replace(/-/g, '').substring(0, 6).toUpperCase();
    const requestIdDisplay = `SR-${year}-${uniqueSuffix}`;

    // If there's a conflict (very unlikely with UUID), append timestamp
    let finalRequestId = requestIdDisplay;
    const { data: existing } = await adminClient
        .from('service_requests')
        .select('id')
        .eq('request_id_display', requestIdDisplay)
        .maybeSingle();
    
    if (existing) {
        finalRequestId = `SR-${year}-${uniqueSuffix}-${Date.now().toString(36).toUpperCase()}`;
    }

    const { data: req, error } = await adminClient.from('service_requests').insert({
        user_id: user.id,
        type: data.type,
        status: 'pending',
        details: data.details,
        request_id_display: finalRequestId,
    }).select().single();

    if (error) {
        console.error('Service request creation error:', error);
        return { success: false, error: error.message };
    }

    return { success: true, data: req };
}

// --- ADMIN ACTIONS ---

export async function getAdminServiceRequests(filters?: { query?: string, status?: string, type?: string, agentId?: string }) {
    const supabase = await createAdminClient();

    // Fetch requests with user profile and assigned agent profile
    const { data: allData, error } = await supabase.from('service_requests')
        .select(`
            *,
            profiles:user_id (full_name, email, phone),
            agent:assigned_to (full_name, email)
        `)
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    // Calculate stats
    const stats = {
        total: allData.length,
        pending: allData.filter((r: any) => r.status === 'pending').length,
        assigned: allData.filter((r: any) => r.assigned_to).length,
        in_progress: allData.filter((r: any) => r.status === 'in_progress').length,
        completed: allData.filter((r: any) => r.status === 'completed').length,
        critical: allData.filter((r: any) => r.details?.priority === 'urgent').length
    };

    // Filter data
    let filteredData = allData;

    if (filters?.status && filters.status !== 'all') {
        filteredData = filteredData.filter((r: any) => r.status === filters.status);
    }
    if (filters?.type && filters.type !== 'all') {
        filteredData = filteredData.filter((r: any) => r.type === filters.type);
    }
    if (filters?.agentId && filters.agentId !== 'all') {
        filteredData = filteredData.filter((r: any) => r.assigned_to === filters.agentId);
    }
    if (filters?.query) {
        const q = filters.query.toLowerCase();
        filteredData = filteredData.filter((r: any) =>
            (r.request_id_display || '').toLowerCase().includes(q) ||
            r.profiles?.full_name?.toLowerCase().includes(q) ||
            r.profiles?.email?.toLowerCase().includes(q)
        );
    }

    // Map to ServiceRequest type
    const mappedRequests = filteredData.map((r: any) => ({
        id: r.id,
        requestId: r.request_id_display || (r.id || '').substring(0, 8),
        userId: r.user_id,
        customerName: r.profiles?.full_name || 'Guest',
        customerEmail: r.profiles?.email || '',
        customerContact: r.profiles?.phone || '',
        type: r.type,
        status: r.status,
        description: r.details?.description || r.details?.subject || '',
        priority: r.details?.priority || 'medium',
        requestedAt: r.created_at ? new Date(r.created_at).toLocaleDateString() + ' ' + new Date(r.created_at).toLocaleTimeString() : '',
        assignedAt: r.updated_at,
        assignedToId: r.assigned_to,
        assignedToName: r.agent?.full_name,
        notes: r.admin_notes || r.details?.admin_notes || '',
        details: r.details
    }));

    return { success: true, data: mappedRequests, stats };
}

export async function getAdminServiceRequest(id: string) {
    const supabase = await createAdminClient();

    const { data: r, error } = await supabase.from('service_requests')
        .select(`
            *,
            profiles:user_id (full_name, email, phone),
            agent:assigned_to (full_name, email)
        `)
        .eq('id', id)
        .single();

    if (error || !r) return { success: false, error: error?.message || 'Request not found' };

    const request = {
        id: r.id,
        requestId: r.request_id_display || (r.id || '').substring(0, 8),
        userId: r.user_id,
        customerName: r.profiles?.full_name || 'Guest',
        customerEmail: r.profiles?.email || '',
        customerContact: r.profiles?.phone || '',
        type: r.type,
        status: r.status,
        description: r.details?.description || r.details?.subject || '',
        priority: r.details?.priority || 'medium',
        requestedAt: r.created_at ? new Date(r.created_at).toLocaleDateString() + ' ' + new Date(r.created_at).toLocaleTimeString() : '',
        assignedAt: r.updated_at,
        assignedToId: r.assigned_to,
        assignedToName: r.agent?.full_name,
        assignedTo: r.agent ? { name: r.agent.full_name, email: r.agent.email } : undefined,
        notes: r.admin_notes || r.details?.admin_notes || '',
        details: r.details,
        completedAt: r.status === 'completed' ? r.updated_at : undefined,
        franchiseName: r.details?.franchise_name
    };

    return { success: true, data: request };
}

export async function getAgents() {
    const supabase = await createAdminClient();
    const { data, error } = await supabase.from('profiles')
        .select('id, full_name, email, phone')
        .in('role', ['admin', 'agent', 'employee', 'call_center_agent', 'call_centre_agent'])
        .order('full_name');

    if (error) return { success: false, error: error.message };

    const agents = data.map((p: any) => ({
        id: p.id,
        name: p.full_name || p.email,
        email: p.email,
        phone: p.phone || '',
        status: 'available' as const
    }));

    return { success: true, data: agents };
}

export async function assignServiceRequest(requestId: string, agentId: string) {
    const supabase = await createAdminClient();

    const { error } = await supabase.from('service_requests')
        .update({ assigned_to: agentId, status: 'in_progress' })
        .eq('id', requestId);

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Agent assigned successfully' };
}

export async function updateServiceRequestStatus(requestId: string, status: string, notes?: string) {
    const supabase = await createAdminClient();

    const updateData: any = { status };
    if (notes) updateData.admin_notes = notes;

    const { error } = await supabase.from('service_requests')
        .update(updateData)
        .eq('id', requestId);

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Status updated successfully' };
}
