import { WalletView } from "@/components/client/wallet/WalletView";

export default async function WalletPage() {
    // MOCK DATA
    const MOCK_WALLET = {
        id: "wallet-123",
        user_id: "mock-user-123",
        balance: 15450,
        currency: "INR",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const MOCK_STATS = {
        totalCredited: 25000,
        creditedCount: 5,
        totalDebited: 9550,
        debitedCount: 3,
        thisMonthSpend: 1200,
        thisMonthCount: 1
    };

    return <WalletView wallet={MOCK_WALLET} stats={MOCK_STATS} />;
}
