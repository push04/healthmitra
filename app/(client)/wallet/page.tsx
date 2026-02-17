import { WalletView } from "@/components/client/wallet/WalletView";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function WalletPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();

    // Fetch transactions for stats
    const { data: transactions } = await supabase.from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet?.id)
        .order('created_at', { ascending: false });

    const txs: any[] = transactions || [];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const stats = {
        totalCredited: txs.filter((t: any) => t.type === 'credit').reduce((a: number, t: any) => a + Number(t.amount), 0),
        creditedCount: txs.filter((t: any) => t.type === 'credit').length,
        totalDebited: txs.filter((t: any) => t.type === 'debit').reduce((a: number, t: any) => a + Number(t.amount), 0),
        debitedCount: txs.filter((t: any) => t.type === 'debit').length,
        thisMonthSpend: txs.filter((t: any) => t.type === 'debit' && t.created_at >= startOfMonth).reduce((a: number, t: any) => a + Number(t.amount), 0),
        thisMonthCount: txs.filter((t: any) => t.type === 'debit' && t.created_at >= startOfMonth).length
    };

    return <WalletView wallet={wallet || { id: '', balance: 0, currency: 'INR', status: 'inactive' }} stats={stats} />;
}
