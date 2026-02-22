'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Franchise, FranchiseModule, DEFAULT_MODULES } from '@/types/franchise';

export async function getFranchiseStats() {
    const supabase = await createAdminClient();
    
    const { count: total } = await supabase
        .from('franchises')
        .select('*', { count: 'exact', head: true });

    const { count: active } = await supabase
        .from('franchises')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    const { count: verified } = await supabase
        .from('franchises')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified');

    const { data: franchises } = await supabase
        .from('franchises')
        .select('total_members, total_sales');

    const totalMembers = franchises?.reduce((sum, f) => sum + (f.total_members || 0), 0) || 0;
    const totalSales = franchises?.reduce((sum, f) => sum + (f.total_sales || 0), 0) || 0;

    return {
        success: true,
        data: {
            total: total || 0,
            active: active || 0,
            verified: verified || 0,
            totalMembers,
            totalSales
        }
    };
}

export async function getFranchises(query?: string) {
    const supabase = await createAdminClient();

    let dbQuery = supabase
        .from('franchises')
        .select('*');

    if (query) {
        dbQuery = dbQuery.or(`franchise_name.ilike.%${query}%,city.ilike.%${query}%,code.ilike.%${query}%`);
    }

    const { data, error } = await dbQuery.order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching franchises:', error);
        return { success: false, error: error.message };
    }

    const { data: partnersData } = await supabase
        .from('franchise_partners')
        .select('franchise_id');

    const partnerCounts: Record<string, number> = {};
    partnersData?.forEach((p: any) => {
        partnerCounts[p.franchise_id] = (partnerCounts[p.franchise_id] || 0) + 1;
    });

    const franchises = data.map((f: any) => ({
        id: f.id,
        name: f.franchise_name,
        startDate: new Date(f.created_at).toISOString().split('T')[0],
        endDate: '',
        contact: f.contact_phone || '',
        altContact: f.alt_phone || '',
        email: f.contact_email || '',
        referralCode: f.code,
        website: f.website || '',
        gst: f.gst_number || '',
        commissionPercent: f.commission_percentage || 10,
        kycStatus: (f.verification_status === 'verified' ? 'verified' : f.verification_status === 'submitted' ? 'submitted' : 'pending') as 'pending' | 'submitted' | 'verified' | 'rejected',
        verificationStatus: f.verification_status || 'unverified',
        address: f.address || '',
        city: f.city || '',
        state: f.state || '',
        payoutDelay: 0,
        status: f.status || 'active',
        createdAt: f.created_at,
        totalPartners: partnerCounts[f.id] || 0,
        totalRevenue: f.total_sales || 0
    }));

    return { success: true, data: franchises };
}

export async function getFranchise(id: string) {
    const supabase = await createClient();

    const { data: franchiseData, error } = await supabase
        .from('franchises')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return { success: false, error: 'Franchise not found' };

    const franchise = {
        id: franchiseData.id,
        name: franchiseData.franchise_name,
        startDate: new Date(franchiseData.created_at).toISOString().split('T')[0],
        endDate: '',
        contact: franchiseData.contact_phone || '',
        altContact: '',
        email: franchiseData.contact_email || '',
        password: '', // Should not return password
        referralCode: franchiseData.code,
        website: '',
        gst: franchiseData.gst_number || '',
        commissionPercent: franchiseData.commission_percentage,
        kycStatus: franchiseData.verification_status === 'verified' ? 'verified' : 'pending',
        verificationStatus: franchiseData.verification_status,
        address: franchiseData.address || '',
        city: franchiseData.city || '',
        state: franchiseData.state || '',
        payoutDelay: 0,
        status: franchiseData.status,
        createdAt: franchiseData.created_at,
        totalPartners: 0,
        totalRevenue: 0
    };

    // Fetch partners
    const { data: partnersData } = await supabase
        .from('franchise_partners')
        .select('*')
        .eq('franchise_id', id);

    const partners = partnersData?.map((p: any) => ({
        id: p.id,
        name: p.partner_name,
        email: p.email,
        phone: p.phone,
        status: p.status,
        joinedAt: p.joined_at,
        plansCount: 0,
        revenue: 0
    })) || [];

    // Modules (Mock for now or store in DB)
    const modules = DEFAULT_MODULES;

    // Activities (from audit logs?)
    const activities: any[] = [];

    return { success: true, data: { franchise, modules, activities, partners } };
}

export async function createFranchise(data: Partial<Franchise>) {
    const supabase = await createClient();
    console.log('Creating franchise:', data);

    // Check if owner exists? Or allow creating without owner linked yet?
    // DB requires owner_user_id? it is nullable in schema but logic might want it.
    // For now insert basic info.

    const { error } = await supabase.from('franchises').insert({
        franchise_name: data.name,
        code: data.referralCode,
        contact_email: data.email,
        contact_phone: data.contact,
        gst_number: data.gst,
        address: data.address,
        city: data.city,
        state: data.state,
        commission_percentage: data.commissionPercent,
        status: 'active'
    });

    if (error) return { success: false, error: error.message };

    return { success: true, message: 'Franchise created successfully' };
}

export async function updateFranchise(id: string, data: Partial<Franchise>) {
    const supabase = await createClient();

    const updates: any = {};
    if (data.name) updates.franchise_name = data.name;
    if (data.email) updates.contact_email = data.email;
    if (data.contact) updates.contact_phone = data.contact;
    if (data.city) updates.city = data.city;

    const { error } = await supabase.from('franchises').update(updates).eq('id', id);

    if (error) return { success: false, error: error.message };

    return { success: true, message: 'Franchise updated successfully' };
}

export async function deleteFranchise(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('franchises').delete().eq('id', id);

    if (error) return { success: false, error: error.message };

    return { success: true, message: 'Franchise deleted' };
}

export async function assignModules(franchiseId: string, modules: FranchiseModule[]) {
    const supabase = await createClient();
    // Store modules as JSONB on the franchise record
    const { error } = await supabase.from('franchises').update({ modules: modules }).eq('id', franchiseId);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Modules updated successfully' };
}

export async function getFranchiseActivity(franchiseId: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('audit_logs').select('*')
        .eq('entity_type', 'franchise').eq('entity_id', franchiseId)
        .order('created_at', { ascending: false }).limit(20);
    return { success: true, data: data || [] };
}

export async function franchiseLogin(email: string, password: string) {
    // This should probably go through auth.users too, or specific table
    const supabase = await createClient();

    // Check franchises table?
    const { data, error } = await supabase
        .from('franchises')
        .select('*')
        .eq('contact_email', email)
        .single();

    if (error || !data) return { success: false, error: 'Invalid credentials' };

    return { success: true, data: data, message: 'Login successful' };
}
