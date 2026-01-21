import { InvoicesView } from "@/components/client/InvoicesView";

export default async function InvoicesPage() {
    // MOCK DATA
    const MOCK_INVOICES = [
        {
            id: "inv-001",
            invoice_number: "INV-2024-001",
            user_id: "mock-user-123",
            amount: 15450,
            gst: 2781,
            total: 18231,
            status: "paid",
            date: "2024-01-15",
            description: "Annual Gold Plan Subscription",
            plan_name: "Gold Family Protection",
            plan_id: "PLAN-GOLD-001",
            payment_method: "UPI",
            transaction_id: "TXN123456789",
            created_at: new Date().toISOString()
        },
        {
            id: "inv-002",
            invoice_number: "INV-2023-156",
            user_id: "mock-user-123",
            amount: 2500,
            gst: 450,
            total: 2950,
            status: "paid",
            date: "2023-12-10",
            description: "Medicine Order #12345",
            plan_name: "Medicine Subscription",
            plan_id: "MED-SUB-001",
            payment_method: "Card",
            transaction_id: "TXN987654321",
            created_at: new Date().toISOString()
        }
    ];

    return <InvoicesView invoices={MOCK_INVOICES} />;
}
