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
    terms?: string;

    status: CouponStatus;

    // Metrics
    totalDiscountGiven: number;
    revenueGenerated: number;
}

export interface CouponUsageLog {
    id: string;
    couponCode: string;
    customerName: string;
    planName: string;
    discountAmount: number;
    date: string;
}
