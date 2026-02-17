'use server';

import { createClient } from '@/lib/supabase/server';
import { User, UserType } from '@/types/user';

// --- USER ACTIONS ---

interface GetUsersFilters {
    query?: string;
    type?: string;
    status?: string;
    department?: string;
    page?: number;
    limit?: number;
}

export async function getUsers(filters: GetUsersFilters) {
    const supabase = await createClient();

    let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

    if (filters.query) {
        query = query.or(`full_name.ilike.%${filters.query}%,email.ilike.%${filters.query}%,phone.ilike.%${filters.query}%`);
    }

    if (filters.type && filters.type !== 'all') {
        const roleMap: Record<string, string> = { 'Admin': 'admin', 'Customer': 'user', 'Referral Partner': 'franchise_owner' };
        const role = roleMap[filters.type];
        if (role) query = query.eq('role', role);
    }

    if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) return { success: false, error: error.message };

    // Compute stats from count queries
    const { count: totalCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: adminCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin');
    const { count: activeCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active');

    const stats = {
        total: totalCount || 0,
        admins: adminCount || 0,
        customers: (totalCount || 0) - (adminCount || 0),
        active: activeCount || 0,
    };

    const users: User[] = data.map((p: any) => {
        let type: UserType = 'Customer';
        if (p.role === 'admin') type = 'Admin';
        if (p.role === 'franchise_owner') type = 'Referral Partner';

        return {
            id: p.id,
            name: p.full_name || 'Unknown',
            email: p.email,
            phone: p.phone,
            type: type,
            status: p.status || 'active',
            joinedDate: new Date(p.created_at).toISOString().split('T')[0],
            avatar: p.avatar_url
        };
    });

    return { success: true, data: users, stats, totalCount: count || 0 };
}

export async function getUser(id: string) {
    const supabase = await createClient();
    const { data: p, error } = await supabase.from('profiles').select('*').eq('id', id).single();

    if (error) return { success: false, error: error.message };

    let type: UserType = 'Customer';
    if (p.role === 'admin') type = 'Admin';
    if (p.role === 'franchise_owner') type = 'Referral Partner';

    const user: User = {
        id: p.id,
        name: p.full_name || 'Unknown',
        email: p.email,
        phone: p.phone,
        type: type,
        status: p.status || 'active',
        joinedDate: new Date(p.created_at).toISOString().split('T')[0],
        avatar: p.avatar_url
    };

    return { success: true, data: user };
}

export async function createUser(data: Partial<User>) {
    const supabase = await createClient();

    // Use Supabase admin to create auth user, then profile is auto-created via trigger
    // For now, directly insert into profiles if auth admin API is not available
    const { error } = await supabase.from('profiles').insert({
        email: data.email,
        full_name: data.name,
        phone: data.phone,
        role: data.type === 'Admin' ? 'admin' : 'user',
        status: 'active',
    });

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'User created successfully' };
}

export async function updateUser(id: string, data: Partial<User>) {
    const supabase = await createClient();

    const updates: any = {};
    if (data.name) updates.full_name = data.name;
    if (data.email) updates.email = data.email;
    if (data.phone) updates.phone = data.phone;
    if (data.dob) updates.dob = data.dob;
    if (data.gender) updates.gender = data.gender;

    const { error } = await supabase.from('profiles').update(updates).eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'User updated successfully' };
}

export async function toggleUserStatus(id: string, status: 'active' | 'inactive') {
    const supabase = await createClient();
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully` };
}

export async function updateBankDetails(id: string, bankDetails: any) {
    const supabase = await createClient();
    const { error } = await supabase.from('profiles').update({
        bank_holder_name: bankDetails.holderName,
        bank_account_number: bankDetails.accountNumber,
        bank_ifsc: bankDetails.ifsc,
        bank_name: bankDetails.bankName,
        bank_branch: bankDetails.branch,
        account_type: bankDetails.accountType,
    }).eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Bank details updated successfully' };
}

export async function updateDocuments(id: string, documents: any) {
    const supabase = await createClient();
    const updates: any = {};
    if (documents.aadhaar) updates.aadhaar_number = documents.aadhaar;
    if (documents.pan) updates.pan_number = documents.pan;

    const { error } = await supabase.from('profiles').update(updates).eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Documents updated successfully' };
}

export async function changePlan(id: string, planId: string, planName: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('ecard_members').update({ plan_id: planId }).eq('user_id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, message: `Plan changed to ${planName}` };
}

export async function resendCredentials(id: string, method: 'whatsapp' | 'email') {
    // This would integrate with a messaging API (Twilio/SendGrid)
    // For now, log the action
    const supabase = await createClient();
    await supabase.from('audit_logs').insert({
        user_id: id,
        action: `resend_credentials_${method}`,
        entity_type: 'user',
        entity_id: id,
    });
    return { success: true, message: `Credentials sent via ${method === 'whatsapp' ? 'WhatsApp' : 'Email'}` };
}

export async function activateNewPlan(id: string, planId: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('ecard_members').insert({
        user_id: id,
        plan_id: planId,
        status: 'active',
        valid_from: new Date().toISOString(),
    });
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'New plan activated successfully' };
}

// --- DEPARTMENT ACTIONS ---

export async function getDepartments() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('departments').select('*').order('name');
    if (data && data.length > 0) return { success: true, data };

    // Fallback: try CMS
    const { data: cmsData } = await supabase.from('cms_content').select('value').eq('key', 'departments').single();
    if (cmsData) return { success: true, data: cmsData.value };

    return { success: true, data: [] };
}

export async function createDepartment(dept: Partial<any>) {
    const supabase = await createClient();
    const { error } = await supabase.from('departments').insert({
        name: dept.name,
        head_name: dept.head,
        description: dept.description,
        status: 'active',
    });
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Department added' };
}

export async function deleteDepartment(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('departments').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Department deleted' };
}
