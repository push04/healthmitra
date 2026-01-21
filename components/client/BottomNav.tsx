"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Stethoscope, CreditCard, Wallet, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: Stethoscope, label: 'Services', href: '/service-requests' },
    { icon: CreditCard, label: 'Cards', href: '/e-cards' },
    { icon: Wallet, label: 'Wallet', href: '/wallet' },
    { icon: User, label: 'Profile', href: '/profile' }
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-around border-t border-slate-200 bg-white md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center w-full h-full space-y-1",
                            isActive ? "text-teal-600" : "text-slate-400"
                        )}
                        style={{
                            paddingBottom: "env(safe-area-inset-bottom)"
                        }}
                    >
                        <Icon
                            className={cn(
                                "size-6 transition-transform duration-200",
                                isActive && "scale-110"
                            )}
                        />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
