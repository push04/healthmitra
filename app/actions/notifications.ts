'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';

export interface Notification {
    id: string;
    sender_id: string | null;
    recipient_id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    read_at: string | null;
    action_url: string | null;
    action_label: string | null;
    priority: string;
    metadata: Record<string, any>;
    created_at: string;
}

export async function getNotifications(userId: string, limit = 50): Promise<{ success: boolean; data?: Notification[]; error?: string }> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) return { success: false, error: error.message };

    return { success: true, data: data as Notification[] };
}

export async function getUnreadCount(userId: string): Promise<{ success: boolean; count: number }> {
    const supabase = await createClient();

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

    if (error) return { success: true, count: 0 };

    return { success: true, count: count || 0 };
}

export async function markAsRead(notificationId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('recipient_id', userId);

    if (error) return { success: false, error: error.message };

    return { success: true };
}

export async function markAllAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id', userId)
        .eq('is_read', false);

    if (error) return { success: false, error: error.message };

    return { success: true };
}

export async function createNotification(data: {
    recipientId: string;
    title: string;
    message: string;
    type: string;
    senderId?: string;
    actionUrl?: string;
    actionLabel?: string;
    priority?: string;
}): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase.from('notifications').insert({
        recipient_id: data.recipientId,
        sender_id: data.senderId || null,
        title: data.title,
        message: data.message,
        type: data.type,
        action_url: data.actionUrl || null,
        action_label: data.actionLabel || null,
        priority: data.priority || 'normal',
        metadata: {}
    });

    if (error) return { success: false, error: error.message };

    return { success: true };
}

export async function sendBulkNotification(data: {
    title: string;
    message: string;
    type: string;
    senderId: string;
    recipientRole?: string;
}): Promise<{ success: boolean; count?: number; error?: string }> {
    const supabase = await createClient();

    // Get all users (excluding sender)
    let query = supabase.from('profiles').select('id').neq('id', data.senderId);
    
    if (data.recipientRole) {
        query = query.eq('role', data.recipientRole);
    }

    const { data: users, error } = await query;

    if (error) return { success: false, error: error.message };

    if (!users || users.length === 0) {
        return { success: true, count: 0 };
    }

    // Insert notifications for all users
    const notifications = users.map(user => ({
        recipient_id: user.id,
        sender_id: data.senderId,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: 'normal',
        metadata: {}
    }));

    const { error: insertError } = await supabase.from('notifications').insert(notifications);

    if (insertError) return { success: false, error: insertError.message };

    return { success: true, count: users.length };
}

export async function getAllNotificationsForAdmin(limit = 100): Promise<{ success: boolean; data?: Notification[]; error?: string }> {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
        .from('notifications')
        .select('*, sender:profiles!sender_id(full_name), recipient:profiles!recipient_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) return { success: false, error: error.message };

    return { success: true, data: data as Notification[] };
}

export async function getAllNotificationsAdmin(): Promise<{ allNotifs?: Notification[]; total?: number; unread?: number }> {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
        .from('notifications')
        .select('*, sender:profiles!sender_id(full_name), recipient:profiles!recipient_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(100);

    if (error) return {};

    const { count: total } = await supabase.from('notifications').select('*', { count: 'exact', head: true });
    const { count: unread } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('is_read', false);

    return { allNotifs: data as Notification[], total: total || 0, unread: unread || 0 };
}

export async function getNotificationStats(): Promise<{ success: boolean; data?: { total: number; unread: number; byType: Record<string, number> }; error?: string }> {
    const supabase = await createAdminClient();

    const { count: total } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true });

    const { count: unread } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);

    const { data: byTypeData } = await supabase
        .from('notifications')
        .select('type');

    const byType: Record<string, number> = {};
    byTypeData?.forEach((n: any) => {
        byType[n.type] = (byType[n.type] || 0) + 1;
    });

    return {
        success: true,
        data: {
            total: total || 0,
            unread: unread || 0,
            byType
        }
    };
}
