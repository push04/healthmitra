'use server';

import { createClient } from '@/lib/supabase/server';
import { ReimbursementClaim, ClaimStatus } from '@/types/reimbursements';

export async function getClaims() {
    const supabase = await createClient();

    // Join with profiles if possible, or just fetch
    const { data, error } = await supabase.from('reimbursement_claims').select(`
        *,
        user:user_id(full_name)
    `).order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    const claims: ReimbursementClaim[] = data.map((c: any) => ({
        id: c.id,
        claimId: c.claim_id || `CLM-${c.id.substr(0, 8)}`,
        status: (c.status as ClaimStatus) || 'pending',
        customerId: c.user_id,
        customerName: c.user?.full_name || 'Unknown User',
        planName: c.plan_name || 'Standard Plan', // Or join with plans
        title: c.title || 'Reimbursement Claim',
        amount: c.amount || 0,
        approvedAmount: c.amount_approved,
        billDate: c.bill_date,
        providerName: c.provider_name || 'Unknown Provider',
        submittedAt: c.created_at,
        documents: c.documents || [], // JSONB
        adminNotes: c.admin_notes,
        customerComments: c.customer_comments
    }));

    return { success: true, data: claims };
}

export async function processClaim(id: string, status: ClaimStatus, data: { amount?: number; notes?: string }) {
    const supabase = await createClient();
    const updates: any = {
        status,
        updated_at: new Date().toISOString()
    };

    if (status === 'approved' && data.amount !== undefined) {
        updates.amount_approved = data.amount;
    }

    if (data.notes) {
        // If rejected, maybe reason? Or just admin notes
        updates.admin_notes = data.notes;
        if (status === 'rejected') updates.rejection_reason = data.notes;
    }

    const { error } = await supabase.from('reimbursement_claims').update(updates).eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true, message: `Claim ${status} successfully` };
}
