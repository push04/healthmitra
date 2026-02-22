'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Coupon, CouponType, CouponStatus } from '@/types/coupons';

export async function getCoupons() {
    const supabase = await createAdminClient();
    
    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('getCoupons error:', error);
        return { success: false, error: error.message };
    }

    const coupons: Coupon[] = (data || []).map((c: any) => ({
        id: c.id,
        code: c.code || '',
        description: '',
        type: (c.discount_type === 'percentage' ? 'percentage' : 'fixed') as CouponType,
        value: Number(c.discount_value) || 0,
        applicablePlans: 'all' as const,
        minPurchaseAmount: undefined,
        maxDiscountAmount: undefined,
        usageType: c.usage_limit ? 'limited' : 'unlimited' as const,
        totalUsesAllowed: c.usage_limit || 0,
        usesPerCustomer: 1,
        currentUses: c.used_count || 0,
        validityType: c.valid_until ? 'limited' : 'always' as const,
        startDate: c.valid_from || '',
        endDate: c.valid_until || '',
        targetCustomers: 'all' as const,
        isExclusive: false,
        showOnWebsite: false,
        terms: '',
        status: c.is_active ? 'active' : 'inactive' as CouponStatus,
        totalDiscountGiven: 0,
        revenueGenerated: 0
    }));

    return { success: true, data: coupons };
}

export async function getCouponLogs(_couponCode: string) {
    return { success: true, data: [] };
}

export async function upsertCoupon(coupon: Partial<Coupon>) {
    const supabase = await createAdminClient();

    // Ensure discount_type is always either 'percentage' or 'fixed'
    let discountType = coupon.type === 'percentage' ? 'percentage' : 'fixed';
    
    const dbPayload: any = {
        code: coupon.code?.toUpperCase() || 'EMPTY',
        discount_value: coupon.value || 0,
        discount_type: discountType,
        is_active: true,
        used_count: 0
    };

    if (coupon.id) {
        dbPayload.id = coupon.id;
    }

    const { error } = await supabase.from('coupons').upsert(dbPayload);

    if (error) {
        console.error('Coupon upsert error:', error);
        return { success: false, error: error.message };
    }
    return { success: true, message: 'Coupon saved successfully' };
}

export async function deleteCoupon(id: string) {
    const supabase = await createAdminClient();
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Coupon deleted' };
}

export async function validateCoupon(code: string, cartAmount: number) {
    const supabase = await createClient();

    const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

    if (error || !coupon) return { success: false, message: 'Invalid or expired coupon' };

    if (!coupon.is_active) return { success: false, message: 'Coupon is not active' };

    const now = new Date();
    if (coupon.valid_until && new Date(coupon.valid_until) < now) return { success: false, message: 'Coupon expired' };

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
        discount = (cartAmount * coupon.discount_value) / 100;
    } else {
        discount = coupon.discount_value;
    }

    return { success: true, data: { code: coupon.code, discount, finalPrice: cartAmount - discount } };
}
