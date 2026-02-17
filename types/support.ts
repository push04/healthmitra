export interface SupportTicket {
    id: string;
    subject: string;
    category: string;
    status: 'open' | 'resolved' | 'pending' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    createdAt: string;
    lastReply: string;
    lastMessage: string;
    isFromSupport: boolean;
    resolvedAt?: string;
    resolution?: string;
}

export interface CreateTicketInput {
    subject: string;
    description: string;
    category: string;
    priority: string;
}
