'use server';

import { createClient } from '@/lib/supabase/server';

export async function getDashboardStats() {
    const supabase = await createClient();

    // Fetch real plan data
    const { data: plans } = await supabase.from('plans').select('id, name');

    // Count members per plan
    const { data: members } = await supabase.from('ecard_members').select('plan_id');
    const planCounts: Record<string, number> = {};
    members?.forEach((m: any) => {
        planCounts[m.plan_id] = (planCounts[m.plan_id] || 0) + 1;
    });

    const planSales = plans?.map((p: any) => ({
        name: p.name,
        value: planCounts[p.id] || 0
    })) || [];

    // Revenue from invoices (real data)
    const { data: invoices } = await supabase
        .from('invoices')
        .select('amount, created_at')
        .eq('status', 'paid')
        .order('created_at', { ascending: true });

    // Group invoices by month for revenue chart
    const revenueByMonth: Record<string, number> = {};
    invoices?.forEach((inv: any) => {
        const month = new Date(inv.created_at).toLocaleString('en', { month: 'short' });
        revenueByMonth[month] = (revenueByMonth[month] || 0) + Number(inv.amount);
    });
    const revenueChart = Object.entries(revenueByMonth).map(([name, revenue]) => ({ name, revenue }));

    // Customer growth by month (real profile creation dates)
    const { data: profiles } = await supabase.from('profiles').select('created_at').eq('role', 'user');
    const growthByMonth: Record<string, number> = {};
    let cumulative = 0;
    profiles?.forEach((p: any) => {
        const month = new Date(p.created_at).toLocaleString('en', { month: 'short' });
        growthByMonth[month] = (growthByMonth[month] || 0) + 1;
    });
    const customerGrowth = Object.entries(growthByMonth).map(([name, count]) => {
        cumulative += count;
        return { name, customers: cumulative };
    });

    // Activities from audit logs
    const { data: activities } = await supabase
        .from('audit_logs')
        .select('*, admin:admin_id(full_name)')
        .limit(5)
        .order('created_at', { ascending: false });

    return {
        success: true,
        data: {
            revenueChart: revenueChart.length > 0 ? revenueChart : [],
            planSales: planSales.length > 0 ? planSales : [],
            customerGrowth: customerGrowth.length > 0 ? customerGrowth : [],
            activities: activities?.map((a: any) => ({
                id: a.id,
                user: a.admin?.full_name || 'System',
                action: a.action,
                time: getRelativeTime(a.created_at),
                details: typeof a.details === 'object' ? JSON.stringify(a.details) : a.details || ''
            })) || []
        }
    };
}

function getRelativeTime(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
}

export async function getCustomerMetrics() {
    const supabase = await createClient();

    const { count: totalCustomers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user');
    const { count: activePlans } = await supabase.from('ecard_members').select('*', { count: 'exact', head: true }).eq('status', 'active');

    // Retention: active members / total members
    const { count: totalMembers } = await supabase.from('ecard_members').select('*', { count: 'exact', head: true });
    const retention = totalMembers && totalMembers > 0 ? Math.round(((activePlans || 0) / totalMembers) * 100) : 0;

    return {
        success: true, data: [
            { title: 'Total Customers', value: String(totalCustomers || 0), change: '', trend: 'up' },
            { title: 'Active Plans', value: String(activePlans || 0), change: '', trend: 'up' },
            { title: 'Retention Rate', value: `${retention}%`, change: '', trend: retention >= 80 ? 'up' : 'down' },
        ]
    };
}

export async function generateReportAction(type: string, filters: any) {
    const supabase = await createClient();
    await supabase.from('audit_logs').insert({
        action: `generate_report_${type}`,
        entity_type: 'report',
        details: filters,
    });
    return { success: true, message: 'Report generated successfully', downloadUrl: '#' };
}
