'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, FileText, Users, History, LogOut, Building2, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const franchiseNav = [
    { href: '/franchise/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/franchise/service-requests', label: 'Service Requests', icon: FileText },
    { href: '/franchise/partners', label: 'Partners', icon: Users },
    { href: '/franchise/history', label: 'Activity History', icon: History },
];

export default function FranchiseLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (pathname === '/franchise/login') {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200 flex-col">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-teal-600" />
                        <span className="text-lg font-bold text-slate-900">Franchise Portal</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">HealthMitra Partner</p>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {franchiseNav.map(item => (
                        <Link key={item.href} href={item.href}>
                            <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${pathname === item.href
                                    ? 'bg-teal-50 text-teal-700 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}>
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </button>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-200">
                    <Link href="/franchise/login">
                        <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50">
                            <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                    </Link>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-teal-600" />
                        <span className="font-bold text-slate-900">Franchise Portal</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </header>
                {sidebarOpen && (
                    <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-1">
                        {franchiseNav.map(item => (
                            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                                <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${pathname === item.href ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-slate-50'
                                    }`}>
                                    <item.icon className="h-4 w-4" /> {item.label}
                                </button>
                            </Link>
                        ))}
                        <Link href="/franchise/login">
                            <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-red-600 mt-2" onClick={() => setSidebarOpen(false)}>
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </Button>
                        </Link>
                    </div>
                )}
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
