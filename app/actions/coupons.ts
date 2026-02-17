'use server';

import { createClient } from '@/lib/supabase/server';
import { Coupon, CouponType, CouponStatus } from '@/types/coupons';

export async function getCoupons() {
    const supabase = await createClient();
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });

    if (error) return { success: false, error: error.message };

    const coupons: Coupon[] = data.map((c: any) => ({
        id: c.id,
        code: c.code,
        description: c.description || '',
        type: (c.discount_type as CouponType) || 'fixed',
        value: c.discount_value || 0,
        applicablePlans: c.applicable_plans || 'all',
        minPurchaseAmount: c.min_order_value,
        maxDiscountAmount: c.max_discount,
        usageType: c.usage_limit ? 'limited' : 'unlimited', // Inferred
        totalUsesAllowed: c.usage_limit || 0,
        usesPerCustomer: c.uses_per_customer || 1,
        currentUses: c.times_used || 0,
        validityType: c.expiry_date ? 'limited' : 'always',
        startDate: c.start_date,
        endDate: c.expiry_date,
        targetCustomers: c.target_audience || 'all',
        isExclusive: c.is_exclusive || false,
        showOnWebsite: c.show_on_website || false,
        terms: c.terms || '',
        status: (c.status as CouponStatus) || 'active',
        totalDiscountGiven: 0, // Need aggregation
        revenueGenerated: 0 // Need aggregation
    }));

    return { success: true, data: coupons };
}

export async function getCouponLogs(couponCode: string) {
    // We don't have a coupon_logs table in schema.sql yet. 
    // For now return empty or implement a table later.
    return { success: true, data: [] };
}

export async function upsertCoupon(coupon: Partial<Coupon>) {
    const supabase = await createClient();

    const dbPayload = {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discount_type: coupon.type,
        discount_value: coupon.value,
        min_order_value: coupon.minPurchaseAmount,
        max_discount: coupon.maxDiscountAmount,
        start_date: coupon.startDate,
        expiry_date: coupon.endDate,
        usage_limit: coupon.totalUsesAllowed,
        uses_per_customer: coupon.usesPerCustomer,
        target_audience: coupon.targetCustomers,
        applicable_plans: coupon.applicablePlans,
        is_exclusive: coupon.isExclusive,
        show_on_website: coupon.showOnWebsite,
        terms: coupon.terms,
        status: coupon.status,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('coupons').upsert(dbPayload);

    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Coupon saved successfully' };
}

export async function deleteCoupon(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, message: 'Coupon deleted' };
}

export async function validateCoupon(code: string, cartAmount: number) {
    const supabase = await createClient();

    const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .single();

    if (error || !coupon) return { success: false, message: 'Invalid or expired coupon' };

    if (coupon.status !== 'active') return { success: false, message: 'Coupon is not active' };

    // Date check
    const now = new Date();
    if (coupon.expiry_date && new Date(coupon.expiry_date) < now) return { success: false, message: 'Coupon expired' };
    if (coupon.start_date && new Date(coupon.start_date) > now) return { success: false, message: 'Coupon not yet active' };

    if (coupon.min_order_value && cartAmount < coupon.min_order_value) {
        return { success: false, message: `Minimum purchase of ₹${coupon.min_order_value} required` };
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
        discount = (cartAmount * coupon.discount_value) / 100;
        if (coupon.max_discount && discount > coupon.max_discount) {
            discount = coupon.max_discount;
        }
    } else {
        discount = coupon.discount_value;
    }

    return { success: true, data: { code: coupon.code, discount, finalPrice: cartAmount - discount } };
}
