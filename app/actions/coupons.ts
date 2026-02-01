'use server';

import { MOCK_COUPONS, Coupon, CouponUsageLog, MOCK_COUPON_LOGS } from '@/app/lib/mock/coupons-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getCoupons() {
    await delay(500);
    return { success: true, data: MOCK_COUPONS };
}

export async function getCouponLogs(couponCode: string) {
    await delay(400);
    return { success: true, data: MOCK_COUPON_LOGS.filter(l => l.couponCode === couponCode) };
}

export async function upsertCoupon(coupon: Partial<Coupon>) {
    await delay(800);
    console.log("Upserting Coupon:", coupon);
    return { success: true, message: 'Coupon saved successfully' };
}

export async function deleteCoupon(id: string) {
    await delay(300);
    return { success: true, message: 'Coupon deleted' };
}

export async function validateCoupon(code: string, cartAmount: number) {
    await delay(600);
    const coupon = MOCK_COUPONS.find(c => c.code === code && c.status === 'active');

    if (!coupon) return { success: false, message: 'Invalid or expired coupon' };

    if (coupon.minPurchaseAmount && cartAmount < coupon.minPurchaseAmount) {
        return { success: false, message: `Minimum purchase of ₹${coupon.minPurchaseAmount} required` };
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
        discount = (cartAmount * coupon.value) / 100;
        if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
            discount = coupon.maxDiscountAmount;
        }
    } else {
        discount = coupon.value;
    }

    return { success: true, data: { code: coupon.code, discount, finalPrice: cartAmount - discount } };
}
