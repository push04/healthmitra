import { Sidebar } from "@/components/client/Sidebar";
import { BottomNav } from "@/components/client/BottomNav";
import { DashboardHeader } from "@/components/client/DashboardHeader";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // User data for header
    const userData = {
        name: profile?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar: profile?.avatar_url
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <DashboardHeader user={userData} />

            <div className="flex pt-16 h-[calc(100vh)]">
                <Sidebar />

                <main className="flex-1 overflow-y-auto px-6 pb-24 pt-8 md:pl-80 md:pr-12 md:pt-10">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>

            <BottomNav />
        </div>
    );
}
