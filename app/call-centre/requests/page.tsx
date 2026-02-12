'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Loader2 } from 'lucide-react';
import { getCallCentreRequests } from '@/app/actions/callcentre';
import { AdminServiceRequest, MOCK_AGENTS } from '@/app/lib/mock/service-requests-data';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700', assigned: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-cyan-100 text-cyan-700', completed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-slate-100 text-slate-500',
};
const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600', medium: 'bg-amber-100 text-amber-700',
    high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700',
};

export default function AllRequestsPage() {
    const [requests, setRequests] = useState<AdminServiceRequest[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [agentFilter, setAgentFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await getCallCentreRequests({ query: search, status: statusFilter, agentId: agentFilter });
            if (res.success) setRequests(res.data);
            setLoading(false);
        };
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [search, statusFilter, agentFilter]);

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="space-y-6 animate-in fade-in">
            <div><h1 className="text-2xl font-bold text-slate-900">All Service Requests</h1><p className="text-slate-500 text-sm">View all service requests across the call centre.</p></div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search by customer name or email..." className="pl-9 bg-white border-slate-200 text-slate-900" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-white border-slate-200 text-slate-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={agentFilter} onValueChange={setAgentFilter}>
                    <SelectTrigger className="w-[160px] bg-white border-slate-200 text-slate-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                        <SelectItem value="all">All Agents</SelectItem>
                        {MOCK_AGENTS.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
                ) : (
                    <Table>
                        <TableHeader><TableRow className="bg-slate-50 border-slate-200">
                            <TableHead className="text-slate-600 font-semibold">SR #</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Customer</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Contact</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Type</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Priority</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Agent</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Requested</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {requests.length === 0 ? (
                                <TableRow><TableCell colSpan={8} className="text-center py-8 text-slate-400">No requests found.</TableCell></TableRow>
                            ) : requests.map(sr => (
                                <TableRow key={sr.id} className="border-slate-100 hover:bg-slate-50/50">
                                    <TableCell className="font-mono text-xs text-slate-500">{sr.requestNo}</TableCell>
                                    <TableCell className="text-sm font-medium text-slate-800">{sr.customerName}</TableCell>
                                    <TableCell>
                                        <p className="text-sm text-slate-700">{sr.customerContact}</p>
                                        <p className="text-xs text-slate-400">{sr.customerEmail}</p>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600 capitalize">{sr.type.replace(/_/g, ' ')}</TableCell>
                                    <TableCell><Badge className={`text-xs ${PRIORITY_COLORS[sr.priority]}`}>{sr.priority}</Badge></TableCell>
                                    <TableCell><Badge className={`text-xs ${STATUS_COLORS[sr.status]}`}>{sr.status.replace(/_/g, ' ')}</Badge></TableCell>
                                    <TableCell className="text-sm text-slate-600">{sr.assignedTo?.name || <span className="text-slate-400">Unassigned</span>}</TableCell>
                                    <TableCell className="text-xs text-slate-500">{fmt(sr.requestedAt)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
