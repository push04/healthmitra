'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Search, Loader2, PhoneCall, Users, UserCheck, Clock, AlertTriangle, CheckCircle, Eye, Plus, Phone, Mail
} from 'lucide-react';
import { ServiceRequest, Agent } from '@/types/service-requests';
import { getCallCentreRequests, getAgents, assignRequestToAgent, getCallCentreStats, createAgent } from '@/app/actions/callcentre';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    assigned: 'bg-blue-100 text-blue-700 border-blue-200',
    in_progress: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-slate-100 text-slate-600 border-slate-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    urgent: 'bg-red-100 text-red-700 border-red-200',
};

export default function AdminCallCentrePage() {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, inProgress: 0, completed: 0 });
    const [dashboardStats, setDashboardStats] = useState({ totalRequests: 0, pendingRequests: 0, completedToday: 0, activeAgents: 0, totalAgents: 0 });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [agentFilter, setAgentFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
    const [newAgent, setNewAgent] = useState({ name: '', email: '', phone: '', role: 'agent' });
    const [creatingAgent, setCreatingAgent] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [reqRes, agentRes, statsRes] = await Promise.all([
                getCallCentreRequests({ query: search, status: statusFilter, agentId: agentFilter }),
                getAgents(),
                getCallCentreStats()
            ]);
            if (reqRes.success) { setRequests(reqRes.data || []); setStats(reqRes.stats || { total: 0, pending: 0, assigned: 0, inProgress: 0, completed: 0 }); }
            if (agentRes.success) setAgents(agentRes.data);
            if (statsRes.success && statsRes.data) setDashboardStats(statsRes.data);
            setLoading(false);
        };
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [search, statusFilter, agentFilter]);

    const handleAssign = async (requestId: string, agentId: string) => {
        const res = await assignRequestToAgent(requestId, agentId);
        if (res.success) {
            toast.success(res.message);
            const reqRes = await getCallCentreRequests({ query: search, status: statusFilter, agentId: agentFilter });
            if (reqRes.success) setRequests(reqRes.data || []);
        }
    };

    const handleCreateAgent = async () => {
        if (!newAgent.name || !newAgent.email) {
            toast.error('Please fill in all required fields');
            return;
        }
        setCreatingAgent(true);
        const res = await createAgent(newAgent);
        setCreatingAgent(false);
        if (res.success) {
            toast.success(res.message);
            setIsAddAgentOpen(false);
            setNewAgent({ name: '', email: '', phone: '', role: 'agent' });
            const agentRes = await getAgents();
            if (agentRes.success) setAgents(agentRes.data);
        } else {
            toast.error(res.error || 'Failed to create agent');
        }
    };

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Call Centre Management</h1>
                    <p className="text-slate-500 text-sm">Manage agents, assign service requests, and track performance.</p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setIsAddAgentOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Agent
                </Button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Total Requests</p>
                                <h3 className="text-2xl font-bold text-slate-900">{dashboardStats.totalRequests}</h3>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-full">
                                <PhoneCall className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Pending</p>
                                <h3 className="text-2xl font-bold text-amber-600">{dashboardStats.pendingRequests}</h3>
                            </div>
                            <div className="bg-amber-50 p-3 rounded-full">
                                <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Completed Today</p>
                                <h3 className="text-2xl font-bold text-emerald-600">{dashboardStats.completedToday}</h3>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-full">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Active Agents</p>
                                <h3 className="text-2xl font-bold text-teal-600">{dashboardStats.activeAgents}</h3>
                            </div>
                            <div className="bg-teal-50 p-3 rounded-full">
                                <UserCheck className="h-6 w-6 text-teal-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Total Agents</p>
                                <h3 className="text-2xl font-bold text-slate-900">{dashboardStats.totalAgents}</h3>
                            </div>
                            <div className="bg-slate-100 p-3 rounded-full">
                                <Users className="h-6 w-6 text-slate-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="requests">
                <TabsList className="bg-slate-100 border border-slate-200">
                    <TabsTrigger value="requests" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Service Requests</TabsTrigger>
                    <TabsTrigger value="agents" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Agents</TabsTrigger>
                </TabsList>

                {/* Requests Tab */}
                <TabsContent value="requests" className="mt-6 space-y-4">
                    <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search by customer name, email, or SR number..." className="pl-9 bg-white border-slate-200 text-slate-900" value={search} onChange={e => setSearch(e.target.value)} />
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
                        ) : requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                                <PhoneCall className="h-10 w-10 opacity-20 mb-2" />
                                <p>No service requests found.</p>
                            </div>
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
                                            <TableCell><Badge className={`text-xs border ${PRIORITY_COLORS[sr.priority || 'medium']}`}>{sr.priority || 'medium'}</Badge></TableCell>
                                            <TableCell><Badge className={`text-xs border ${STATUS_COLORS[sr.status]}`}>{sr.status.replace(/_/g, ' ')}</Badge></TableCell>
                                            <TableCell className="text-sm text-slate-600">{sr.assignedToName || <span className="text-slate-400 italic">Unassigned</span>}</TableCell>
                                            <TableCell className="text-xs text-slate-500">{fmt(sr.requestedAt)}</TableCell>
                                            <TableCell>
                                                {!sr.assignedToId ? (
                                                    <Select onValueChange={v => handleAssign(sr.id, v)}>
                                                        <SelectTrigger className="w-[130px] h-8 text-xs bg-white border-slate-200"><SelectValue placeholder="Assign..." /></SelectTrigger>
                                                        <SelectContent className="bg-white border-slate-200 text-slate-700">
                                                            {agents.filter(a => a.status !== 'offline').map(a => (
                                                                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs text-slate-400">Assigned</Badge>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {agents.map((a: any) => (
                            <Card key={a.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                                                <span className="text-teal-700 font-semibold">{a.name?.charAt(0) || 'A'}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{a.name || 'Unknown'}</p>
                                                <p className="text-xs text-slate-400 capitalize">{a.role || 'agent'}</p>
                                            </div>
                                        </div>
                                        <Badge className={`text-xs ${a.status === 'available' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                            {a.status || 'available'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Mail className="h-4 w-4 text-slate-400" />
                                            <span className="truncate">{a.email || 'No email'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Phone className="h-4 w-4 text-slate-400" />
                                            <span>{a.phone || 'No phone'}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-slate-800">{stats.assigned}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400">Assigned</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-emerald-600">{stats.completed}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-400">Completed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Add Agent Modal */}
            <Dialog open={isAddAgentOpen} onOpenChange={setIsAddAgentOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Agent</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Full Name *</Label>
                            <Input 
                                value={newAgent.name} 
                                onChange={e => setNewAgent({...newAgent, name: e.target.value})}
                                placeholder="Enter agent name" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input 
                                type="email"
                                value={newAgent.email} 
                                onChange={e => setNewAgent({...newAgent, email: e.target.value})}
                                placeholder="agent@healthmitra.com" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input 
                                value={newAgent.phone} 
                                onChange={e => setNewAgent({...newAgent, phone: e.target.value})}
                                placeholder="+91 98765 43210" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={newAgent.role} onValueChange={v => setNewAgent({...newAgent, role: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="agent">Agent</SelectItem>
                                    <SelectItem value="supervisor">Supervisor</SelectItem>
                                    <SelectItem value="team_leader">Team Leader</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddAgentOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateAgent} disabled={creatingAgent} className="bg-teal-600 hover:bg-teal-700">
                            {creatingAgent ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Create Agent
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
