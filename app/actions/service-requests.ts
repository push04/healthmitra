'use server'

import {
    AdminServiceRequest, MOCK_ADMIN_SERVICE_REQUESTS, MOCK_AGENTS, Agent
} from '@/app/lib/mock/service-requests-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getAdminServiceRequests(filters?: {
    status?: string;
    type?: string;
    agentId?: string;
    query?: string;
}) {
    await delay(500);
    let requests = [...MOCK_ADMIN_SERVICE_REQUESTS];

    if (filters?.query) {
        const q = filters.query.toLowerCase();
        requests = requests.filter(r =>
            r.customerName.toLowerCase().includes(q) ||
            r.customerEmail.toLowerCase().includes(q) ||
            r.customerContact.includes(q) ||
            r.id.toLowerCase().includes(q)
        );
    }

    if (filters?.status && filters.status !== 'all') {
        requests = requests.filter(r => r.status === filters.status);
    }

    if (filters?.type && filters.type !== 'all') {
        requests = requests.filter(r => r.type === filters.type);
    }

    if (filters?.agentId && filters.agentId !== 'all') {
        requests = requests.filter(r => r.assignedTo?.id === filters.agentId);
    }

    const stats = {
        total: MOCK_ADMIN_SERVICE_REQUESTS.length,
        pending: MOCK_ADMIN_SERVICE_REQUESTS.filter(r => r.status === 'pending').length,
        assigned: MOCK_ADMIN_SERVICE_REQUESTS.filter(r => r.status === 'assigned').length,
        in_progress: MOCK_ADMIN_SERVICE_REQUESTS.filter(r => r.status === 'in_progress').length,
        completed: MOCK_ADMIN_SERVICE_REQUESTS.filter(r => r.status === 'completed').length,
    };

    return { success: true, data: requests, stats };
}

export async function getAdminServiceRequest(id: string) {
    await delay(300);
    const request = MOCK_ADMIN_SERVICE_REQUESTS.find(r => r.id === id);
    if (!request) return { success: false, error: 'Service request not found' };
    return { success: true, data: request };
}

export async function assignServiceRequest(id: string, agentId: string) {
    await delay(600);
    const agent = MOCK_AGENTS.find(a => a.id === agentId);
    console.log(`Assigning SR ${id} to agent ${agent?.name}`);
    return { success: true, message: `Assigned to ${agent?.name}` };
}

export async function updateServiceRequestStatus(id: string, status: string) {
    await delay(400);
    console.log(`Updating SR ${id} status to ${status}`);
    return { success: true, message: `Status updated to ${status}` };
}

export async function getAgents() {
    await delay(200);
    return { success: true, data: MOCK_AGENTS };
}
