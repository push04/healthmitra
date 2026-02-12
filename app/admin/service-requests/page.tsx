'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Search, Loader2, Phone, Mail, UserCheck, Clock, Filter, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { AdminServiceRequest, MOCK_AGENTS, Agent } from '@/app/lib/mock/service-requests-data';
import { getAdminServiceRequests, assignServiceRequest } from '@/app/actions/service-requests';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    assigned: 'bg-blue-100 text-blue-700 border-blue-200',
    in_progress: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-sky-100 text-sky-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
};

const TYPE_LABELS: Record<string, string> = {
    medical_consultation: 'Consultation',
    diagnostic: 'Diagnostic',
    medicine: 'Medicine',
    ambulance: 'Ambulance',
    caretaker: 'Caretaker',
    nursing: 'Nursing',
    other: 'Other',
};

export default function AdminServiceRequestsPage() {
    const [requests, setRequests] = useState<AdminServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, in_progress: 0, completed: 0 });

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [agentFilter, setAgentFilter] = useState('all');

    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<AdminServiceRequest | null>(null);
    const [selectedAgent, setSelectedAgent] = useState('');

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const res = await getAdminServiceRequests({ query: search, status: statusFilter, type: typeFilter, agentId: agentFilter });
            if (res.success) {
                setRequests(res.data);
                setStats(res.stats);
            }
            setLoading(false);
        };
        const timeout = setTimeout(fetch, 300);
        return () => clearTimeout(timeout);
    }, [search, statusFilter, typeFilter, agentFilter]);

    const handleAssign = async () => {
        if (!selectedRequest || !selectedAgent) return;
        const res = await assignServiceRequest(selectedRequest.id, selectedAgent);
        if (res.success) {
            toast.success(res.message);
            setAssignDialogOpen(false);
            setSelectedRequest(null);
            setSelectedAgent('');
        }
    };

    const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Service Requests
                </h1>
                <p className="text-slate-500 text-sm mt-1">Manage all incoming service requests. Assign agents and track status.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: 'bg-slate-50 border-slate-200 text-slate-900' },
                    { label: 'Pending', value: stats.pending, color: 'bg-amber-50 border-amber-200 text-amber-700' },
                    { label: 'Assigned', value: stats.assigned, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                    { label: 'In Progress', value: stats.in_progress, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
                    { label: 'Completed', value: stats.completed, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                ].map(s => (
                    <div key={s.label} className={`p-4 rounded-xl border ${s.color} shadow-sm`}>
                        <div className="text-2xl font-bold">{s.value}</div>
                        <div className="text-xs uppercase tracking-wider opacity-70">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center shadow-sm">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search by name, email, phone..." className="pl-9 bg-white border-slate-200 text-slate-900" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px] bg-white border-slate-200 text-slate-700"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-700">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[140px] bg-white border-slate-200 text-slate-700"><SelectValue placeholder="Type" /></SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-700">
                            <SelectItem value="all">All Types</SelectItem>
                            {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={agentFilter} onValueChange={setAgentFilter}>
                        <SelectTrigger className="w-[150px] bg-white border-slate-200 text-slate-700"><SelectValue placeholder="Agent" /></SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-700">
                            <SelectItem value="all">All Agents</SelectItem>
                            {MOCK_AGENTS.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Report Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <Filter className="h-10 w-10 opacity-20 mb-2" />
                        <p>No service requests found.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 border-slate-200">
                                <TableHead className="text-slate-600 font-semibold">No.</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Name</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Email</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Contact</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Type</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Assigned To</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Requested At</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Assigned At</TableHead>
                                <TableHead className="text-slate-600 font-semibold text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map(req => (
                                <TableRow key={req.id} className="border-slate-100 hover:bg-slate-50/50">
                                    <TableCell className="font-mono text-xs text-slate-500">#{req.requestNo}</TableCell>
                                    <TableCell className="font-medium text-slate-800">{req.customerName}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                            <Mail className="h-3 w-3" /> {req.customerEmail}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                            <Phone className="h-3 w-3" /> {req.customerContact}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`${PRIORITY_COLORS[req.priority]} text-xs`}>
                                            {TYPE_LABELS[req.type]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`${STATUS_COLORS[req.status]} text-xs border`}>
                                            {req.status.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {req.assignedTo ? (
                                            <div className="flex items-center gap-1 text-sm text-slate-700">
                                                <UserCheck className="h-3.5 w-3.5 text-teal-500" />
                                                {req.assignedTo.name}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500">
                                        <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(req.requestedAt)}</div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500">{formatDate(req.assignedAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center gap-1 justify-end">
                                            <Link href={`/admin/service-requests/${req.id}`}>
                                                <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 text-xs">View</Button>
                                            </Link>
                                            {req.status === 'pending' && (
                                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
                                                    onClick={() => { setSelectedRequest(req); setAssignDialogOpen(true); }}>
                                                    Assign
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Assign Dialog */}
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900">Assign Service Request</DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-4 py-2">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                                <p className="font-medium text-slate-800">#{selectedRequest.requestNo} — {selectedRequest.customerName}</p>
                                <p className="text-sm text-slate-500">{selectedRequest.description}</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Select Agent</label>
                                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                                    <SelectTrigger className="bg-white border-slate-200 text-slate-900"><SelectValue placeholder="Choose an agent..." /></SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                                        {MOCK_AGENTS.filter(a => a.status !== 'offline').map(a => (
                                            <SelectItem key={a.id} value={a.id}>
                                                {a.name} {a.status === 'busy' ? '(Busy)' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignDialogOpen(false)} className="border-slate-200 text-slate-600">Cancel</Button>
                        <Button onClick={handleAssign} disabled={!selectedAgent} className="bg-teal-600 hover:bg-teal-700 text-white">
                            <UserCheck className="mr-2 h-4 w-4" /> Assign Agent
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
