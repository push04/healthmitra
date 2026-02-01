'use server';

import { MOCK_SETTINGS, MOCK_AUDIT_LOGS, SystemSettings } from '@/app/lib/mock/settings-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getSystemSettings() {
    await delay(400);
    return { success: true, data: MOCK_SETTINGS };
}

export async function updateSystemSettings(settings: Partial<SystemSettings>) {
    await delay(800);
    console.log("Updating Settings:", settings);
    return { success: true, message: 'Settings updated successfully' };
}

export async function getAuditLogs() {
    await delay(400);
    return { success: true, data: MOCK_AUDIT_LOGS };
}
