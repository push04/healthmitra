'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function ensureWalletExists(userId: string): Promise<{ success: boolean; wallet?: any; error?: string }> {
    const adminClient = await createAdminClient();

    // Check if wallet exists
    const { data: existingWallet } = await adminClient
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (existingWallet) {
        return { success: true, wallet: existingWallet };
    }

    // Create wallet if it doesn't exist - use admin client to bypass RLS
    const { data: newWallet, error } = await adminClient
        .from('wallets')
        .insert({
            user_id: userId,
            balance: 0,
            currency: 'INR'
        })
        .select()
        .single();

    if (error) {
        console.error('Wallet creation error:', error);
        return { success: false, error: error.message };
    }

    return { success: true, wallet: newWallet };
}

export async function addMoneyToWallet(
    userId: string,
    amount: number
): Promise<{ success: boolean; error?: string }> {
    const adminClient = await createAdminClient();

    // Ensure wallet exists
    const walletResult = await ensureWalletExists(userId);
    if (!walletResult.success) {
        return { success: false, error: walletResult.error };
    }

    const newBalance = (walletResult.wallet?.balance || 0) + Number(amount);

    const { error } = await adminClient
        .from('wallets')
        .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

    if (error) {
        console.error('Wallet update error:', error);
        return { success: false, error: error.message };
    }

    // Record transaction - use user_id as per schema (NOT wallet_id)
    const { error: txnError } = await adminClient.from('wallet_transactions').insert({
        user_id: userId,
        type: 'credit',
        amount: Number(amount),
        description: 'Wallet top-up',
        status: 'success',
        transaction_date: new Date().toISOString()
    });

    if (txnError) {
        console.error('Transaction record error:', txnError);
    }

    return { success: true };
}

export async function getWalletWithTransactions(userId: string) {
    const adminClient = await createAdminClient();

    const { data: wallet, error } = await adminClient
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        return { success: false, error: error.message };
    }

    if (!wallet) {
        return { success: true, wallet: null, transactions: [] };
    }

    // Use user_id instead of wallet_id for transactions
    const { data: transactions } = await adminClient
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    return { success: true, wallet, transactions: transactions || [] };
}
