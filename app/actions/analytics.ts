'use server';

import { MOCK_REVENUE_CHART, MOCK_PLAN_SALES, MOCK_CUSTOMER_CHART, MOCK_ACTIVITIES, MOCK_CUSTOMER_INSIGHTS } from '@/app/lib/mock/reports-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getDashboardStats() {
    await delay(600);
    return {
        success: true,
        data: {
            revenueChart: MOCK_REVENUE_CHART,
            planSales: MOCK_PLAN_SALES,
            customerGrowth: MOCK_CUSTOMER_CHART,
            activities: MOCK_ACTIVITIES
        }
    };
}

export async function getCustomerMetrics() {
    await delay(500);
    return { success: true, data: MOCK_CUSTOMER_INSIGHTS };
}

export async function generateReportAction(type: string, filters: any) {
    await delay(1500); // Simulate processing
    console.log(`Generating ${type} report with filters:`, filters);
    return { success: true, message: 'Report generated successfully', downloadUrl: '#' };
}
