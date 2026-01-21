"use client";

import { Notification } from "@/types/dashboard";
import {
    CheckCircle,
    AlertTriangle,
    Info,
    XCircle,
    Bell
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationsPanelProps {
    notifications?: Notification[];
    loading?: boolean;
    onMarkRead?: (id: string) => void;
}

const getNotificationConfig = (type: string) => {
    switch (type) {
        case 'success':
            return {
                icon: CheckCircle,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                border: 'border-l-emerald-500'
            };
        case 'warning':
            return {
                icon: AlertTriangle,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                border: 'border-l-amber-500'
            };
        case 'error':
            return {
                icon: XCircle,
                color: 'text-red-600',
                bg: 'bg-red-50',
                border: 'border-l-red-500'
            };
        case 'info':
        default:
            return {
                icon: Info,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                border: 'border-l-blue-500'
            };
    }
};

export function NotificationsPanel({ notifications = [], loading, onMarkRead }: NotificationsPanelProps) {
    if (loading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm min-h-[400px]">
                <div className="flex justify-between mb-6">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Notifications</h2>
                <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-teal-600 h-auto p-0 hover:bg-transparent">
                    Mark all as read
                </Button>
            </div>

            {!notifications || notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center flex-1">
                    <div className="relative">
                        <Bell className="size-16 text-slate-200" />
                        <CheckCircle className="absolute bottom-0 right-0 size-6 text-green-500 bg-white rounded-full border-2 border-white" />
                    </div>
                    <p className="mt-4 text-lg font-medium text-slate-600">You're all caught up!</p>
                    <p className="text-sm text-slate-400">No new notifications</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notif) => {
                        const { icon: Icon, color, bg, border } = getNotificationConfig(notif.type);

                        return (
                            <div
                                key={notif.id}
                                onClick={() => {
                                    onMarkRead?.(notif.id);
                                    if (notif.relatedUrl) {
                                        // Ensure no incorrect prefixes in the relatedUrl from backend or mock
                                        const url = notif.relatedUrl.replace('/client/', '/');
                                        window.location.href = url;
                                    }
                                }}
                                className={cn(
                                    "relative flex gap-3 rounded-lg border border-slate-100 p-3 transition-all hover:shadow-sm cursor-pointer border-l-4",
                                    border,
                                    notif.isRead ? "bg-white opacity-80" : bg
                                )}
                            >
                                <div className={cn("mt-0.5 shrink-0 rounded-full bg-white/80 p-1", color)}>
                                    <Icon className="size-4" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={cn("text-sm font-medium", notif.isRead ? "text-slate-600" : "text-slate-800")}>
                                            {notif.title}
                                        </h3>
                                        {!notif.isRead && (
                                            <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                                        )}
                                    </div>

                                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                                        {notif.message}
                                    </p>

                                    <p className="mt-1.5 text-[10px] text-slate-400">
                                        {new Date(notif.timestamp).toLocaleString("en-IN", {
                                            hour: "numeric",
                                            minute: "numeric",
                                            day: "numeric",
                                            month: "short"
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
