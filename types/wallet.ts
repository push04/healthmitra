export type TransactionType = 'credit' | 'debit';
export type TransactionStatus = 'success' | 'pending' | 'failed';

export interface WalletTransaction {
    id: string;
    type: TransactionType;
    amount: number;
    description: string;
    date: string;
    status: TransactionStatus;
    referenceId?: string;
}

export interface WalletStats {
    balance: number;
    totalCredited: number;
    totalDebited: number;
    thisMonthSpend: number;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface WithdrawalRequest {
    id: string;
    userId: string;
    customerName: string;
    customerEmail: string;
    
    amount: number;
    status: WithdrawalStatus;
    
    bankName: string;
    bankAccount: string;
    ifscCode: string;
    
    createdAt: string;
    processedAt?: string;
    adminNotes?: string;
}

