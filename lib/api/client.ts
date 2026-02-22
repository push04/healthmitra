import { ApiResponse, DashboardData } from "@/types/dashboard";

export async function fetchDashboardData(supabaseClient: any): Promise<ApiResponse<DashboardData>> {
    const supabase = supabaseClient;
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated', data: null as any };

    // Parallel fetch for performance
    const [
        profileRes,
        walletRes,
        membersRes,
        requestsRes,
        claimsRes,
        notifsRes,
        activityRes
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('wallets').select('*').eq('user_id', user.id).single(),
        supabase.from('ecard_members').select('*, plans(*)').eq('user_id', user.id),
        supabase.from('service_requests').select('*, assignee:assigned_to(full_name)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('reimbursement_claims').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('audit_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10) // Approx for activity
    ]);

    const profile = profileRes.data || { full_name: user.email?.split('@')[0], email: user.email, phone: '' };
    const wallet = walletRes.data || { balance: 0, currency: 'INR' };
    const members = membersRes.data || [];
    const activeMembers = members.filter((m: any) => m.status === 'active');

    // Calculate Active Plan (Logic: Find first active member with a plan)
    const primaryMember = members.find((m: any) => m.relation === 'Self') || members[0];
    const activePlanData = primaryMember?.plans || null;

    const activePlan = activePlanData ? {
        id: activePlanData.id,
        name: activePlanData.name,
        status: primaryMember.status,
        validUntil: primaryMember.valid_till,
        daysRemaining: primaryMember.valid_till ? Math.max(0, Math.ceil((new Date(primaryMember.valid_till).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0,
        coverageAmount: primaryMember.coverage_amount || activePlanData.coverage_amount || 0
    } : null;

    // Recent Activity Merger
    const recentActivity = [
        ...(requestsRes.data || []).map((r: any) => ({
            id: r.id,
            type: 'service_request',
            title: r.type.replace('_', ' ').toUpperCase(),
            description: r.subject || r.description,
            status: r.status,
            timestamp: r.created_at
        })),
        ...(claimsRes.data || []).map((c: any) => ({
            id: c.id,
            type: 'reimbursement',
            title: c.title || 'Reimbursement',
            description: `Amount: ₹${c.amount}`,
            status: c.status,
            timestamp: c.created_at
        }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

    return {
        success: true,
        data: {
            user: {
                id: user.id,
                name: profile.full_name,
                email: user.email,
                phone: profile.phone,
                avatar: profile.avatar_url || '',
            },
            activePlan: activePlan || {
                id: 'no-plan',
                name: 'No Active Plan',
                status: 'inactive',
                validUntil: new Date().toISOString(),
                daysRemaining: 0,
                coverageAmount: 0
            },
            eCardStatus: {
                status: (activeMembers.length > 0 ? 'active' : 'inactive') as any,
                totalCards: members.length,
                activeCards: activeMembers.length,
            },
            wallet: {
                balance: wallet.balance,
                currency: 'INR',
                minimumBalance: 0,
            },
            vouchers: {
                available: 0,
                used: 0,
                expired: 0,
                totalValue: 0
            },
            services: {
                activeServices: 0,
                completedThisMonth: 0,
                pendingApproval: 0
            },
            members: {
                totalMembers: members.length,
                withActiveCards: activeMembers.length,
                familyMembers: members.map((m: any) => ({ name: m.full_name, relation: m.relation }))
            },
            reimbursementSummary: {
                totalClaimed: 0,
                approved: 0,
                pending: 0,
                rejected: 0
            },
            pendingRequests: {
                total: (requestsRes.data?.filter((r: any) => r.status === 'pending').length || 0) + (claimsRes.data?.filter((c: any) => c.status === 'pending').length || 0),
                breakdown: {
                    serviceRequests: requestsRes.data?.filter((r: any) => r.status === 'pending').length || 0,
                    reimbursements: claimsRes.data?.filter((c: any) => c.status === 'pending').length || 0,
                },
            },
            recentActivity: recentActivity as any,
            notifications: (notifsRes.data || []).map((n: any) => ({
                id: n.id,
                type: n.type || 'info', // success, info, warning, error
                title: n.title,
                message: n.message,
                timestamp: n.created_at,
                isRead: n.is_read
            })),
        },
    };
}

export async function createServiceRequest(supabaseClient: any, data: any) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: req, error } = await supabaseClient.from('service_requests').insert({
        ...data,
        user_id: user.id,
        status: 'pending',
        priority: 'medium'
    }).select().single();

    return { data: req, error };
}

export async function createClaim(supabaseClient: any, data: any) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { data: claim, error } = await supabaseClient.from('reimbursement_claims').insert({
        ...data,
        user_id: user.id,
        status: 'pending'
    }).select().single();

    return { data: claim, error };
}

export async function markNotificationAsRead(supabaseClient: any, id: string) {
    await supabaseClient.from('notifications').update({ is_read: true }).eq('id', id);
}
