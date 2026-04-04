import { DashboardView } from "@/components/client/DashboardView";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const supabase = await createClient();

    // If admin lands here, redirect to admin dashboard
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role === 'admin') {
            redirect('/admin/dashboard');
        }
    }

    // Data is fetched client-side via useDashboard hook
    return <DashboardView />;
}
