'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

export default function CallCentreDashboard() {
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
        if (res.success) {
            toast.success(res.message);
            setIsAddAgentOpen(false);
            setNewAgent({ name: '', email: '', phone: '', role: 'agent' });
            const agentRes = await getAgents();
            if (agentRes.success) setAgents(agentRes.data);
        } else {
            toast.error(res.error || 'Failed to create agent');
        }
        setCreatingAgent(false);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <PhoneCall className="h-8 w-8 text-teal-600" />
                                <div>
                                    <h1 className="text-xl font-bold text-slate-800">Call Centre Management</h1>
                                    <p className="text-xs text-slate-500">Manage service requests and agents</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setIsAddAgentOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Agent
                            </Button>
                            <Link href="/admin/dashboard">
                                <Button variant="ghost" className="text-slate-600">
                                    ← Back to Admin
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                {/* Stats Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">Total Requests</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{dashboardStats.totalRequests}</h3>
                                </div>
                                <div className="bg-teal-50 p-3 rounded-full">
                                    <PhoneCall className="h-6 w-6 text-teal-600" />
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
                                    <h3 className="text-2xl font-bold text-blue-600">{dashboardStats.activeAgents}</h3>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-full">
                                    <UserCheck className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">Total Agents</p>
                                    <h3 className="text-2xl font-bold text-purple-600">{dashboardStats.totalAgents}</h3>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-full">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="requests" className="space-y-4">
                    <TabsList className="bg-white border">
                        <TabsTrigger value="requests">Service Requests</TabsTrigger>
                        <TabsTrigger value="agents">Agents</TabsTrigger>
                    </TabsList>

                    <TabsContent value="requests">
                        {/* Search and Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by request ID..."
                                    className="pl-9 bg-white border-slate-200"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px] bg-white border-slate-200">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="assigned">Assigned</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={agentFilter} onValueChange={setAgentFilter}>
                                <SelectTrigger className="w-[150px] bg-white border-slate-200">
                                    <SelectValue placeholder="Agent" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="all">All Agents</SelectItem>
                                    {agents.map(agent => (
                                        <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Requests Table */}
                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="flex items-center justify-center p-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                                    </div>
                                ) : requests.length === 0 ? (
                                    <div className="text-center p-12">
                                        <PhoneCall className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-500">No service requests found</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50">
                                                <TableHead className="font-semibold">ID</TableHead>
                                                <TableHead className="font-semibold">Type</TableHead>
                                                <TableHead className="font-semibold">Customer</TableHead>
                                                <TableHead className="font-semibold">Status</TableHead>
                                                <TableHead className="font-semibold">Priority</TableHead>
                                                <TableHead className="font-semibold">Assigned To</TableHead>
                                                <TableHead className="font-semibold">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {requests.slice(0, 20).map((req) => (
                                                <TableRow key={req.id} className="hover:bg-slate-50">
                                                    <TableCell className="font-medium">#{req.requestId?.slice(0, 8)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{req.type}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm font-medium">{req.customerName}</p>
                                                        <p className="text-xs text-slate-500">{req.customerEmail}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={STATUS_COLORS[req.status] || 'bg-slate-100'}>
                                                            {req.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={PRIORITY_COLORS[req.priority || 'medium'] || 'bg-slate-100'}>
                                                            {req.priority || 'medium'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {req.assignedToName ? (
                                                            <span className="text-sm">{req.assignedToName}</span>
                                                        ) : (
                                                            <Select onValueChange={(val) => handleAssign(req.id, val)}>
                                                                <SelectTrigger className="w-[140px] h-8">
                                                                    <SelectValue placeholder="Assign..." />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-white">
                                                                    {agents.map(agent => (
                                                                        <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link href={`/admin/service-requests/${req.id}`}>
                                                            <Button variant="ghost" size="sm" className="text-teal-600">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="agents">
                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Agent</TableHead>
                                            <TableHead className="font-semibold">Email</TableHead>
                                            <TableHead className="font-semibold">Phone</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {agents.map((agent) => (
                                            <TableRow key={agent.id} className="hover:bg-slate-50">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                                                            <UserCheck className="h-4 w-4 text-teal-600" />
                                                        </div>
                                                        <span className="font-medium">{agent.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{agent.email}</TableCell>
                                                <TableCell>{agent.phone}</TableCell>
                                                <TableCell>
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                                        {agent.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Add Agent Dialog */}
            <Dialog open={isAddAgentOpen} onOpenChange={setIsAddAgentOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Agent</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Name *</Label>
                            <Input value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})} placeholder="Agent name" />
                        </div>
                        <div>
                            <Label>Email *</Label>
                            <Input type="email" value={newAgent.email} onChange={e => setNewAgent({...newAgent, email: e.target.value})} placeholder="agent@example.com" />
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <Input value={newAgent.phone} onChange={e => setNewAgent({...newAgent, phone: e.target.value})} placeholder="+91 98765 43210" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddAgentOpen(false)}>Cancel</Button>
                        <Button className="bg-teal-600" onClick={handleCreateAgent} disabled={creatingAgent}>
                            {creatingAgent ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Create Agent
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
