'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Loader2, Check, ExternalLink, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    action_url: string | null;
    action_label: string | null;
    priority: string;
    created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
    general: 'bg-slate-100 text-slate-700 border-slate-200',
    reimbursement: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    withdrawal: 'bg-amber-100 text-amber-700 border-amber-200',
    plan: 'bg-blue-100 text-blue-700 border-blue-200',
    service: 'bg-purple-100 text-purple-700 border-purple-200',
    system: 'bg-red-100 text-red-700 border-red-200',
    promotional: 'bg-pink-100 text-pink-700 border-pink-200',
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const supabase = createClient();

    const loadNotifications = async () => {
        setLoading(true);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        // Get profile to find recipient_id
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (!profile) {
            setLoading(false);
            return;
        }

        let query = supabase
            .from('notifications')
            .select('*')
            .eq('recipient_id', profile.id)
            .order('created_at', { ascending: false });

        if (filter === 'unread') {
            query = query.eq('is_read', false);
        } else if (filter !== 'all') {
            query = query.eq('type', filter);
        }

        const { data, error } = await query;

        if (!error && data) {
            setNotifications(data);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadNotifications();
    }, [filter]);

    const markAsRead = async (notificationId: string) => {
        await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', notificationId);

        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
    };

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (!profile) return;

        await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('recipient_id', profile.id)
            .eq('is_read', false);

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        toast.success('All notifications marked as read');
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Bell className="h-8 w-8 text-teal-600" />
                        Notifications
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Stay updated with your account activity.</p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="outline" onClick={markAllAsRead} className="border-teal-200 text-teal-700 hover:bg-teal-50">
                        <Check className="mr-2 h-4 w-4" /> Mark all as read
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="bg-slate-100 border border-slate-200">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">
                        All
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">
                        Unread ({unreadCount})
                    </TabsTrigger>
                    <TabsTrigger value="reimbursement" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">
                        Reimbursements
                    </TabsTrigger>
                    <TabsTrigger value="withdrawal" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">
                        Withdrawals
                    </TabsTrigger>
                    <TabsTrigger value="plan" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">
                        Plans
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Notifications List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <Bell className="h-10 w-10 opacity-20 mb-2" />
                        <p>No notifications found.</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <Card 
                            key={notif.id} 
                            className={`bg-white border-slate-200 shadow-sm transition-all ${!notif.is_read ? 'border-l-4 border-l-teal-500 bg-teal-50/30' : ''}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-bold ${!notif.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {notif.title}
                                            </h3>
                                            <Badge className={`text-xs border ${TYPE_COLORS[notif.type] || TYPE_COLORS.general}`}>
                                                {notif.type}
                                            </Badge>
                                            {notif.priority === 'urgent' && (
                                                <Badge className="text-xs bg-red-500 text-white">
                                                    Urgent
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2">{notif.message}</p>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-slate-500">{formatTime(notif.created_at)}</span>
                                            {notif.is_read && (
                                                <Badge variant="outline" className="text-xs text-slate-400">
                                                    <Check className="h-3 w-3 mr-1" /> Read
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {!notif.is_read && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => markAsRead(notif.id)}
                                                className="text-teal-600 hover:text-teal-700"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {notif.action_url && (
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                asChild
                                                className="border-teal-200 text-teal-700 hover:bg-teal-50"
                                            >
                                                <a href={notif.action_url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
