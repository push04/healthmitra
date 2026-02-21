'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowLeft, UserCheck, Phone, Mail, Clock, AlertCircle,
    Building2, Loader2, CheckCircle, MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { ServiceRequest } from '@/types/service-requests';
import { getAdminServiceRequest, assignServiceRequest, updateServiceRequestStatus, getAgents } from '@/app/actions/service-requests';
import { Agent } from '@/types/service-requests';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    assigned: 'bg-blue-100 text-blue-700 border-blue-200',
    in_progress: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function ServiceRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [request, setRequest] = useState<ServiceRequest | null>(null);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [resRequest, resAgents] = await Promise.all([
                getAdminServiceRequest(id),
                getAgents()
            ]);

            if (resRequest.success && resRequest.data) {
                setRequest(resRequest.data);
            }
            if (resAgents.success && resAgents.data) {
                setAgents(resAgents.data);
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handleAssign = async () => {
        if (!selectedAgent) return;
        const res = await assignServiceRequest(id, selectedAgent);
        if (res.success) {
            toast.success(res.message);
            setSelectedAgent('');
        }
    };

    const handleStatusChange = async (status: string) => {
        const res = await updateServiceRequestStatus(id, status);
        if (res.success) {
            toast.success(res.message);
        }
    };

    const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
        );
    }

    if (!request) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
                <AlertCircle className="h-12 w-12 mb-4 text-slate-300" />
                <p className="text-lg">Service request not found.</p>
                <Link href="/admin/service-requests"><Button variant="link" className="mt-2">Back to list</Button></Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in py-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/service-requests">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Request #{request.requestId}</h1>
                        <p className="text-sm text-slate-500">{request.description}</p>
                    </div>
                </div>
                <Badge className={`${STATUS_COLORS[request.status]} text-sm border px-3 py-1`}>
                    {request.status.replace('_', ' ').toUpperCase()}
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Customer & Request Info */}
                <div className="md:col-span-2 space-y-6">
                    {/* Customer Details */}
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-slate-700">Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider">Name</p>
                                    <p className="text-sm font-medium text-slate-800 mt-0.5">{request.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider">Email</p>
                                    <div className="flex items-center gap-1 text-sm text-slate-700 mt-0.5">
                                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {request.customerEmail}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider">Contact</p>
                                    <div className="flex items-center gap-1 text-sm text-slate-700 mt-0.5">
                                        <Phone className="h-3.5 w-3.5 text-slate-400" /> {request.customerContact}
                                    </div>
                                </div>
                                {request.franchiseName && (
                                    <div>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider">Franchise</p>
                                        <div className="flex items-center gap-1 text-sm text-slate-700 mt-0.5">
                                            <Building2 className="h-3.5 w-3.5 text-teal-500" /> {request.franchiseName}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-slate-700">Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                        <Clock className="h-4 w-4 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">Requested</p>
                                        <p className="text-xs text-slate-500">{formatDate(request.requestedAt)}</p>
                                    </div>
                                </div>
                                {request.assignedAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <UserCheck className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">Assigned to {request.assignedToName}</p>
                                            <p className="text-xs text-slate-500">{formatDate(request.assignedAt)}</p>
                                        </div>
                                    </div>
                                )}
                                {request.completedAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">Completed</p>
                                            <p className="text-xs text-slate-500">{formatDate(request.completedAt)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-slate-700 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" /> Internal Notes
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {request.notes && <p className="text-sm text-slate-600 mb-3 p-2 bg-slate-50 rounded border border-slate-200">{request.notes}</p>}
                            <Textarea placeholder="Add an internal note..." value={notes} onChange={e => setNotes(e.target.value)} className="bg-white border-slate-200 text-slate-900" />
                            <Button size="sm" className="mt-2 bg-slate-800 text-white hover:bg-slate-700" disabled={!notes} onClick={() => { toast.success('Note added', { description: 'Internal note saved successfully.' }); setNotes(''); }}>Add Note</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Assignment Panel */}
                <div className="space-y-6">
                    {/* Current Agent */}
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-slate-700">Assignment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {request.assignedToId ? (
                                <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                                    <p className="text-xs text-teal-600 uppercase tracking-wider">Currently Assigned</p>
                                    <p className="font-semibold text-teal-800 mt-1">{request.assignedToName || 'Agent'}</p>
                                </div>
                            ) : (
                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-center">
                                    <AlertCircle className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                                    <p className="text-sm text-amber-700 font-medium">Not Assigned</p>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                                    <SelectTrigger className="bg-white border-slate-200 text-slate-900"><SelectValue placeholder="Select agent..." /></SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                                        {agents.filter(a => a.status !== 'offline').map(a => (
                                            <SelectItem key={a.id} value={a.id}>{a.name} ({a.status})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleAssign} disabled={!selectedAgent} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                                    <UserCheck className="mr-2 h-4 w-4" /> Assign
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Status */}
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-slate-700">Update Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {['in_progress', 'completed', 'cancelled'].map(s => (
                                <Button key={s} variant="outline" className="w-full justify-start border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => handleStatusChange(s)}>
                                    {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Quick Info */}
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="pt-6 space-y-3 text-sm">
                            <div className="flex justify-between"><span className="text-slate-400">Type</span><span className="text-slate-700 font-medium">{request.type.replace('_', ' ')}</span></div>
                            <div className="flex justify-between"><span className="text-slate-400">Priority</span><Badge className={`text-xs ${request.priority === 'urgent' ? 'bg-red-100 text-red-700' : request.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>{request.priority}</Badge></div>
                            <div className="flex justify-between"><span className="text-slate-400">Request ID</span><span className="text-slate-700 font-mono text-xs">{request.id}</span></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
