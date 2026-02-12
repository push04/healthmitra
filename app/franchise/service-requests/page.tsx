'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Loader2, Clock, Filter } from 'lucide-react';
import { AdminServiceRequest } from '@/app/lib/mock/service-requests-data';
import { getAdminServiceRequests } from '@/app/actions/service-requests';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700', assigned: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-indigo-100 text-indigo-700', completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-slate-100 text-slate-500',
};

const TYPE_LABELS: Record<string, string> = {
    medical_consultation: 'Consultation', diagnostic: 'Diagnostic', medicine: 'Medicine',
    ambulance: 'Ambulance', caretaker: 'Caretaker', nursing: 'Nursing', other: 'Other',
};

export default function FranchiseServiceRequestsPage() {
    const [requests, setRequests] = useState<AdminServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const res = await getAdminServiceRequests({ query: search, status: statusFilter });
            if (res.success) setRequests(res.data);
            setLoading(false);
        };
        const timeout = setTimeout(fetch, 300);
        return () => clearTimeout(timeout);
    }, [search, statusFilter]);

    const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    return (
        <div className="space-y-6 animate-in fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Service Requests</h1>
                <p className="text-slate-500 text-sm">View and track service requests for your franchise area.</p>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 shadow-sm">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search..." className="pl-9 bg-white border-slate-200 text-slate-900" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] bg-white border-slate-200 text-slate-700"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-teal-500" /></div>
                ) : requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <Filter className="h-10 w-10 opacity-20 mb-2" /><p>No service requests found.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 border-slate-200">
                                <TableHead className="text-slate-600 font-semibold">No.</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Customer</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Type</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Assigned To</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Requested At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map(req => (
                                <TableRow key={req.id} className="border-slate-100 hover:bg-slate-50/50">
                                    <TableCell className="font-mono text-xs text-slate-500">#{req.requestNo}</TableCell>
                                    <TableCell>
                                        <div><p className="font-medium text-slate-800">{req.customerName}</p><p className="text-xs text-slate-400">{req.customerContact}</p></div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">{TYPE_LABELS[req.type]}</TableCell>
                                    <TableCell><Badge className={`text-xs ${STATUS_COLORS[req.status]}`}>{req.status.replace('_', ' ')}</Badge></TableCell>
                                    <TableCell className="text-sm text-slate-600">{req.assignedTo?.name || <span className="text-xs text-slate-400 italic">Unassigned</span>}</TableCell>
                                    <TableCell className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(req.requestedAt)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
