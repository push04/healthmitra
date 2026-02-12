'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PhoneCall, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { getAgentAssignedRequests } from '@/app/actions/callcentre';
import { AdminServiceRequest } from '@/app/lib/mock/service-requests-data';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700', assigned: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-cyan-100 text-cyan-700', completed: 'bg-emerald-100 text-emerald-700', cancelled: 'bg-slate-100 text-slate-500',
};
const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600', medium: 'bg-amber-100 text-amber-700',
    high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700',
};

export default function AgentDashboardPage() {
    const [requests, setRequests] = useState<AdminServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Simulating logged-in agent: Priya Sharma (agent_1)
    const agentId = 'agent_1';
    const agentName = 'Priya Sharma';

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await getAgentAssignedRequests(agentId);
            if (res.success) setRequests(res.data);
            setLoading(false);
        };
        load();
    }, []);

    const active = requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled');
    const completed = requests.filter(r => r.status === 'completed');
    const urgent = requests.filter(r => r.priority === 'urgent' || r.priority === 'high');

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="space-y-6 animate-in fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome, {agentName}</h1>
                <p className="text-slate-500 text-sm">Here are your assigned service requests.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Assigned', value: requests.length, icon: PhoneCall, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                    { label: 'Active', value: active.length, icon: Clock, color: 'bg-amber-50 border-amber-200 text-amber-700' },
                    { label: 'Completed', value: completed.length, icon: CheckCircle, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                    { label: 'High/Urgent', value: urgent.length, icon: AlertTriangle, color: 'bg-red-50 border-red-200 text-red-700' },
                ].map(s => (
                    <div key={s.label} className={`p-4 rounded-xl border ${s.color} shadow-sm`}>
                        <div className="flex items-center justify-between">
                            <div><div className="text-2xl font-bold">{s.value}</div><div className="text-xs uppercase tracking-wider opacity-70">{s.label}</div></div>
                            <s.icon className="h-5 w-5 opacity-40" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Assigned Requests Table */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">My Assigned Requests</CardTitle></CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-indigo-500" /></div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-12 text-slate-400"><PhoneCall className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No requests assigned to you yet.</p></div>
                    ) : (
                        <Table>
                            <TableHeader><TableRow className="bg-slate-50 border-slate-200">
                                <TableHead className="text-slate-600 font-semibold">SR #</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Customer</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Contact</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Type</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Priority</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Requested</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Description</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {requests.map(sr => (
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
                                        <TableCell className="text-xs text-slate-500">{fmt(sr.requestedAt)}</TableCell>
                                        <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">{sr.description}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
