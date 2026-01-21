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

export const MOCK_WALLET_STATS: WalletStats = {
    balance: 5240.00,
    totalCredited: 12450,
    totalDebited: 8210,
    thisMonthSpend: 4240
};

export const MOCK_TRANSACTIONS: WalletTransaction[] = [
    {
        id: 'tx1',
        type: 'credit',
        amount: 1250,
        description: 'Reimbursement Approved (CLM-2025-001)',
        date: 'Jan 16, 2025, 11:45 AM',
        status: 'success',
        referenceId: 'TXN-2025-0116-XYZ789'
    },
    {
        id: 'tx2',
        type: 'debit',
        amount: 2500,
        description: 'Medicine Purchase - Apollo Pharmacy',
        date: 'Jan 10, 2025, 05:30 PM',
        status: 'success',
        referenceId: 'TXN-2025-0110-ABC123'
    },
    {
        id: 'tx3',
        type: 'credit',
        amount: 5000,
        description: 'Wallet Top-up via UPI',
        date: 'Jan 01, 2025, 10:00 AM',
        status: 'success',
        referenceId: 'TXN-2025-0101-UPITOP'
    },
    {
        id: 'tx4',
        type: 'debit',
        amount: 1500,
        description: 'OPD Consultation Payment',
        date: 'Dec 28, 2024, 02:15 PM',
        status: 'success',
        referenceId: 'TXN-2024-1228-OPDPAY'
    },
    {
        id: 'tx5',
        type: 'debit',
        amount: 5000,
        description: 'Withdrawal Request',
        date: 'Dec 20, 2024, 09:00 AM',
        status: 'pending',
        referenceId: 'TXN-2024-1220-WITHDR'
    }
];
