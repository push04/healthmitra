export interface SalesMetric {
    month: string;
    revenue: number;
    plansSold: number;
}

export interface CustomerInsight {
    metric: string;
    value: string | number;
    change: string; // "+15%"
    trend: 'up' | 'down';
}

export interface RecentActivity {
    id: string;
    message: string;
    time: string;
    type: 'purchase' | 'request' | 'system' | 'claim';
}

export const MOCK_REVENUE_CHART: SalesMetric[] = [
    { month: 'Jan', revenue: 65000, plansSold: 12 },
    { month: 'Feb', revenue: 72000, plansSold: 15 },
    { month: 'Mar', revenue: 85000, plansSold: 22 },
    { month: 'Apr', revenue: 82000, plansSold: 20 },
    { month: 'May', revenue: 95000, plansSold: 28 },
    { month: 'Jun', revenue: 110000, plansSold: 35 },
    { month: 'Jul', revenue: 105000, plansSold: 32 },
    { month: 'Aug', revenue: 125000, plansSold: 42 },
    { month: 'Sep', revenue: 115000, plansSold: 38 },
    { month: 'Oct', revenue: 140000, plansSold: 48 },
    { month: 'Nov', revenue: 155000, plansSold: 55 },
    { month: 'Dec', revenue: 180000, plansSold: 65 },
];

export const MOCK_PLAN_SALES = [
    { name: 'Gold Plan', value: 45 },
    { name: 'Silver Plan', value: 30 },
    { name: 'Basic Plan', value: 25 },
];

export const MOCK_CUSTOMER_CHART = [
    { month: 'Jan', new: 45, retained: 320 },
    { month: 'Feb', new: 52, retained: 345 },
    { month: 'Mar', new: 48, retained: 380 },
    { month: 'Apr', new: 61, retained: 410 },
    { month: 'May', new: 55, retained: 450 },
    { month: 'Jun', new: 67, retained: 490 },
];

export const MOCK_ACTIVITIES: RecentActivity[] = [
    { id: '1', message: 'New plan purchase by Rajesh Kumar', time: '2 mins ago', type: 'purchase' },
    { id: '2', message: 'Reimbursement claim approved (CLM-001)', time: '15 mins ago', type: 'claim' },
    { id: '3', message: 'New customer registered', time: '1 hour ago', type: 'system' },
    { id: '4', message: 'Service request completed (REQ-045)', time: '2 hours ago', type: 'request' },
    { id: '5', message: 'Campaign email sent to 500 users', time: '5 hours ago', type: 'system' },
];

export const MOCK_CUSTOMER_INSIGHTS = {
    total: 1245,
    active: 1120,
    inactive: 125,
    clv: 18500,
    acquisition: [
        { name: 'Website', value: 45 },
        { name: 'Referral', value: 30 },
        { name: 'Social', value: 15 },
        { name: 'Direct', value: 10 }
    ],
    demographics: {
        age: [{ name: '18-25', value: 15 }, { name: '26-35', value: 35 }, { name: '36-50', value: 30 }, { name: '51+', value: 20 }]
    }
};
