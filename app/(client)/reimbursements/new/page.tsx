import ClaimForm from "@/components/client/reimbursements/ClaimForm";

export default async function NewReimbursementPage() {
    // MOCK PROFILE
    const MOCK_PROFILE = {
        id: "mock-user-123",
        full_name: "Test User",
        email: "test@example.com",
        phone: "+91 98765 43210"
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">New Reimbursement</h1>
                <p className="text-slate-500">Submit a new insurance claim for your recent treatments</p>
            </div>
            <ClaimForm userProfile={MOCK_PROFILE} />
        </div>
    );
}
