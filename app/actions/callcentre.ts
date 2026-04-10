'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { ServiceRequest, SRType, SRStatus, Agent } from '@/types/service-requests';

interface ProfileData {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    role: string;
}

export async function getCallCentreStats() {
    const supabase = await createAdminClient();
    
    const { count: totalRequests } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true });

    const { count: pendingRequests } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    const { count: completedToday } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', new Date().toISOString().split('T')[0]);

    const { data: agents } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['admin', 'agent', 'employee']);

    const activeAgents = agents?.filter((a: any) => a.role === 'agent').length || 0;

    return {
        success: true,
        data: {
            totalRequests: totalRequests || 0,
            pendingRequests: pendingRequests || 0,
            completedToday: completedToday || 0,
            activeAgents,
            totalAgents: agents?.length || 0
        }
    };
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

export async function agentLogin(email: string, password: string) {
    const supabase = await createClient();
    
    // First authenticate using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError || !authData.user) {
        return { success: false, error: 'Invalid credentials.' };
    }

    // Then check if user has agent role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    if (profileError || !profile) return { success: false, error: 'Profile not found.' };

    const profileData = profile as ProfileData;
    if (profileData.role !== 'admin' && profileData.role !== 'agent' && profileData.role !== 'employee') {
        // Sign out since they're not authorized
        await supabase.auth.signOut();
        return { success: false, error: 'Not authorized as agent.' };
    }

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
    const supabase = await createAdminClient();
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

    const { data: requests } = await supabase
        .from('service_requests')
        .select('type, status, assigned_to');

    const total = requests?.length || 0;

    // Aggregate by type
    const typeMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {};
    const agentMap: Record<string, number> = {};

    requests?.forEach((r: any) => {
        if (r.type) typeMap[r.type] = (typeMap[r.type] || 0) + 1;
        if (r.status) statusMap[r.status] = (statusMap[r.status] || 0) + 1;
        if (r.assigned_to) agentMap[r.assigned_to] = (agentMap[r.assigned_to] || 0) + 1;
    });

    const byType = Object.entries(typeMap).map(([name, value]) => ({ name, value }));
    const byStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
    const byAgent = Object.entries(agentMap).map(([agentId, value]) => ({ agentId, value }));

    return { success: true, data: { byType, byStatus, byAgent, total } };
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

// --- CREATE AGENT ---

export async function createAgent(data: { name: string; email: string; phone: string; role: string }) {
    const adminSupabase = await createAdminClient();
    
    // First check if user exists with this email
    const { data: existingProfile } = await adminSupabase
        .from('profiles')
        .select('id, email')
        .eq('email', data.email)
        .single();

    if (existingProfile) {
        // Update existing profile to be an agent
        const { error: updateError } = await adminSupabase
            .from('profiles')
            .update({ role: data.role || 'agent' })
            .eq('id', existingProfile.id);

        if (updateError) {
            return { success: false, error: updateError.message };
        }

        // Check if already in call_centre_agents
        const { data: existingAgent } = await adminSupabase
            .from('call_centre_agents')
            .select('id')
            .eq('user_id', existingProfile.id)
            .single();

        if (!existingAgent) {
            // Insert new agent record
            const { error: agentError } = await adminSupabase.from('call_centre_agents').insert({
                user_id: existingProfile.id,
                agent_name: data.name,
                agent_email: data.email,
                agent_phone: data.phone,
                role: data.role || 'agent',
                status: 'active',
                is_available: true
            });

            if (agentError) {
                return { success: false, error: agentError.message };
            }
        } else {
            // Update existing agent
            const { error: agentError } = await adminSupabase
                .from('call_centre_agents')
                .update({
                    agent_name: data.name,
                    agent_email: data.email,
                    agent_phone: data.phone,
                    role: data.role || 'agent',
                    status: 'active'
                })
                .eq('user_id', existingProfile.id);

            if (agentError) {
                return { success: false, error: agentError.message };
            }
        }

        return { success: true, message: 'Agent added successfully (existing user)' };
    }

    // Generate a temporary password for the agent
    const tempPassword = generateTempPassword();

    // Create a new user with admin API using service role key
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
            full_name: data.name,
            phone: data.phone,
            role: 'agent'
        }
    });

    if (authError) {
        console.log('Admin create failed:', authError.message);
        return { 
            success: false, 
            error: 'Cannot create user. Error: ' + authError.message 
        };
    }

    // Create agent profile in profiles table
    if (authData.user) {
        // Use 'call_center_agent' as the role (valid role per constraint)
        const agentRole = 'call_center_agent';
        
        try {
            const { error: profileError } = await adminSupabase.from('profiles').insert({
                id: authData.user.id,
                email: data.email,
                full_name: data.name,
                phone: data.phone,
                role: agentRole,
                status: 'active'
            });

            if (profileError && !profileError.message.includes('duplicate')) {
                // If error is not duplicate key, try to update existing
                await adminSupabase.from('profiles').update({
                    email: data.email,
                    full_name: data.name,
                    phone: data.phone,
                    role: agentRole,
                    status: 'active'
                }).eq('id', authData.user.id);
            }
        } catch (e) {
            console.log('Profile operation warning:', e);
        }

        // Create agent in call_centre_agents
        const { error: agentError } = await adminSupabase.from('call_centre_agents').insert({
            user_id: authData.user.id,
            agent_name: data.name,
            agent_email: data.email,
            agent_phone: data.phone,
            role: data.role || 'call_center',
            status: 'active',
            is_available: true
        });

        if (agentError) {
            console.log('Agent insert error:', agentError.message);
            return { success: true, message: 'Agent created but entry in call_centre_agents failed. Use admin to manually add.', tempPassword };
        }

        return { success: true, message: 'Agent created successfully', tempPassword };
    }

    return { success: false, error: 'Failed to create agent' };
}

function generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password + '@' + Math.floor(Math.random() * 9 + 1);
}
