import { createClient } from '@/lib/supabase/client';
import { PurchasesResponse, CreateMemberData } from "@/types/purchase";

export async function fetchPurchases(params?: { status?: string; search?: string; sort?: string }): Promise<PurchasesResponse> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, data: { plans: [], stats: { active: 0, expired: 0, total: 0 } } };

    // Fetch user's plans via ecard_members
    const { data: memberData, error } = await supabase
        .from('ecard_members')
        .select('*, plan:plan_id(*)')
        .eq('user_id', user.id);

    if (error) return { success: false, data: { plans: [], stats: { active: 0, expired: 0, total: 0 } } };

    // Group by plan
    const planMap: Record<string, any> = {};
    memberData?.forEach((m: any) => {
        const planId = m.plan_id;
        if (!planMap[planId]) {
            planMap[planId] = {
                id: planId,
                name: m.plan?.name || 'Unknown Plan',
                planId: m.plan?.id || planId,
                policyNumber: m.policy_number || '',
                status: m.status || 'active',
                purchaseDate: m.created_at,
                validFrom: m.valid_from,
                validUntil: m.valid_till,
                daysRemaining: m.valid_till ? Math.max(0, Math.ceil((new Date(m.valid_till).getTime() - Date.now()) / 86400000)) : 0,
                coverageAmount: m.coverage_amount || m.plan?.coverage_amount || 0,
                membersCount: 0,
                membersCovered: 0,
                transactionId: '',
                amountPaid: m.plan?.price || 0,
                paymentMode: '',
                benefits: m.plan?.benefits || [],
                coverage: m.plan?.coverage || [],
                members: [],
                documents: [],
            };
        }
        planMap[planId].membersCount++;
        if (m.status === 'active') planMap[planId].membersCovered++;
        planMap[planId].members.push({
            id: m.id,
            name: m.full_name,
            relation: m.relation || 'Self',
            age: m.dob ? Math.floor((Date.now() - new Date(m.dob).getTime()) / 31557600000) : 0,
            gender: m.gender || '',
            hasECard: !!m.card_unique_id,
        });
    });

    let plans = Object.values(planMap);

    // Apply filters
    if (params?.status && params.status !== 'all') {
        plans = plans.filter(p => p.status === params!.status);
    }
    if (params?.search) {
        const s = params.search.toLowerCase();
        plans = plans.filter(p => p.name.toLowerCase().includes(s) || p.policyNumber?.toLowerCase().includes(s));
    }

    const active = plans.filter(p => p.status === 'active').length;
    const expired = plans.filter(p => p.status === 'expired').length;

    return {
        success: true,
        data: {
            plans,
            stats: { active, expired, total: plans.length }
        }
    };
}

export async function addPlanMember(data: CreateMemberData): Promise<{ success: boolean; data?: any; error?: string }> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { data: result, error } = await supabase.from('ecard_members').insert({
        user_id: user.id,
        plan_id: data.planId,
        full_name: data.name,
        relation: data.relationship,
        dob: data.dob,
        gender: data.gender,
        contact_number: data.mobile,
        status: 'active',
    }).select().single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: result };
}

export async function updatePlanMember(memberId: string, data: Partial<CreateMemberData>): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient();

    const updates: any = {};
    if (data.name) updates.full_name = data.name;
    if (data.relationship) updates.relation = data.relationship;
    if (data.dob) updates.dob = data.dob;
    if (data.gender) updates.gender = data.gender;
    if (data.mobile) updates.contact_number = data.mobile;

    const { error } = await supabase.from('ecard_members').update(updates).eq('id', memberId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}
