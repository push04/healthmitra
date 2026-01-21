"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Stethoscope,
    ShoppingBag,
    CreditCard,
    Receipt,
    Wallet,
    Folder,
    User,
    HelpCircle,
    LogOut,
    FileText, // Added new icon
    FolderHeart, // Added new icon
    Settings // Added new icon
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: FileText, label: 'Service Requests', href: '/service-requests' },
    { icon: Wallet, label: 'My Wallet', href: '/wallet' },
    { icon: Receipt, label: 'Invoices', href: '/invoices' },
    { icon: FolderHeart, label: 'Health Records', href: '/phr' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: CreditCard, label: 'E-Cards', href: '/e-cards' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: HelpCircle, label: 'Support', href: '/support' }
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 hidden md:flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-all duration-300">
            <div className="flex-1 overflow-y-auto py-6">
                <nav className="space-y-2 px-4">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group relative flex items-center gap-4 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-300",
                                    isActive
                                        ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-200 translate-x-1"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-teal-600 hover:translate-x-1"
                                )}
                            >
                                <Icon className={cn("size-5 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-teal-600")} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 mx-4 mb-4">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-4 text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:translate-x-5 transition-transform duration-500" />
                    <p className="font-bold relative z-10">Premium Member</p>
                    <p className="text-xs text-indigo-100 mt-1 relative z-10">Your health is protected.</p>
                </div>
            </div>

            <div className="border-t border-slate-100 p-4">
                <button className="flex w-full items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-red-600 group">
                    <LogOut className="size-5 group-hover:rotate-12 transition-transform duration-300" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
