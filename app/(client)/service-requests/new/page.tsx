import { ServiceRequestForm } from "@/components/client/ServiceRequestForm";
import { Suspense } from "react";

export default async function NewServiceRequestPage() {
    // MOCK PROFILE
    const MOCK_PROFILE = {
        id: "mock-user-123",
        full_name: "Test User",
        email: "test@example.com",
        phone: "+91 98765 43210",
        address: "123, Mock Address"
    };

    return (
        <div className="container mx-auto max-w-4xl py-6 animate-in fade-in-50">
            <Suspense fallback={<div>Loading form...</div>}>
                <ServiceRequestForm userProfile={MOCK_PROFILE} />
            </Suspense>
        </div>
    );
}
