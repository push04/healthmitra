'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PhoneCall, BarChart3, LogOut, Menu, X, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NAV = [
    { icon: LayoutDashboard, label: 'My Dashboard', href: '/call-centre/dashboard' },
    { icon: PhoneCall, label: 'All Requests', href: '/call-centre/requests' },
    { icon: BarChart3, label: 'Reports', href: '/call-centre/reports' },
];

export default function CallCentreLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    if (pathname === '/call-centre/login') return <>{children}</>;

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 border-r border-slate-200 bg-white flex-col">
                <div className="p-5 border-b border-slate-200">
                    <Link href="/call-centre/dashboard" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                            <Headphones className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-slate-800">Call Centre</span>
                    </Link>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                    {NAV.map(n => (
                        <Link key={n.href} href={n.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${pathname === n.href ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                            <n.icon className="h-4 w-4" />{n.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-3 border-t border-slate-200">
                    <Link href="/call-centre/login">
                        <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-red-600"><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
                    </Link>
                </div>
            </aside>

            {/* Mobile */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                <Link href="/call-centre/dashboard" className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center"><Headphones className="h-3.5 w-3.5 text-white" /></div>
                    <span className="text-base font-bold text-slate-800">Call Centre</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
            </div>
            {open && (
                <div className="md:hidden fixed inset-0 z-40 bg-white pt-16">
                    <nav className="p-4 space-y-1">
                        {NAV.map(n => (
                            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm ${pathname === n.href ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600'}`}>
                                <n.icon className="h-4 w-4" />{n.label}
                            </Link>
                        ))}
                        <Link href="/call-centre/login" className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-red-500"><LogOut className="h-4 w-4" /> Logout</Link>
                    </nav>
                </div>
            )}

            <main className="flex-1 overflow-y-auto md:pt-0 pt-16">
                <div className="max-w-6xl mx-auto p-6">{children}</div>
            </main>
        </div>
    );
}
