'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';

async function verifyAdmin(): Promise<{ isAdmin: boolean; userId?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { isAdmin: false };
    
    const adminClient = await createAdminClient();
    const { data: profile } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
    
    return { isAdmin: profile?.role === 'admin', userId: user.id };
}

export async function getAdminDashboardData() {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) {
        return { success: false, error: 'Unauthorized - Admin access required' };
    }
    
    try {
        const supabase = await createAdminClient();
        
        const [
            profilesRes, membersRes, plansRes, requestsRes, 
            claimsRes, franchisesRes, activitiesRes, paymentsRes
        ] = await Promise.all([
            supabase.from('profiles').select('id, role, created_at'),
            supabase.from('ecard_members').select('id, status, plan_id'),
            supabase.from('plans').select('id, name, is_active'),
            supabase.from('service_requests').select('id, status'),
            supabase.from('reimbursement_claims').select('id, status'),
            supabase.from('franchises').select('id, status'),
            supabase.from('audit_logs').select('*').limit(5).order('created_at', { ascending: false }),
            supabase.from('payments').select('amount').eq('status', 'captured')
        ]);

        const profiles = profilesRes.data || [];
        const members = membersRes.data || [];
        const plans = plansRes.data || [];
        const requests = requestsRes.data || [];
        const claims = claimsRes.data || [];
        const franchises = franchisesRes.data || [];
        const activities = activitiesRes.data || [];
        const payments = paymentsRes.data || [];

        const totalCustomers = profiles.filter((p: any) => p.role === 'user').length;
        const activeMembers = members.filter((m: any) => m.status === 'active').length;
        const pendingTasks = requests.filter((r: any) => r.status === 'pending').length;
        const pendingClaims = claims.filter((c: any) => c.status === 'submitted' || c.status === 'under-review').length;
        const activeFranchises = franchises.filter((f: any) => f.status === 'active').length;
        const totalRevenue = payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0) || 0;

        const planCounts: Record<string, number> = {};
        members.forEach((m: any) => {
            if (m.plan_id) planCounts[m.plan_id] = (planCounts[m.plan_id] || 0) + 1;
        });
        const planSales = plans.map((p: any) => ({
            name: p.name,
            value: planCounts[p.id] || 0
        })).filter((p: any) => p.value > 0);

        return {
            success: true,
            data: {
                metrics: {
                    totalRevenue,
                    activePlans: activeMembers,
                    newCustomers: totalCustomers,
                    pendingTasks,
                    totalMembers: members.length,
                    activeMembers,
                    pendingClaims,
                    activeFranchises,
                    totalPlans: plans.filter((p: any) => p.is_active === true || p.is_active === 'active').length,
                    pendingRequests: pendingTasks
                },
                activities: activities.map((a: any) => ({
                    id: a.id,
                    user: a.admin_id || 'System',
                    action: a.action || 'Activity',
                    time: a.created_at,
                    details: typeof a.details === 'object' ? JSON.stringify(a.details).substring(0, 50) : a.details || ''
                })),
                planSales,
                revenueChart: [],
                customerGrowth: []
            }
        };
    } catch (error: any) {
        console.error('Admin dashboard error:', error);
        return { success: false, error: error.message };
    }
}
