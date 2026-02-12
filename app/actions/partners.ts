'use server';

import {
    MOCK_PARTNERS, MOCK_SUB_PARTNERS, MOCK_COMMISSIONS,
    Partner, SubPartner, PartnerCommission
} from '@/app/lib/mock/partner-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- PARTNER LISTING ---

interface GetPartnersFilters {
    query?: string;
    status?: string;
}

export async function getPartners(filters: GetPartnersFilters = {}) {
    await delay(500);

    let partners = [...MOCK_PARTNERS];

    if (filters.query) {
        const q = filters.query.toLowerCase();
        partners = partners.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.referralCode.toLowerCase().includes(q)
        );
    }

    if (filters.status && filters.status !== 'all') {
        partners = partners.filter(p => p.status === filters.status);
    }

    const stats = {
        total: MOCK_PARTNERS.length,
        active: MOCK_PARTNERS.filter(p => p.status === 'active').length,
        kycVerified: MOCK_PARTNERS.filter(p => p.kycStatus === 'verified').length,
        totalRevenue: MOCK_PARTNERS.reduce((a, p) => a + p.totalCommission, 0),
    };

    return { success: true, data: partners, stats };
}

// --- SINGLE PARTNER ---

export async function getPartner(id: string) {
    await delay(400);
    const partner = MOCK_PARTNERS.find(p => p.id === id);
    if (!partner) return { success: false, error: 'Partner not found' };

    const subPartners = MOCK_SUB_PARTNERS.filter(sp => sp.parentPartnerId === id);
    const commissions = MOCK_COMMISSIONS.filter(c => c.partnerId === id);

    return {
        success: true, data: { partner, subPartners, commissions }
    };
}

// --- CREATE / UPDATE PARTNER ---

export async function createPartner(data: Partial<Partner>) {
    await delay(800);
    console.log('Creating Partner:', data);
    return {
        success: true,
        message: 'Partner created successfully',
        data: { ...data, id: `ptr_${Date.now()}` }
    };
}

export async function updatePartner(id: string, data: Partial<Partner>) {
    await delay(600);
    console.log(`Updating Partner ${id}:`, data);
    return { success: true, message: 'Partner updated successfully' };
}

// --- SUB-PARTNERS ---

export async function getSubPartners(partnerId: string) {
    await delay(400);
    const subPartners = MOCK_SUB_PARTNERS.filter(sp => sp.parentPartnerId === partnerId);
    return { success: true, data: subPartners };
}

export async function addSubPartner(partnerId: string, data: Partial<SubPartner>) {
    await delay(600);
    console.log(`Adding sub-partner to ${partnerId}:`, data);
    return { success: true, message: 'Sub-partner added successfully' };
}

// --- COMMISSIONS ---

export async function getCommissionLedger(partnerId?: string) {
    await delay(400);
    let commissions = [...MOCK_COMMISSIONS];
    if (partnerId) commissions = commissions.filter(c => c.partnerId === partnerId);
    return { success: true, data: commissions };
}

// --- PARTNER LOGIN ---

export async function partnerLogin(email: string, password: string) {
    await delay(800);
    const partner = MOCK_PARTNERS.find(p => p.email === email);
    if (partner) {
        return { success: true, message: `Welcome back, ${partner.name}!`, data: { partnerId: partner.id } };
    }
    return { success: false, error: 'Invalid credentials.' };
}
