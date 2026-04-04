import { DashboardView } from "@/components/client/DashboardView";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const supabase = await createClient();

    // If admin lands here, redirect to admin dashboard
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const adminClient = await createAdminClient();
        const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'admin') {
            redirect('/admin/dashboard');
        }
    }

    // Data is fetched client-side via useDashboard hook
    return <DashboardView />;
}
