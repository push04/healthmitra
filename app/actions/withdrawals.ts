'use server';

import { createClient } from '@/lib/supabase/server';
import { WithdrawalRequest, WithdrawalStatus } from '@/types/wallet';

export async function getWithdrawals(): Promise<{ success: boolean; data?: WithdrawalRequest[]; error?: string }> {
    const supabase = await createClient();
    
    const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return { success: false, error: error.message };
    }

    const mappedData: WithdrawalRequest[] = (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        customerName: row.customer_name || '',
        customerEmail: row.customer_email || '',
        amount: row.amount,
        status: row.status as WithdrawalStatus,
        bankName: row.bank_name || '',
        bankAccount: row.bank_account || '',
        ifscCode: row.ifsc_code || '',
        createdAt: row.created_at,
        processedAt: row.processed_at,
        adminNotes: row.admin_notes
    }));

    return { success: true, data: mappedData };
}

export async function processWithdrawal(
    id: string,
    action: 'approve' | 'reject' | 'complete',
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    
    let newStatus: WithdrawalStatus;
    switch (action) {
        case 'approve':
            newStatus = 'approved';
            break;
        case 'reject':
            newStatus = 'rejected';
            break;
        case 'complete':
            newStatus = 'completed';
            break;
        default:
            return { success: false, error: 'Invalid action' };
    }

    const updates: any = {
        status: newStatus,
        admin_notes: notes || null,
        processed_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('withdrawal_requests')
        .update(updates)
        .eq('id', id);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function createWithdrawalRequest(
    userId: string,
    customerName: string,
    customerEmail: string,
    amount: number,
    bankName: string,
    bankAccount: string,
    ifscCode: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
            user_id: userId,
            customer_name: customerName,
            customer_email: customerEmail,
            amount,
            bank_name: bankName,
            bank_account: bankAccount,
            ifsc_code: ifscCode,
            status: 'pending'
        });

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}
