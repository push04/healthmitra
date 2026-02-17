import { ServiceRequestForm } from "@/components/client/ServiceRequestForm";
import { Suspense } from "react";
import { getUserProfile } from "@/app/actions/user";

export default async function NewServiceRequestPage() {
    const { data: profile } = await getUserProfile();

    return (
        <div className="container mx-auto max-w-4xl py-6 animate-in fade-in-50">
            <Suspense fallback={<div>Loading form...</div>}>
                <ServiceRequestForm userProfile={profile || {}} />
            </Suspense>
        </div>
    );
}
