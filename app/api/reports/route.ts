import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { type, filters } = await request.json();

        let csvContent = '';

        switch (type) {
            case 'users':
                csvContent = await exportUsers(supabase, filters);
                break;
            case 'plans':
                csvContent = await exportPlans(supabase, filters);
                break;
            case 'purchases':
                csvContent = await exportPurchases(supabase, filters);
                break;
            case 'reimbursements':
                csvContent = await exportReimbursements(supabase, filters);
                break;
            case 'service_requests':
                csvContent = await exportServiceRequests(supabase, filters);
                break;
            default:
                return NextResponse.json({ success: false, error: 'Invalid export type' }, { status: 400 });
        }

        const buffer = Buffer.from(csvContent, 'utf-8');
        const filename = `${type}-${new Date().toISOString().split('T')[0]}.csv`;

        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(`exports/${user.id}/${filename}`, buffer, {
                cacheControl: '3600',
                upsert: true,
                contentType: 'text/csv',
            });

        let downloadUrl = '';
        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(`exports/${user.id}/${filename}`);
            downloadUrl = publicUrl;
        }

        return NextResponse.json({
            success: true,
            data: {
                csv: csvContent,
                url: downloadUrl,
                filename,
            }
        });
    } catch (error: any) {
        console.error('Export error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

async function exportUsers(supabase: any, filters: any) {
    let query = supabase.from('profiles').select('*');
    
    if (filters?.role) {
        query = query.eq('role', filters.role);
    }
    if (filters?.status) {
        query = query.eq('status', filters.status);
    }

    const { data: users } = await query;

    let csv = 'ID,Email,Name,Phone,Role,Status,Created At\n';
    users?.forEach((user: any) => {
        csv += `${user.id},${user.email || ''},${user.full_name || ''},${user.phone || ''},${user.role || ''},${user.status || ''},${user.created_at || ''}\n`;
    });

    return csv;
}

async function exportPlans(supabase: any, filters: any) {
    let query = supabase.from('plans').select('*');
    
    if (filters?.status) {
        query = query.eq('status', filters.status);
    }
    if (filters?.type) {
        query = query.eq('type', filters.type);
    }

    const { data: plans } = await query;

    let csv = 'ID,Name,Type,Price,Duration (Months),Status,Featured,Created At\n';
    plans?.forEach((plan: any) => {
        csv += `${plan.id},${plan.name || ''},${plan.type || ''},${plan.price || 0},${plan.duration_months || 0},${plan.status || ''},${plan.is_featured || false},${plan.created_at || ''}\n`;
    });

    return csv;
}

async function exportPurchases(supabase: any, filters: any) {
    let query = supabase.from('ecard_members').select('*, plan:plan_id(*), user:user_id(*)');
    
    if (filters?.status) {
        query = query.eq('status', filters.status);
    }

    const { data: purchases } = await query;

    let csv = 'ID,User Email,Member Name,Relation,Plan,Price,Coverage,Status,Valid From,Valid Till\n';
    purchases?.forEach((p: any) => {
        csv += `${p.id},${p.user?.email || ''},${p.full_name || ''},${p.relation || ''},${p.plan?.name || ''},${p.plan?.price || 0},${p.coverage_amount || 0},${p.status || ''},${p.valid_from || ''},${p.valid_till || ''}\n`;
    });

    return csv;
}

async function exportReimbursements(supabase: any, filters: any) {
    let query = supabase.from('reimbursements').select('*');
    
    if (filters?.status) {
        query = query.eq('status', filters.status);
    }
    if (filters?.claim_type) {
        query = query.eq('claim_type', filters.claim_type);
    }

    const { data: claims } = await query;

    let csv = 'ID,Patient Name,Type,Amount,Approved Amount,Status,Submitted Date\n';
    claims?.forEach((c: any) => {
        csv += `${c.id},${c.patient_name || ''},${c.claim_type || ''},${c.amount || 0},${c.approved_amount || 0},${c.status || ''},${c.created_at || ''}\n`;
    });

    return csv;
}

async function exportServiceRequests(supabase: any, filters: any) {
    let query = supabase.from('service_requests').select('*');
    
    if (filters?.status) {
        query = query.eq('status', filters.status);
    }
    if (filters?.service_type) {
        query = query.eq('service_type', filters.service_type);
    }

    const { data: requests } = await query;

    let csv = 'ID,Service Type,Description,Status,Priority,Created At\n';
    requests?.forEach((r: any) => {
        csv += `${r.id},${r.service_type || ''},${(r.description || '').replace(/,/g, ';')},${r.status || ''},${r.priority || ''},${r.created_at || ''}\n`;
    });

    return csv;
}
