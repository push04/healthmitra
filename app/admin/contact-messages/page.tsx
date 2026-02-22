'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Loader2, Mail, Phone, Eye, Check, X, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface ContactMessage {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: string;
    admin_notes?: string;
    created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    read: 'bg-blue-100 text-blue-700 border-blue-200',
    replied: 'bg-purple-100 text-purple-700 border-purple-200',
    resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function ContactMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [replyModal, setReplyModal] = useState(false);
    const [replyNotes, setReplyNotes] = useState('');

    const loadMessages = async () => {
        setLoading(true);
        const supabase = createClient();
        
        let query = supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,subject.ilike.%${search}%`);
        }

        const { data, error } = await query;

        if (!error && data) {
            setMessages(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        const timeout = setTimeout(loadMessages, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    const handleView = async (msg: ContactMessage) => {
        setSelectedMessage(msg);
        
        // Mark as read if pending
        if (msg.status === 'pending') {
            const supabase = createClient();
            await supabase
                .from('contact_messages')
                .update({ status: 'read', updated_at: new Date().toISOString() })
                .eq('id', msg.id);
            
            setMessages(prev => prev.map(m => 
                m.id === msg.id ? { ...m, status: 'read' } : m
            ));
        }
    };

    const handleUpdateStatus = async (status: string) => {
        if (!selectedMessage) return;
        
        const supabase = createClient();
        const { error } = await supabase
            .from('contact_messages')
            .update({ status, admin_notes: replyNotes, updated_at: new Date().toISOString() })
            .eq('id', selectedMessage.id);

        if (!error) {
            setMessages(prev => prev.map(m => 
                m.id === selectedMessage.id ? { ...m, status, admin_notes: replyNotes } : m
            ));
            toast.success(`Message marked as ${status}`);
            setReplyModal(false);
            setReplyNotes('');
            setSelectedMessage(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        Contact Messages
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">View and manage customer inquiries from contact form.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Total</p>
                                <h3 className="text-2xl font-bold text-slate-900">{messages.length}</h3>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-full">
                                <Mail className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Pending</p>
                                <h3 className="text-2xl font-bold text-amber-600">{messages.filter(m => m.status === 'pending').length}</h3>
                            </div>
                            <div className="bg-amber-50 p-3 rounded-full">
                                <MessageSquare className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Read</p>
                                <h3 className="text-2xl font-bold text-blue-600">{messages.filter(m => m.status === 'read').length}</h3>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-full">
                                <Eye className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Resolved</p>
                                <h3 className="text-2xl font-bold text-emerald-600">{messages.filter(m => m.status === 'resolved').length}</h3>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-full">
                                <Check className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name, email, or subject..."
                        className="pl-9 bg-white border-slate-200 text-slate-900"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Messages List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <Mail className="h-10 w-10 opacity-20 mb-2" />
                        <p>No messages found.</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <Card key={msg.id} className={`bg-white border-slate-200 shadow-sm hover:shadow-md transition-all ${msg.status === 'pending' ? 'border-l-4 border-l-amber-400' : ''}`}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-slate-900">{msg.name}</h3>
                                            <Badge className={`text-xs border ${STATUS_COLORS[msg.status]}`}>
                                                {msg.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-medium text-slate-800 mb-1">{msg.subject}</p>
                                        <p className="text-sm text-slate-600 line-clamp-2">{msg.message}</p>
                                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" /> {msg.email}
                                            </span>
                                            {msg.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> {msg.phone}
                                                </span>
                                            )}
                                            <span>{formatDate(msg.created_at)}</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => handleView(msg)} className="border-slate-200 hover:bg-slate-50">
                                        <Eye className="h-4 w-4 mr-1" /> View
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* View/Reply Modal */}
            <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl">
                    {selectedMessage && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-teal-600" />
                                    Message from {selectedMessage.name}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">Email:</span>
                                        <p className="font-medium">{selectedMessage.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Phone:</span>
                                        <p className="font-medium">{selectedMessage.phone || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-slate-500">Subject:</span>
                                        <p className="font-medium">{selectedMessage.subject}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-slate-500">Message:</span>
                                        <p className="font-medium bg-slate-50 p-3 rounded-lg mt-1">{selectedMessage.message}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-slate-500">Received:</span>
                                        <p className="font-medium">{formatDate(selectedMessage.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setSelectedMessage(null)}>Close</Button>
                                {selectedMessage.status !== 'resolved' && (
                                    <Button variant="outline" onClick={() => setReplyModal(true)} className="border-teal-200 text-teal-700 hover:bg-teal-50">
                                        Mark as Resolved
                                    </Button>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Resolve Modal */}
            <Dialog open={replyModal} onOpenChange={setReplyModal}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md">
                    <DialogHeader>
                        <DialogTitle>Resolve Message</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Internal Notes (Optional)</Label>
                            <Textarea 
                                value={replyNotes} 
                                onChange={e => setReplyNotes(e.target.value)}
                                placeholder="Add notes about how this was handled..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setReplyModal(false)}>Cancel</Button>
                        <Button onClick={() => handleUpdateStatus('resolved')} className="bg-emerald-600 hover:bg-emerald-700">
                            Mark as Resolved
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

import { Label } from '@/components/ui/label';
