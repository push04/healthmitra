'use server';

import { MOCK_AGENTS, MOCK_ADMIN_SERVICE_REQUESTS, Agent, AdminServiceRequest } from '@/app/lib/mock/service-requests-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- AGENT LOGIN ---

export async function agentLogin(email: string, password: string) {
    await delay(600);
    const agent = MOCK_AGENTS.find(a => a.email === email);
    if (agent) {
        return { success: true, message: `Welcome, ${agent.name}!`, data: { agentId: agent.id, name: agent.name } };
    }
    return { success: false, error: 'Invalid credentials.' };
}

// --- AGENT DASHBOARD ---

export async function getAgentAssignedRequests(agentId: string) {
    await delay(500);
    const assigned = MOCK_ADMIN_SERVICE_REQUESTS.filter(
        sr => sr.assignedTo?.id === agentId
    );
    return { success: true, data: assigned };
}

// --- ALL REQUESTS (SUPERVISOR VIEW) ---

interface CCFilters {
    query?: string;
    status?: string;
    agentId?: string;
}

export async function getCallCentreRequests(filters: CCFilters = {}) {
    await delay(500);

    let requests = [...MOCK_ADMIN_SERVICE_REQUESTS];

    if (filters.query) {
        const q = filters.query.toLowerCase();
        requests = requests.filter(sr =>
            sr.customerName.toLowerCase().includes(q) ||
            sr.customerEmail.toLowerCase().includes(q) ||
            sr.id.toLowerCase().includes(q)
        );
    }

    if (filters.status && filters.status !== 'all') {
        requests = requests.filter(sr => sr.status === filters.status);
    }

    if (filters.agentId && filters.agentId !== 'all') {
        requests = requests.filter(sr => sr.assignedTo?.id === filters.agentId);
    }

    const stats = {
        total: MOCK_ADMIN_SERVICE_REQUESTS.length,
        pending: MOCK_ADMIN_SERVICE_REQUESTS.filter(sr => sr.status === 'pending').length,
        assigned: MOCK_ADMIN_SERVICE_REQUESTS.filter(sr => sr.status === 'assigned').length,
        inProgress: MOCK_ADMIN_SERVICE_REQUESTS.filter(sr => sr.status === 'in_progress').length,
        completed: MOCK_ADMIN_SERVICE_REQUESTS.filter(sr => sr.status === 'completed').length,
    };

    return { success: true, data: requests, stats };
}

// --- AGENT MANAGEMENT ---

export async function getAgents() {
    await delay(300);
    const agentStats = MOCK_AGENTS.map(a => ({
        ...a,
        assignedCount: MOCK_ADMIN_SERVICE_REQUESTS.filter(sr => sr.assignedTo?.id === a.id).length,
        completedCount: MOCK_ADMIN_SERVICE_REQUESTS.filter(sr => sr.assignedTo?.id === a.id && sr.status === 'completed').length,
    }));
    return { success: true, data: agentStats };
}

// --- REPORTS ---

export async function getCallCentreReports() {
    await delay(500);
    const requests = MOCK_ADMIN_SERVICE_REQUESTS;

    const byType = ['medical_consultation', 'diagnostic', 'medicine', 'ambulance', 'caretaker', 'nursing', 'other'].map(t => ({
        type: t.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase()),
        count: requests.filter(r => r.type === t).length,
    }));

    const byStatus = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'].map(s => ({
        status: s.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase()),
        count: requests.filter(r => r.status === s).length,
    }));

    const byAgent = MOCK_AGENTS.map(a => ({
        name: a.name,
        total: requests.filter(r => r.assignedTo?.id === a.id).length,
        completed: requests.filter(r => r.assignedTo?.id === a.id && r.status === 'completed').length,
        pending: requests.filter(r => r.assignedTo?.id === a.id && (r.status === 'assigned' || r.status === 'in_progress')).length,
    }));

    return { success: true, data: { byType, byStatus, byAgent, total: requests.length } };
}

// --- ASSIGN REQUEST ---

export async function assignRequestToAgent(requestId: string, agentId: string) {
    await delay(400);
    console.log(`Assigning request ${requestId} to agent ${agentId}`);
    return { success: true, message: 'Request assigned successfully' };
}
