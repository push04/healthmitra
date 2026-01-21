"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Bell,
    Menu,
    User,
    Settings,
    HelpCircle,
    LogOut,
    Stethoscope
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./Sidebar";


interface DashboardHeaderProps {
    user?: {
        name: string;
        email: string;
        avatar?: string;
    } | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const pathname = usePathname();

    const userName = user?.name || "User";
    const userEmail = user?.email || "";
    const userInitials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-lg md:px-6">
            <div className="flex items-center gap-4">
                {/* Mobile Menu */}
                <Sheet>
                    <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                        <Menu className="size-6 text-slate-700" />
                        <span className="sr-only">Toggle menu</span>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <SheetHeader className="border-b border-slate-200 p-4">
                            <SheetTitle className="flex items-center gap-2 text-primary">
                                <Stethoscope className="size-6" />
                                <span>Healthmitra</span>
                            </SheetTitle>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto py-4">
                            <nav className="space-y-1 px-2">
                                {NAV_ITEMS.map((item) => {
                                    const isActive = pathname === item.href;
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 mx-2",
                                                isActive
                                                    ? "bg-teal-50 text-teal-700 border-l-4 border-teal-600"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <Icon className={cn("size-5", isActive ? "text-teal-600" : "text-slate-500")} />
                                            {item.label}
                                            {(item as any).badge && (
                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                                                    {(item as any).badge}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    </SheetContent>
                </Sheet>

                {/* Logo */}
                <Link href="/dashboard" className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold text-slate-800">
                            Health<span className="text-teal-600">mitra</span>
                        </h1>
                    </div>
                    <span className="hidden text-xs text-slate-500 md:block">
                        Your Health, Our Priority
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Welcome Message */}
                <div className="hidden text-right md:block">
                    <p className="text-sm font-medium text-slate-700">
                        Welcome back, <span className="text-teal-700">{userName}!</span>
                    </p>
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-slate-600 hover:bg-slate-100">
                    <Bell className="size-5" />
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9 border border-slate-200">
                                <AvatarImage src={user?.avatar} alt={userName} />
                                <AvatarFallback className="bg-teal-50 text-teal-700">{userInitials}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{userName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {userEmail}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href="/profile">
                            <DropdownMenuItem className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>My Profile</span>
                            </DropdownMenuItem>
                        </Link>
                        <Link href="/settings">
                            <DropdownMenuItem className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                        </Link>
                        <Link href="/support">
                            <DropdownMenuItem className="cursor-pointer">
                                <HelpCircle className="mr-2 h-4 w-4" />
                                <span>Help & Support</span>
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <form action="/auth/signout" method="post">
                            <button type="submit" className="w-full flex items-center">
                                <DropdownMenuItem className="w-full text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </button>
                        </form>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
