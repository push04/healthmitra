'use server';

import { createClient } from '@/lib/supabase/server';
import { Partner, SubPartner, PartnerCommission } from '@/types/partners';

// --- PARTNER LISTING ---

export async function partnerLogin(email: string, password: string) {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { success: false, error: error.message };
    }

    // Verify if user is a partner
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Authentication failed' };

    // Check if user has franchise profile
    const { data: franchise } = await supabase.from('franchises').select('id').eq('contact_email', email).single();

    // Also check franchise_partners table
    const { data: subPartner } = await supabase.from('franchise_partners').select('id').eq('email', email).single();

    if (!franchise && !subPartner) {
        // Sign out if not a partner
        await supabase.auth.signOut();
        return { success: false, error: 'Access denied. Partner account not found.' };
    }

    return { success: true, message: 'Login successful' };
}

export async function getPartners(filters: { query?: string; status?: string } = {}) {
    const supabase = await createClient();

    let query = supabase.from('franchises').select('*');

    if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
    }

    if (filters.query) {
        query = query.or(`franchise_name.ilike.%${filters.query}%,contact_email.ilike.%${filters.query}%,code.ilike.%${filters.query}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    const partners: Partner[] = data.map((p: any) => ({
        id: p.id,
        name: p.franchise_name,
        email: p.contact_email,
        phone: p.contact_phone,
        altPhone: p.alt_phone,
        referralCode: p.code,
        commissionPercent: p.commission_percent || 10,
        status: p.status || 'active',
        kycStatus: p.verification_status || 'pending',
        city: p.city || '',
        state: p.state || '',
        address: p.address,
        pincode: p.pincode,
        bankDetails: p.bank_details,
        totalSales: p.total_sales || 0,
        totalCommission: p.total_commission || 0,
        totalSubPartners: 0, // Need count query if needed
        mouSigned: p.mou_signed || false,
        mouDate: p.mou_date,
        canAddSubPartners: p.can_add_sub_partners || false,
        designationAccess: p.designation_access || false,
        joinedDate: p.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        lastActive: p.last_active
    }));

    // Calculate generic stats based on fetched data
    const stats = {
        total: partners.length,
        active: partners.filter(p => p.status === 'active').length,
        kycVerified: partners.filter(p => p.kycStatus === 'verified').length,
        totalRevenue: partners.reduce((acc, p) => acc + (p.totalCommission || 0), 0),
    };

    return { success: true, data: partners, stats };
}

// --- SINGLE PARTNER ---

export async function getPartner(id: string) {
    const supabase = await createClient();
    const { data: partner, error } = await supabase.from('franchises').select('*').eq('id', id).single();

    if (error || !partner) return { success: false, error: 'Partner not found' };

    const { data: subData } = await supabase.from('franchise_partners').select('*').eq('franchise_id', id);

    const p: Partner = {
        id: partner.id,
        name: partner.franchise_name,
        email: partner.contact_email,
        phone: partner.contact_phone,
        altPhone: partner.alt_phone,
        referralCode: partner.code,
        commissionPercent: partner.commission_percent || 10,
        status: partner.status,
        kycStatus: partner.verification_status,
        city: partner.city,
        state: partner.state,
        address: partner.address,
        pincode: partner.pincode,
        bankDetails: partner.bank_details,
        totalSales: partner.total_sales || 0,
        totalCommission: partner.total_commission || 0,
        totalSubPartners: subData?.length || 0,
        mouSigned: partner.mou_signed,
        mouDate: partner.mou_date,
        canAddSubPartners: partner.can_add_sub_partners,
        designationAccess: partner.designation_access,
        joinedDate: partner.created_at,
        lastActive: partner.last_active
    };

    const subPartners: SubPartner[] = (subData || []).map((sp: any) => ({
        id: sp.id,
        parentPartnerId: sp.franchise_id,
        name: sp.partner_name,
        email: sp.email,
        phone: sp.phone,
        referralCode: sp.code || 'N/A',
        commissionPercent: sp.commission_percent || 0,
        status: sp.status,
        designation: sp.designation,
        salesCount: sp.sales_count || 0,
        totalRevenue: sp.total_revenue || 0,
        joinedDate: sp.joined_at
    }));

    return {
        success: true,
        data: {
            partner: p,
            subPartners,
            commissions: [] // Empty for now
        }
    };
}

// --- CREATE / UPDATE PARTNER ---

export async function createPartner(data: Partial<Partner>) {
    const supabase = await createClient();
    const { error } = await supabase.from('franchises').insert({
        franchise_name: data.name,
        contact_email: data.email,
        contact_phone: data.phone,
        alt_phone: data.altPhone,
        code: data.referralCode,
        commission_percent: data.commissionPercent,
        city: data.city,
        state: data.state,
        address: data.address,
        pincode: data.pincode,
        bank_details: data.bankDetails,
        can_add_sub_partners: data.canAddSubPartners,
        designation_access: data.designationAccess,
        status: 'active',
        verification_status: 'pending'
    });

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Partner created successfully' };
}

export async function updatePartner(id: string, data: Partial<Partner>) {
    const supabase = await createClient();
    const { error } = await supabase.from('franchises').update({
        franchise_name: data.name,
        contact_email: data.email,
        contact_phone: data.phone,
        alt_phone: data.altPhone,
        commission_percent: data.commissionPercent,
        city: data.city,
        state: data.state,
        address: data.address,
        pincode: data.pincode,
        bank_details: data.bankDetails,
        can_add_sub_partners: data.canAddSubPartners,
        designation_access: data.designationAccess,
        status: data.status,
        mou_signed: data.mouSigned,
    }).eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Partner updated successfully' };
}

// --- SUB-PARTNERS ---

export async function getSubPartners(partnerId: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('franchise_partners').select('*').eq('franchise_id', partnerId);

    if (!data) return { success: true, data: [] };

    const subs: SubPartner[] = data.map((sp: any) => ({
        id: sp.id,
        parentPartnerId: sp.franchise_id,
        name: sp.partner_name,
        email: sp.email,
        phone: sp.phone,
        referralCode: sp.code || 'N/A',
        commissionPercent: sp.commission_percent || 0,
        status: sp.status,
        designation: sp.designation,
        salesCount: sp.sales_count || 0,
        totalRevenue: sp.total_revenue || 0,
        joinedDate: sp.joined_at
    }));

    return { success: true, data: subs };
}

export async function addSubPartner(partnerId: string, data: Partial<SubPartner>) {
    const supabase = await createClient();
    const { error } = await supabase.from('franchise_partners').insert({
        franchise_id: partnerId,
        partner_name: data.name,
        email: data.email,
        phone: data.phone,
        status: 'active',
        joined_at: new Date().toISOString()
    });

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Sub-partner added successfully' };
}
// --- PARTNER PORTAL ACTIONS ---

export async function getCurrentPartner() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) return { success: false, error: 'Not authenticated' };

    // Fetch by email for now, assuming 1:1 mapping
    const { data: partner, error } = await supabase.from('franchises').select('*').eq('contact_email', user.email).single();

    if (error || !partner) return { success: false, error: 'Partner profile not found for this user.' };

    return await getPartner(partner.id);
}

export async function getPartnerCommissions(partnerId: string) {
    const supabase = await createClient();
    // Assuming 'partner_commissions' table exists
    const { data, error } = await supabase.from('partner_commissions').select('*').eq('partner_id', partnerId).order('sale_date', { ascending: false });

    if (error) {
        console.error('Error fetching commissions:', error);
        return { success: true, data: [] }; // Return empty if table missing/error to avoid crashing
    }

    const commissions: PartnerCommission[] = (data || []).map((c: any) => ({
        id: c.id,
        partnerId: c.partner_id,
        partnerName: c.partner_name || '',
        saleId: c.sale_id,
        customerName: c.customer_name,
        planName: c.plan_name,
        saleAmount: c.sale_amount,
        commissionPercent: c.commission_percent,
        commissionAmount: c.commission_amount,
        status: (c.status as any) || 'pending',
        saleDate: c.sale_date,
        payoutDate: c.payout_date
    }));

    return { success: true, data: commissions };
}
