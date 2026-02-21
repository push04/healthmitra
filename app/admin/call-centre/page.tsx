'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Search, Loader2, PhoneCall, Users, UserCheck, Clock, AlertTriangle, CheckCircle, Eye
} from 'lucide-react';
import { ServiceRequest, Agent } from '@/types/service-requests';
import { getCallCentreRequests, getAgents, assignRequestToAgent } from '@/app/actions/callcentre';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    assigned: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-cyan-100 text-cyan-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-slate-100 text-slate-500',
};

const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
};

const AGENT_STATUS: Record<string, string> = {
    available: 'bg-emerald-100 text-emerald-700',
    busy: 'bg-amber-100 text-amber-700',
    offline: 'bg-slate-100 text-slate-500',
};

export default function AdminCallCentrePage() {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, inProgress: 0, completed: 0 });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [agentFilter, setAgentFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [reqRes, agentRes] = await Promise.all([
                getCallCentreRequests({ query: search, status: statusFilter, agentId: agentFilter }),
                getAgents()
            ]);
            if (reqRes.success) { setRequests(reqRes.data || []); setStats(reqRes.stats || { total: 0, pending: 0, assigned: 0, inProgress: 0, completed: 0 }); }
            if (agentRes.success) setAgents(agentRes.data);
            setLoading(false);
        };
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [search, statusFilter, agentFilter]);

    const handleAssign = async (requestId: string, agentId: string) => {
        const res = await assignRequestToAgent(requestId, agentId);
        if (res.success) toast.success(res.message);
    };

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Call Centre Management</h1>
                <p className="text-slate-500 text-sm">Manage agents, assign service requests, and track progress.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Total', value: stats.total, icon: PhoneCall, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                    { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-amber-50 border-amber-200 text-amber-700' },
                    { label: 'Assigned', value: stats.assigned, icon: UserCheck, color: 'bg-cyan-50 border-cyan-200 text-cyan-700' },
                    { label: 'In Progress', value: stats.inProgress, icon: AlertTriangle, color: 'bg-orange-50 border-orange-200 text-orange-700' },
                    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                ].map(s => (
                    <div key={s.label} className={`p-4 rounded-xl border ${s.color} shadow-sm`}>
                        <div className="flex items-center justify-between">
                            <div><div className="text-2xl font-bold">{s.value}</div><div className="text-xs uppercase tracking-wider opacity-70">{s.label}</div></div>
                            <s.icon className="h-5 w-5 opacity-40" />
                        </div>
                    </div>
                ))}
            </div>

            <Tabs defaultValue="requests">
                <TabsList className="bg-slate-100 border border-slate-200">
                    <TabsTrigger value="requests" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Service Requests</TabsTrigger>
                    <TabsTrigger value="agents" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Agents ({agents.length})</TabsTrigger>
                </TabsList>

                {/* Requests Tab */}
                <TabsContent value="requests" className="mt-6 space-y-4">
                    <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search by customer name or email..." className="pl-9 bg-white border-slate-200 text-slate-900" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px] bg-white border-slate-200 text-slate-700"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 text-slate-700">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={agentFilter} onValueChange={setAgentFilter}>
                            <SelectTrigger className="w-[160px] bg-white border-slate-200 text-slate-700"><SelectValue placeholder="Agent" /></SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 text-slate-700">
                                <SelectItem value="all">All Agents</SelectItem>
                                {agents.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-teal-500" /></div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 border-slate-200">
                                        <TableHead className="text-slate-600 font-semibold">SR #</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Customer</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Type</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Priority</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Assigned To</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Requested</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Assign</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map(sr => (
                                        <TableRow key={sr.id} className="border-slate-100 hover:bg-slate-50/50">
                                            <TableCell className="font-mono text-xs text-slate-500">{sr.requestId}</TableCell>
                                            <TableCell>
                                                <p className="text-sm font-medium text-slate-800">{sr.customerName}</p>
                                                <p className="text-xs text-slate-400">{sr.customerContact}</p>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 capitalize">{sr.type.replace(/_/g, ' ')}</TableCell>
                                            <TableCell><Badge className={`text-xs ${sr.priority ? PRIORITY_COLORS[sr.priority] : ''}`}>{sr.priority || 'medium'}</Badge></TableCell>
                                            <TableCell><Badge className={`text-xs ${STATUS_COLORS[sr.status]}`}>{sr.status.replace(/_/g, ' ')}</Badge></TableCell>
                                            <TableCell className="text-sm text-slate-600">{sr.assignedToName || <span className="text-slate-400">Unassigned</span>}</TableCell>
                                            <TableCell className="text-xs text-slate-500">{fmt(sr.requestedAt)}</TableCell>
                                            <TableCell>
                                                {!sr.assignedToId && (
                                                    <Select onValueChange={v => handleAssign(sr.id, v)}>
                                                        <SelectTrigger className="w-[130px] h-8 text-xs bg-white border-slate-200"><SelectValue placeholder="Assign..." /></SelectTrigger>
                                                        <SelectContent className="bg-white border-slate-200 text-slate-700">
                                                            {agents.filter(a => a.status !== 'offline').map(a => (
                                                                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </TabsContent>

                {/* Agents Tab */}
                <TabsContent value="agents" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {agents.map((a: any) => (
                            <Card key={a.id} className="bg-white border-slate-200 shadow-sm">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="font-medium text-slate-800">{a.name}</p>
                                            <p className="text-xs text-slate-400">{a.email}</p>
                                        </div>
                                        <Badge className={`text-xs ${AGENT_STATUS[a.status]}`}>{a.status}</Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-2 bg-slate-50 rounded-lg text-center">
                                            <p className="text-lg font-bold text-slate-800">{a.assignedCount}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400">Assigned</p>
                                        </div>
                                        <div className="p-2 bg-emerald-50 rounded-lg text-center">
                                            <p className="text-lg font-bold text-emerald-700">{a.completedCount}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400">Completed</p>
                                        </div>
                                        <div className="p-2 bg-amber-50 rounded-lg text-center">
                                            <p className="text-lg font-bold text-amber-700">{a.assignedCount - a.completedCount}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400">Active</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
