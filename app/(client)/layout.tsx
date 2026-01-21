import { Sidebar } from "@/components/client/Sidebar";
import { BottomNav } from "@/components/client/BottomNav";
import { DashboardHeader } from "@/components/client/DashboardHeader";

export default async function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // MOCK USER DATA for Demo
    const userData = {
        name: 'Test User',
        email: 'test@healthmitra.com',
        avatar: undefined
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
