'use server';

import { createClient } from '@/lib/supabase/server';
import { SupportTicket, CreateTicketInput } from '@/types/support';

// --- CLIENT SUPPORT ACTIONS ---

export async function getSupportTickets() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    // Fetch service requests of type 'other' (mapped to support tickets)
    const { data, error } = await supabase.from('service_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'other')
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    // Map to Ticket interface expected by UI
    const tickets: SupportTicket[] = data.map((t: any) => ({
        id: t.request_id_display || t.id,
        subject: t.details?.subject || 'Support Ticket',
        category: t.details?.category || 'General',
        status: t.status === 'pending' ? 'open' : t.status === 'completed' ? 'resolved' : 'pending',
        priority: t.details?.priority || 'medium',
        createdAt: new Date(t.created_at).toLocaleDateString(),
        lastReply: 'Just now', // Placeholder - ideally fetch latest message
        lastMessage: t.details?.description || '',
        isFromSupport: false,
        resolvedAt: t.updated_at ? new Date(t.updated_at).toLocaleDateString() : undefined,
        resolution: t.details?.resolution || ''
    }));

    return { success: true, data: tickets };
}

export async function createSupportTicket(data: CreateTicketInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    const { subject, description, category, priority } = data;

    // Insert into service_requests
    const { data: ticket, error } = await supabase.from('service_requests').insert({
        user_id: user.id,
        type: 'other',
        status: 'pending',
        request_id_display: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
        details: {
            subject,
            description,
            category,
            priority,
            is_support_ticket: true
        }
    }).select().single();

    if (error) return { success: false, error: error.message };

    return { success: true, data: ticket };
}

// --- SERVICE REQUESTS (SUPPORT) ---

export async function getRequests() {
    const supabase = await createClient();

    const { data: requests, error } = await supabase.from('service_requests')
        .select(`
            *,
            profiles:user_id (full_name, email, phone)
        `)
        .order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    // Map to ServiceRequest type
    const mappedRequests = requests.map((r: any) => ({
        id: r.id,
        requestId: r.request_id_display || r.id.substring(0, 8),
        userId: r.user_id,
        customerName: r.profiles?.full_name || 'Guest User',
        customerEmail: r.profiles?.email || '',
        customerContact: r.profiles?.phone || '',
        type: r.type,
        status: r.status,
        description: r.details?.description || r.details?.subject || '',
        priority: r.details?.priority || 'medium',
        requestedAt: new Date(r.created_at).toLocaleDateString() + ' ' + new Date(r.created_at).toLocaleTimeString(),
        notes: r.admin_notes || '', // Ensure admin_notes column is added or use details
        details: r.details
    }));

    return { success: true, data: mappedRequests };
}

export async function getRequestThread(requestId: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('request_messages').select('*').eq('request_id', requestId).order('created_at', { ascending: true });
    return { success: true, data: data || [] };
}

export async function updateRequestStatus(id: string, status: string, notes?: string) {
    const supabase = await createClient();

    // Update status
    await supabase.from('service_requests').update({ status }).eq('id', id);

    // Add notes to message thread if provided
    if (notes) {
        await supabase.from('request_messages').insert({
            request_id: id,
            sender_id: (await supabase.auth.getUser()).data.user?.id,
            message: `Status updated to ${status}. Note: ${notes}`,
            // is_internal removed as it's not in schema. could add to JSONB if needed.
        });
    }

    return { success: true, message: 'Status updated successfully' };
}

export async function assignRequest(id: string, adminId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('service_requests').update({ assigned_to: adminId }).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Request assigned' };
}

export async function postReply(requestId: string, message: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('request_messages').insert({
        request_id: requestId,
        message,
        sender_id: (await supabase.auth.getUser()).data.user?.id,
    }).select().single();

    if (error) return { success: false, error: error.message };
    return { success: true, data, message: 'Reply sent' };
}

// --- REIMBURSEMENTS ---

export async function getClaims() {
    const supabase = await createClient();
    const { data } = await supabase.from('reimbursement_claims').select('*');
    return { success: true, data: data || [] };
}

export async function processClaim(id: string, status: 'approved' | 'rejected', data: any) {
    const supabase = await createClient();
    const updates: any = { status };
    if (status === 'approved') updates.amount_approved = data.approvedAmount;
    if (status === 'rejected') updates.rejection_reason = data.reason;

    const { error } = await supabase.from('reimbursement_claims').update(updates).eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true, message: `Claim ${status} successfully` };
}

