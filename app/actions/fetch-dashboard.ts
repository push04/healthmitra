'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { ApiResponse, DashboardData } from "@/types/dashboard";

export async function fetchDashboardData(): Promise<ApiResponse<DashboardData>> {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                },
            }
        );
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: 'Not authenticated', data: null as any };
        }

        // Use Promise.allSettled to handle individual query failures gracefully
        const results = await Promise.allSettled([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('wallets').select('*').eq('user_id', user.id).single(),
            supabase.from('ecard_members').select('*, plans(*)').eq('user_id', user.id),
            supabase.from('service_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
            supabase.from('reimbursement_claims').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
            supabase.from('notifications').select('*').eq('recipient_id', user.id).order('created_at', { ascending: false }).limit(10),
        ]);

        // Extract data from settled promises
        const profileRes = results[0].status === 'fulfilled' ? results[0].value : { data: null, error: results[0].reason };
        const walletRes = results[1].status === 'fulfilled' ? results[1].value : { data: null, error: results[1].reason };
        const membersRes = results[2].status === 'fulfilled' ? results[2].value : { data: null, error: results[2].reason };
        const requestsRes = results[3].status === 'fulfilled' ? results[3].value : { data: null, error: results[3].reason };
        const claimsRes = results[4].status === 'fulfilled' ? results[4].value : { data: null, error: results[4].reason };
        const notifsRes = results[5].status === 'fulfilled' ? results[5].value : { data: null, error: results[5].reason };

        // Log any errors but continue with defaults
        if (profileRes.error) console.error('Profile fetch error:', profileRes.error);
        if (walletRes.error) console.error('Wallet fetch error:', walletRes.error);
        if (membersRes.error) console.error('Members fetch error:', membersRes.error);
        if (requestsRes.error) console.error('Requests fetch error:', requestsRes.error);
        if (claimsRes.error) console.error('Claims fetch error:', claimsRes.error);
        if (notifsRes.error) console.error('Notifications fetch error:', notifsRes.error);

        const profile = profileRes.data || { full_name: user.email?.split('@')[0], email: user.email, phone: '' };
        const wallet = walletRes.data || { balance: 0, currency: 'INR' };
        const members = membersRes.data || [];
        const activeMembers = members.filter((m: any) => m.status === 'active');

        // Calculate Active Plan (Logic: Find first active member with a plan)
        const primaryMember = members.find((m: any) => m.relation === 'Self') || members[0];
        const activePlanData = primaryMember?.plans || null;

        // Safely calculate days remaining
        let daysRemaining = 0;
        if (primaryMember?.valid_till) {
            const validTillDate = new Date(primaryMember.valid_till);
            if (!isNaN(validTillDate.getTime())) {
                daysRemaining = Math.max(0, Math.ceil((validTillDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
            }
        }

        const activePlan = activePlanData ? {
            id: activePlanData.id,
            name: activePlanData.name,
            status: primaryMember.status,
            validUntil: primaryMember.valid_till,
            daysRemaining,
            coverageAmount: primaryMember.coverage_amount || activePlanData.coverage_amount || 0
        } : null;

        // Recent Activity Merger with safe timestamp handling
        const recentActivity = [
            ...(requestsRes.data || []).map((r: any) => ({
                id: r.id,
                type: 'service_request' as const,
                title: ((r.type || 'request') as string).replace(/_/g, ' ').toUpperCase(),
                description: r.subject || r.description || '',
                status: (r.status || 'pending') as 'pending' | 'completed' | 'approved' | 'rejected',
                timestamp: r.created_at || new Date().toISOString()
            })),
            ...(claimsRes.data || []).map((c: any) => ({
                id: c.id,
                type: 'reimbursement' as const,
                title: c.title || 'Reimbursement',
                description: `Amount: ₹${c.amount || 0}`,
                status: (c.status || 'pending') as 'pending' | 'completed' | 'approved' | 'rejected',
                timestamp: c.created_at || new Date().toISOString()
            }))
        ]
        .filter(a => a.timestamp)
        .sort((a, b) => {
            const dateA = new Date(a.timestamp).getTime();
            const dateB = new Date(b.timestamp).getTime();
            return isNaN(dateA) || isNaN(dateB) ? 0 : dateB - dateA;
        })
        .slice(0, 5);

        // Calculate reimbursement summary
        const allClaims = claimsRes.data || [];
        const reimbursementSummary = {
            totalClaimed: allClaims.reduce((sum: number, c: any) => sum + (c.amount || 0), 0),
            approved: allClaims.filter((c: any) => c.status === 'approved').reduce((sum: number, c: any) => sum + (c.amount_approved || 0), 0),
            pending: allClaims.filter((c: any) => c.status === 'pending').length,
            rejected: allClaims.filter((c: any) => c.status === 'rejected').length
        };

        // Count pending items
        const pendingRequests = (requestsRes.data || []).filter((r: any) => r.status === 'pending').length;
        const pendingClaims = allClaims.filter((c: any) => c.status === 'pending').length;

        return {
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: profile.full_name || 'User',
                    email: user.email ?? '',
                    phone: profile.phone || '',
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
                    status: (activeMembers.length > 0 ? 'active' : 'pending') as 'active' | 'pending' | 'expired',
                    totalCards: members.length,
                    activeCards: activeMembers.length,
                },
                wallet: {
                    balance: wallet.balance || 0,
                    currency: wallet.currency || 'INR',
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
                    familyMembers: members.map((m: any) => ({ name: m.full_name || 'Unknown', relation: m.relation || 'Self' }))
                },
                reimbursementSummary,
                pendingRequests: {
                    total: pendingRequests + pendingClaims,
                    breakdown: {
                        serviceRequests: pendingRequests,
                        reimbursements: pendingClaims,
                    },
                },
                recentActivity,
                notifications: (notifsRes.data || []).map((n: any) => ({
                    id: n.id,
                    type: n.type || 'info',
                    title: n.title || 'Notification',
                    message: n.message || '',
                    timestamp: n.created_at,
                    isRead: n.is_read ?? false
                })),
            },
        };
    } catch (error: any) {
        console.error('Dashboard data fetch error:', error);
        return { success: false, error: error.message || 'Failed to fetch dashboard data', data: null as any };
    }
}
