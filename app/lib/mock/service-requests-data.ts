export type SRStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type SRType = 'medical_consultation' | 'diagnostic' | 'medicine' | 'ambulance' | 'caretaker' | 'nursing' | 'other';

export interface Agent {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'available' | 'busy' | 'offline';
}

export interface AdminServiceRequest {
    id: string;
    requestNo: number;
    customerName: string;
    customerEmail: string;
    customerContact: string;
    type: SRType;
    status: SRStatus;
    description: string;
    assignedTo?: Agent;
    requestedAt: string;
    assignedAt?: string;
    completedAt?: string;
    franchiseId?: string;
    franchiseName?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
}

export const MOCK_AGENTS: Agent[] = [
    { id: 'agent_1', name: 'Priya Sharma', email: 'priya@healthmitra.com', phone: '+91 98765 43210', status: 'available' },
    { id: 'agent_2', name: 'Rahul Verma', email: 'rahul@healthmitra.com', phone: '+91 98765 43211', status: 'busy' },
    { id: 'agent_3', name: 'Anjali Patel', email: 'anjali@healthmitra.com', phone: '+91 98765 43212', status: 'available' },
    { id: 'agent_4', name: 'Vikram Singh', email: 'vikram@healthmitra.com', phone: '+91 98765 43213', status: 'offline' },
];

export const MOCK_ADMIN_SERVICE_REQUESTS: AdminServiceRequest[] = [
    {
        id: 'sr_001', requestNo: 1001,
        customerName: 'Rajesh Kumar', customerEmail: 'rajesh@gmail.com', customerContact: '+91 99887 76655',
        type: 'medical_consultation', status: 'pending', description: 'Need a general physician consultation for recurring headaches.',
        priority: 'medium', requestedAt: '2025-02-10T09:30:00Z',
        franchiseId: 'fr_1', franchiseName: 'HealthMitra Delhi NCR',
    },
    {
        id: 'sr_002', requestNo: 1002,
        customerName: 'Sunita Devi', customerEmail: 'sunita.d@gmail.com', customerContact: '+91 88776 65544',
        type: 'nursing', status: 'assigned', description: 'Post-surgery home nursing care required for 2 weeks.',
        priority: 'high', requestedAt: '2025-02-09T14:00:00Z', assignedAt: '2025-02-09T15:30:00Z',
        assignedTo: MOCK_AGENTS[0],
        franchiseId: 'fr_1', franchiseName: 'HealthMitra Delhi NCR',
    },
    {
        id: 'sr_003', requestNo: 1003,
        customerName: 'Amit Gupta', customerEmail: 'amit.g@yahoo.com', customerContact: '+91 77665 54433',
        type: 'diagnostic', status: 'in_progress', description: 'Full body checkup and blood test at home.',
        priority: 'low', requestedAt: '2025-02-08T11:00:00Z', assignedAt: '2025-02-08T12:00:00Z',
        assignedTo: MOCK_AGENTS[1],
    },
    {
        id: 'sr_004', requestNo: 1004,
        customerName: 'Meera Joshi', customerEmail: 'meera.j@hotmail.com', customerContact: '+91 66554 43322',
        type: 'ambulance', status: 'completed', description: 'Emergency ambulance for hospital transfer.',
        priority: 'urgent', requestedAt: '2025-02-07T06:45:00Z', assignedAt: '2025-02-07T06:50:00Z', completedAt: '2025-02-07T08:00:00Z',
        assignedTo: MOCK_AGENTS[2],
        franchiseId: 'fr_2', franchiseName: 'HealthMitra Mumbai',
    },
    {
        id: 'sr_005', requestNo: 1005,
        customerName: 'Ramesh Yadav', customerEmail: 'ramesh.y@gmail.com', customerContact: '+91 55443 32211',
        type: 'caretaker', status: 'assigned', description: 'Full-time caretaker needed for elderly parent.',
        priority: 'medium', requestedAt: '2025-02-06T16:00:00Z', assignedAt: '2025-02-06T17:30:00Z',
        assignedTo: MOCK_AGENTS[0],
    },
    {
        id: 'sr_006', requestNo: 1006,
        customerName: 'Pooja Reddy', customerEmail: 'pooja.r@gmail.com', customerContact: '+91 44332 21100',
        type: 'medicine', status: 'cancelled', description: 'Medicine delivery for monthly prescriptions.',
        priority: 'low', requestedAt: '2025-02-05T10:00:00Z',
        notes: 'Customer cancelled - found alternative pharmacy.',
    },
    {
        id: 'sr_007', requestNo: 1007,
        customerName: 'Karan Malhotra', customerEmail: 'karan.m@gmail.com', customerContact: '+91 33221 10099',
        type: 'medical_consultation', status: 'pending', description: 'Telemedicine consultation with cardiologist.',
        priority: 'high', requestedAt: '2025-02-10T15:00:00Z',
        franchiseId: 'fr_2', franchiseName: 'HealthMitra Mumbai',
    },
];
