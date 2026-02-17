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

