'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getAllNotificationsAdmin, createNotification, sendBulkNotification } from '@/app/actions/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Loader2, Bell, Send, Users, Check, Trash2, Filter, Mail, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
    id: string;
    recipient_id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    priority: string;
    created_at: string;
    recipient?: { full_name: string };
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

const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-slate-100 text-slate-500',
    normal: 'bg-blue-100 text-blue-500',
    high: 'bg-orange-100 text-orange-500',
    urgent: 'bg-red-100 text-red-500',
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [isSendOpen, setIsSendOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [stats, setStats] = useState({ total: 0, unread: 0 });
    const [newNotification, setNewNotification] = useState({
        title: '',
        message: '',
        type: 'general',
        recipientRole: 'all',
        recipientEmail: ''
    });

    const supabase = createClient();

    const loadNotifications = async () => {
        setLoading(true);
        
        // Use server action to fetch all notifications (bypasses RLS)
        const result = await getAllNotificationsAdmin();
        
        if (result.allNotifs) {
            let filtered = result.allNotifs;
            
            if (search) {
                filtered = filtered.filter((n: any) => 
                    n.title.toLowerCase().includes(search.toLowerCase()) ||
                    n.message.toLowerCase().includes(search.toLowerCase())
                );
            }
            
            if (typeFilter !== 'all') {
                filtered = filtered.filter((n: any) => n.type === typeFilter);
            }
            
            setNotifications(filtered.slice(0, 100));
        }
        
        setStats({ total: result.total || 0, unread: result.unread || 0 });
        setLoading(false);
    };

    useEffect(() => {
        const timeout = setTimeout(loadNotifications, 300);
        return () => clearTimeout(timeout);
    }, [search, typeFilter]);

    const handleSendNotification = async () => {
        if (!newNotification.title || !newNotification.message) {
            toast.error('Please fill in title and message');
            return;
        }

        setSending(true);

        try {
            if (newNotification.recipientRole === 'specific' && newNotification.recipientEmail) {
                // Find user by email and send to specific user
                const { data: profiles } = await supabase.from('profiles').select('id').eq('email', newNotification.recipientEmail).limit(1);
                
                if (profiles && profiles.length > 0) {
                    await createNotification({
                        recipientId: profiles[0].id,
                        title: newNotification.title,
                        message: newNotification.message,
                        type: newNotification.type,
                    });
                    toast.success('Notification sent to specific user');
                } else {
                    toast.error('User not found with that email');
                    setSending(false);
                    return;
                }
            } else {
                // Bulk send using server action
                const { data: { user } } = await supabase.auth.getUser();
                const result = await sendBulkNotification({
                    title: newNotification.title,
                    message: newNotification.message,
                    type: newNotification.type,
                    senderId: user?.id || '',
                    recipientRole: newNotification.recipientRole === 'all' ? undefined : newNotification.recipientRole
                });
                
                if (result.success) {
                    toast.success(`Notification sent to ${result.count} users`);
                } else {
                    toast.error(result.error || 'Failed to send notifications');
                    setSending(false);
                    return;
                }
            }

            setIsSendOpen(false);
            setNewNotification({ title: '', message: '', type: 'general', recipientRole: 'all', recipientEmail: '' });
            loadNotifications();
        } catch (error) {
            toast.error('Failed to send notification');
        }

        setSending(false);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        Notifications
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Send notifications to users and manage messaging.</p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setIsSendOpen(true)}>
                    <Send className="mr-2 h-4 w-4" /> Send Notification
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Total</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-full">
                                <Bell className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Unread</p>
                                <h3 className="text-2xl font-bold text-amber-600">{stats.unread}</h3>
                            </div>
                            <div className="bg-amber-50 p-3 rounded-full">
                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search notifications..."
                        className="pl-9 bg-white border-slate-200 text-slate-900"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px] bg-white border-slate-200 text-slate-700">
                        <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="reimbursement">Reimbursement</SelectItem>
                        <SelectItem value="withdrawal">Withdrawal</SelectItem>
                        <SelectItem value="plan">Plan</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                    </SelectContent>
                </Select>
            </div>

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
                        <Card key={notif.id} className={`bg-white border-slate-200 shadow-sm ${!notif.is_read ? 'border-l-4 border-l-teal-400' : ''}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-slate-900">{notif.title}</h3>
                                            <Badge className={`text-xs border ${TYPE_COLORS[notif.type] || TYPE_COLORS.general}`}>
                                                {notif.type}
                                            </Badge>
                                            {notif.priority !== 'normal' && (
                                                <Badge className={`text-xs ${PRIORITY_COLORS[notif.priority]}`}>
                                                    {notif.priority}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2">{notif.message}</p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Users className="h-3 w-3" /> {notif.recipient?.full_name || 'Unknown'}
                                            </span>
                                            <span>{formatDate(notif.created_at)}</span>
                                            {notif.is_read && (
                                                <Badge variant="outline" className="text-xs text-slate-400">
                                                    <Check className="h-3 w-3 mr-1" /> Read
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Send Notification Modal */}
            <Dialog open={isSendOpen} onOpenChange={setIsSendOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Send Notification</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title *</Label>
                            <Input
                                value={newNotification.title}
                                onChange={e => setNewNotification({...newNotification, title: e.target.value})}
                                placeholder="Enter notification title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Message *</Label>
                            <Textarea
                                value={newNotification.message}
                                onChange={e => setNewNotification({...newNotification, message: e.target.value})}
                                placeholder="Enter notification message"
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={newNotification.type} onValueChange={v => setNewNotification({...newNotification, type: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="general">General</SelectItem>
                                    <SelectItem value="reimbursement">Reimbursement</SelectItem>
                                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                                    <SelectItem value="plan">Plan</SelectItem>
                                    <SelectItem value="service">Service</SelectItem>
                                    <SelectItem value="system">System</SelectItem>
                                    <SelectItem value="promotional">Promotional</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Send To</Label>
                            <Select value={newNotification.recipientRole} onValueChange={v => setNewNotification({...newNotification, recipientRole: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="user">All Customers</SelectItem>
                                    <SelectItem value="agent">Call Centre Agents</SelectItem>
                                    <SelectItem value="specific">Specific Email</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {newNotification.recipientRole === 'specific' && (
                            <div className="space-y-2">
                                <Label>User Email</Label>
                                <Input
                                    type="email"
                                    value={newNotification.recipientEmail}
                                    onChange={e => setNewNotification({...newNotification, recipientEmail: e.target.value})}
                                    placeholder="user@example.com"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsSendOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendNotification} disabled={sending} className="bg-teal-600 hover:bg-teal-700">
                            {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <><Send className="mr-2 h-4 w-4" /> Send</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
