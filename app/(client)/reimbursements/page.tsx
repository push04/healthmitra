import { ReimbursementsView } from "@/components/client/reimbursements/ReimbursementsView";

export default async function ReimbursementsPage() {
    // MOCK CLAIMS DATA
    const MOCK_CLAIMS = [
        {
            id: "clm-001",
            claim_type: "medicine",
            amount: 1500,
            status: "approved",
            description: "Pharmacy expenses for monthly medication",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
        },
        {
            id: "clm-002",
            claim_type: "diagnostic",
            amount: 3500,
            status: "pending",
            description: "Blood test and X-ray at City Hospital",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
        },
        {
            id: "clm-003",
            claim_type: "consultation",
            amount: 800,
            status: "processing",
            description: "Specialist consultation fee",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
        }
    ];

    return <ReimbursementsView initialClaims={MOCK_CLAIMS} />;
}
