import { MyPurchasesView } from "@/components/client/MyPurchasesView";

export default async function MyPurchasesPage() {
    // MOCK PURCHASES
    const MOCK_PURCHASES = [
        {
            id: "purchase-001",
            plan_name: "Gold Family Protection",
            status: "active",
            coverage_amount: 500000,
            start_date: "2024-01-01",
            expiry_date: "2025-01-01",
            created_at: new Date().toISOString()
        }
    ];

    return <MyPurchasesView purchases={MOCK_PURCHASES} />;
}
