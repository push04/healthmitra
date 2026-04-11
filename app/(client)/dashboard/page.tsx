import { DashboardView } from "@/components/client/DashboardView";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { fetchDashboardData } from "@/app/actions/fetch-dashboard";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect('/login');
    }

    // Check if admin and redirect
    const adminClient = await createAdminClient();
    const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
    
    if (profile?.role === 'admin') {
        redirect('/admin/dashboard');
    }

    // Fetch dashboard data server-side for initial render
    const dashboardResult = await fetchDashboardData();
    const initialData = dashboardResult.success ? dashboardResult.data : undefined;

    return <DashboardView initialData={initialData} />;
}
