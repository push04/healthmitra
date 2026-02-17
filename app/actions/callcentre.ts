'use server';

import { createClient } from '@/lib/supabase/server';
import { ServiceRequest, Agent } from '@/types/service-requests';

// --- AGENT LOGIN ---

export async function agentLogin(email: string, password: string) {
    const supabase = await createClient();
    // Assuming agents are users with role 'admin' or 'agent'
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    // Verify password via Auth signin usually, but if just checking profile existence for now:
    if (error || !profile) return { success: false, error: 'Invalid credentials.' };

    // Check role
    if (profile.role !== 'admin' && profile.role !== 'agent' && profile.role !== 'employee') return { success: false, error: 'Not authorized as agent.' };

    return {
        success: true,
        message: `Welcome, ${profile.full_name}!`,
        data: { agentId: profile.id, name: profile.full_name }
    };
}

// --- AGENT DASHBOARD ---

export async function getAgentAssignedRequests(agentId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('service_requests')
        .select(`
            *,
            user:user_id(full_name, email, phone),
            assignee:assigned_to(full_name, email, phone)
        `)
        .eq('assigned_to', agentId)
        .order('updated_at', { ascending: false });

    if (error) return { success: false, data: [] };

    const requests: ServiceRequest[] = data.map((item: any) => ({
        id: item.id,
        requestId: item.request_id || item.id,
        requestNo: item.request_id || 0,
        userId: item.user_id,
        customerName: item.user?.full_name || item.guest_name || 'Unknown',
        customerEmail: item.user?.email || item.guest_email || '',
        customerContact: item.user?.phone || item.guest_phone || '',
        type: item.type,
        status: item.status,
        description: item.description || '',
        priority: item.priority || 'medium',
        notes: item.admin_notes,
        assignedToId: item.assigned_to,
        assignedTo: item.assignee ? {
            id: item.assignee.id,
            name: item.assignee.full_name,
            email: item.assignee.email,
            phone: item.assignee.phone,
            status: 'available'
        } : undefined,
        requestedAt: item.created_at,
        assignedAt: item.assigned_at,
        completedAt: item.completed_at,
        franchiseId: item.franchise_id,
    }));

    return { success: true, data: requests };
}

// --- ALL REQUESTS (SUPERVISOR VIEW) ---

interface CCFilters {
    query?: string;
    status?: string;
    agentId?: string;
}

export async function getCallCentreRequests(filters: CCFilters = {}) {
    const supabase = await createClient();
    let query = supabase.from('service_requests').select(`
        *,
        user:user_id(full_name, email, phone),
        assignee:assigned_to(full_name, email, phone)
    `, { count: 'exact' });

    if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }

    if (filters.agentId && filters.agentId !== 'all') {
        query = query.eq('assigned_to', filters.agentId);
    }

    if (filters.query) {
        if (!isNaN(Number(filters.query))) {
            query = query.eq('request_id', Number(filters.query));
        }
    }

    const { data, error, count } = await query.order('created_at', { ascending: false });
    if (error) return { success: false, error: error.message };

    const requests: ServiceRequest[] = data.map((item: any) => ({
        id: item.id,
        requestId: item.request_id || item.id,
        requestNo: item.request_id || 0,
        userId: item.user_id,
        customerName: item.user?.full_name || item.guest_name || 'Unknown',
        customerEmail: item.user?.email || item.guest_email || '',
        customerContact: item.user?.phone || item.guest_phone || '',
        type: item.type,
        status: item.status,
        description: item.description || '',
        priority: item.priority || 'medium',
        notes: item.admin_notes,
        assignedToId: item.assigned_to,
        assignedTo: item.assignee ? {
            id: item.assignee.id,
            name: item.assignee.full_name,
            email: item.assignee.email,
            phone: item.assignee.phone,
            status: 'available'
        } : undefined,
        requestedAt: item.created_at,
        assignedAt: item.assigned_at,
        completedAt: item.completed_at,
        franchiseId: item.franchise_id,
    }));

    // Stats
    const stats = {
        total: count || 0,
        pending: requests.filter(r => r.status === 'pending').length,
        assigned: requests.filter(r => r.status === 'assigned').length,
        inProgress: requests.filter(r => r.status === 'in_progress').length,
        completed: requests.filter(r => r.status === 'completed').length,
    };

    return { success: true, data: requests, stats };
}

// --- AGENT MANAGEMENT ---

export async function getAgents() {
    const supabase = await createClient();
    const { data } = await supabase.from('profiles').select('*').in('role', ['admin', 'agent', 'employee']);

    // For assigned count, we would need a join or separate query. For now, 0.
    // Optimization: supabase.rpc or specific query.

    return {
        success: true, data: data?.map((a: any) => ({
            id: a.id,
            name: a.full_name,
            email: a.email,
            phone: a.phone || '',
            itemRole: 'Agent',
            status: 'available' as any, // Cast to match Agent status type
            assignedCount: 0, // Placeholder
            completedCount: 0 // Placeholder
        })) || []
    };
}

// --- REPORTS ---

export async function getCallCentreReports() {
    const supabase = await createClient();

    // Simple aggregation
    const { count: total } = await supabase.from('service_requests').select('*', { count: 'exact', head: true });

    // We can do more sophisticated grouping with RPC if needed. 
    // For now, let's return placeholders or empty arrays to avoid errors.

    return { success: true, data: { byType: [], byStatus: [], byAgent: [], total: total || 0 } };
}

// --- ASSIGN REQUEST ---

export async function assignRequestToAgent(requestId: string, agentId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('service_requests')
        .update({ assigned_to: agentId, status: 'assigned', updated_at: new Date().toISOString() })
        .eq('id', requestId);

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Request assigned successfully' };
}
