import { fetchDashboardData } from "@/lib/api/client";
import { DashboardView } from "@/components/client/DashboardView";

import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
    const supabase = await createClient();
    const response = await fetchDashboardData(supabase);

    if (!response.success) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
                <div className="text-red-500 font-semibold text-lg">Failed to load dashboard data</div>
                <p className="text-slate-500">{response.error || "Please try again later."}</p>
            </div>
        );
    }

    return <DashboardView initialData={response.data} />;
}
