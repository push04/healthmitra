'use server';

import { createClient } from '@/lib/supabase/server';
import { ServiceRequest, SRType, SRStatus, Agent } from '@/types/service-requests';

interface ProfileData {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    role: string;
}

interface ServiceRequestRow {
    id: string;
    request_id: string | null;
    user_id: string | null;
    type: string;
    status: string;
    description: string | null;
    priority: string | null;
    admin_notes: string | null;
    assigned_to: string | null;
    created_at: string;
    assigned_at: string | null;
    completed_at: string | null;
    franchise_id: string | null;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    user?: {
        full_name: string | null;
        email: string | null;
        phone: string | null;
    } | null;
    assignee?: {
        id: string;
        full_name: string | null;
        email: string | null;
        phone: string | null;
    } | null;
}

export async function agentLogin(email: string, _password: string) {
    const supabase = await createClient();
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !profile) return { success: false, error: 'Invalid credentials.' };

    const profileData = profile as ProfileData;
    if (profileData.role !== 'admin' && profileData.role !== 'agent' && profileData.role !== 'employee') return { success: false, error: 'Not authorized as agent.' };

    return {
        success: true,
        message: `Welcome, ${profileData.full_name}!`,
        data: { agentId: profileData.id, name: profileData.full_name }
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

    const requests: ServiceRequest[] = data.map((item: ServiceRequestRow): ServiceRequest => ({
        id: item.id,
        requestId: item.request_id || item.id,
        userId: item.user_id || undefined,
        customerName: item.user?.full_name || item.guest_name || 'Unknown',
        customerEmail: item.user?.email || item.guest_email || '',
        customerContact: item.user?.phone || item.guest_phone || '',
        type: item.type as SRType,
        status: item.status as SRStatus,
        description: item.description || '',
        priority: item.priority as ServiceRequest['priority'],
        notes: item.admin_notes ?? undefined,
        assignedToId: item.assigned_to || undefined,
        assignedToName: item.assignee?.full_name ?? undefined,
        requestedAt: item.created_at,
        assignedAt: item.assigned_at || undefined,
        completedAt: item.completed_at || undefined,
        franchiseId: item.franchise_id || undefined,
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

    const requests: ServiceRequest[] = data.map((item: ServiceRequestRow): ServiceRequest => ({
        id: item.id,
        requestId: item.request_id || item.id,
        userId: item.user_id || undefined,
        customerName: item.user?.full_name || item.guest_name || 'Unknown',
        customerEmail: item.user?.email || item.guest_email || '',
        customerContact: item.user?.phone || item.guest_phone || '',
        type: item.type as SRType,
        status: item.status as SRStatus,
        description: item.description || '',
        priority: item.priority as ServiceRequest['priority'],
        notes: item.admin_notes ?? undefined,
        assignedToId: item.assigned_to || undefined,
        assignedToName: item.assignee?.full_name ?? undefined,
        requestedAt: item.created_at,
        assignedAt: item.assigned_at || undefined,
        completedAt: item.completed_at || undefined,
        franchiseId: item.franchise_id || undefined,
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

    const agentStatus: Agent['status'] = 'available';

    return {
        success: true, data: data?.map((a: ProfileData): Agent => ({
            id: a.id,
            name: a.full_name ?? '',
            email: a.email ?? '',
            phone: a.phone ?? '',
            status: agentStatus,
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
