import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <AdminHeader />

            <div className="flex pt-16 h-[calc(100vh)]">
                <AdminSidebar />

                <main className="flex-1 overflow-y-auto px-6 pb-24 pt-8 md:pl-80 md:pr-12 md:pt-10">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
