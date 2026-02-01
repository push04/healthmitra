export type CouponType = 'percentage' | 'fixed';
export type CouponStatus = 'active' | 'inactive' | 'expired';

export interface Coupon {
    id: string;
    code: string;
    description: string;
    type: CouponType;
    value: number; // Percentage or Amount

    // Applicability
    applicablePlans: 'all' | string[]; // 'all' or list of Plan IDs
    minPurchaseAmount?: number;
    maxDiscountAmount?: number; // Only for percentage

    // Usage
    usageType: 'unlimited' | 'limited';
    totalUsesAllowed: number;
    usesPerCustomer: number;
    currentUses: number;

    // Validity
    validityType: 'limited' | 'always';
    startDate: string;
    endDate?: string;

    // Settings
    targetCustomers: 'all' | 'new' | 'existing';
    isExclusive: boolean; // Cannot combine
    showOnWebsite: boolean;
    terms: string;

    status: CouponStatus;

    // Metrics
    totalDiscountGiven: number;
    revenueGenerated: number;
}

export const MOCK_COUPONS: Coupon[] = [
    {
        id: 'cpn_1',
        code: 'NEWYEAR2025',
        description: 'New Year special discount - 20% off on all plans',
        type: 'percentage',
        value: 20,
        applicablePlans: 'all',
        maxDiscountAmount: 2000,
        usageType: 'unlimited',
        totalUsesAllowed: 9999,
        usesPerCustomer: 1,
        currentUses: 145,
        validityType: 'limited',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        targetCustomers: 'all',
        isExclusive: true,
        showOnWebsite: true,
        terms: '<p>Valid for all users. Max discount ₹2000.</p>',
        status: 'active',
        totalDiscountGiven: 45600,
        revenueGenerated: 228500
    },
    {
        id: 'cpn_2',
        code: 'FIRST500',
        description: 'Flat ₹500 OFF for new customers on Gold Plan',
        type: 'fixed',
        value: 500,
        applicablePlans: ['plan_gold'],
        minPurchaseAmount: 5000,
        usageType: 'limited',
        totalUsesAllowed: 100,
        usesPerCustomer: 1,
        currentUses: 23,
        validityType: 'always',
        startDate: '2024-01-01',
        targetCustomers: 'new',
        isExclusive: false,
        showOnWebsite: true,
        terms: '<p>Only for first time purchase of Gold Plan.</p>',
        status: 'active',
        totalDiscountGiven: 11500,
        revenueGenerated: 57500
    }
];

export interface CouponUsageLog {
    id: string;
    couponCode: string;
    customerName: string;
    planName: string;
    discountAmount: number;
    date: string;
}

export const MOCK_COUPON_LOGS: CouponUsageLog[] = [
    { id: 'log_1', couponCode: 'NEWYEAR2025', customerName: 'Rajesh Kumar', planName: 'Gold Plan', discountAmount: 2500, date: '2025-01-19' },
    { id: 'log_2', couponCode: 'NEWYEAR2025', customerName: 'Priya Sharma', planName: 'Silver Plan', discountAmount: 1500, date: '2025-01-18' }
];
