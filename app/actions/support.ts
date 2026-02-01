'use server';

import { MOCK_REQUESTS, MOCK_THREADS, MOCK_CLAIMS, ServiceRequest, ThreadMessage, ReimbursementClaim } from '@/app/lib/mock/support-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- SERVICE REQUESTS ---

export async function getRequests() {
    await delay(500);
    return { success: true, data: MOCK_REQUESTS };
}

export async function getRequestThread(requestId: string) {
    await delay(400);
    return { success: true, data: MOCK_THREADS.filter(t => t.requestId === requestId) };
}

export async function updateRequestStatus(id: string, status: string, notes?: string) {
    await delay(600);
    console.log(`Updating request ${id} to ${status}. Notes: ${notes}`);
    return { success: true, message: 'Status updated successfully' };
}

export async function assignRequest(id: string, adminId: string) {
    await delay(400);
    return { success: true, message: 'Request assigned' };
}

export async function postReply(requestId: string, message: string) {
    await delay(500);
    const newMsg: ThreadMessage = {
        id: `msg_${Date.now()}`,
        requestId,
        sender: 'admin',
        senderName: 'You',
        message,
        timestamp: new Date().toISOString()
    };
    return { success: true, data: newMsg, message: 'Reply sent' };
}

// --- REIMBURSEMENTS ---

export async function getClaims() {
    await delay(600);
    return { success: true, data: MOCK_CLAIMS };
}

export async function processClaim(id: string, status: 'approved' | 'rejected', data: any) {
    await delay(1000);
    console.log(`Processing Claim ${id}: ${status}`, data);
    return { success: true, message: `Claim ${status} successfully` };
}
