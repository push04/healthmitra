'use client';

import { useState, useEffect } from 'react';
import { getCustomers } from '@/app/actions/customers';
import { getPlans } from '@/app/actions/plans';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Plus, Search, Loader2, MoreHorizontal, Eye, CreditCard,
    KeyRound, Users, ShieldCheck, CalendarDays, RefreshCw
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { toast } from 'sonner';
import { assignPlanToCustomer, resetCustomerPassword, generatePassword } from '@/app/actions/customers';

export default function CustomerManagementPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [planFilter, setPlanFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [totalCount, setTotalCount] = useState(0);

    // Assign Plan Dialog
    const [assignOpen, setAssignOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [assignPlanId, setAssignPlanId] = useState('');
    const [assignValidFrom, setAssignValidFrom] = useState(new Date().toISOString().split('T')[0]);
    const [assigning, setAssigning] = useState(false);

    // Reset Password Dialog
    const [resetOpen, setResetOpen] = useState(false);
    const [resetUserId, setResetUserId] = useState('');
    const [resetUserEmail, setResetUserEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [resetting, setResetting] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    useEffect(() => {
        const loadPlans = async () => {
            const res = await getPlans({ status: 'active' });
            if (res.success && res.data) setPlans(res.data);
        };
        loadPlans();
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await getCustomers({
                    query,
                    planId: planFilter !== 'all' ? planFilter : undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                });
                if (res.success && res.data) {
                    setCustomers(res.data);
                    setTotalCount(res.totalCount);
                }
            } catch {
                toast.error('Failed to load customers');
            } finally {
                setLoading(false);
            }
        };
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [query, planFilter, statusFilter]);

    const openAssignPlan = (customer: any) => {
        setSelectedCustomer(customer);
        setAssignPlanId(customer.planId || '');
        setAssignValidFrom(new Date().toISOString().split('T')[0]);
        setAssignOpen(true);
    };

    const handleAssignPlan = async () => {
        if (!assignPlanId) { toast.error('Please select a plan'); return; }
        setAssigning(true);
        try {
            const res = await assignPlanToCustomer(selectedCustomer.id, assignPlanId, assignValidFrom);
            if (res.success) {
                toast.success('Plan assigned successfully');
                setAssignOpen(false);
                // Refresh
                const refreshed = await getCustomers({ query, planId: planFilter !== 'all' ? planFilter : undefined, status: statusFilter !== 'all' ? statusFilter : undefined });
                if (refreshed.success && refreshed.data) setCustomers(refreshed.data);
            } else {
                toast.error(res.error || 'Failed to assign plan');
            }
        } finally {
            setAssigning(false);
        }
    };

    const openResetPassword = (customer: any) => {
        setResetUserId(customer.id);
        setResetUserEmail(customer.email);
        setNewPassword(generatePassword());
        setPasswordVisible(true);
        setResetOpen(true);
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
        setResetting(true);
        try {
            const res = await resetCustomerPassword(resetUserId, newPassword);
            if (res.success) {
                toast.success('Password reset successfully');
                setResetOpen(false);
            } else {
                toast.error(res.error || 'Failed to reset password');
            }
        } finally {
            setResetting(false);
        }
    };

    const planStatusColor = (status: string | null) => {
        if (!status) return 'text-slate-400';
        if (status === 'active') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (status === 'expired') return 'text-red-600 bg-red-50 border-red-200';
        if (status === 'pending') return 'text-amber-600 bg-amber-50 border-amber-200';
        return 'text-slate-500 bg-slate-50 border-slate-200';
    };

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        Customer Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Manually add customers, assign plans, manage credentials.
                    </p>
                </div>
                <Link href="/admin/customers/new">
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Customer
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Customers', value: totalCount, icon: Users, color: 'teal' },
                    { label: 'With Active Plans', value: customers.filter(c => c.planStatus === 'active').length, icon: ShieldCheck, color: 'emerald' },
                    { label: 'No Plan Assigned', value: customers.filter(c => !c.planId).length, icon: CreditCard, color: 'amber' },
                    { label: 'Expired Plans', value: customers.filter(c => c.planStatus === 'expired').length, icon: CalendarDays, color: 'red' },
                ].map(stat => (
                    <Card key={stat.label} className="border-slate-200 shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                                <p className="text-xs text-slate-500">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name, email, phone or member ID..."
                        className="pl-9 bg-white border-slate-200"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
                <Select value={planFilter} onValueChange={setPlanFilter}>
                    <SelectTrigger className="w-full md:w-52 bg-white border-slate-200">
                        <SelectValue placeholder="Filter by Plan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="none">No Plan</SelectItem>
                        {plans.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-40 bg-white border-slate-200">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card className="bg-white border-slate-200 overflow-hidden shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow className="border-slate-200 hover:bg-transparent">
                                <TableHead className="text-slate-700">Customer</TableHead>
                                <TableHead className="text-slate-700">Member ID</TableHead>
                                <TableHead className="text-slate-700">Assigned Plan</TableHead>
                                <TableHead className="text-slate-700">Plan Validity</TableHead>
                                <TableHead className="text-slate-700">Status</TableHead>
                                <TableHead className="text-right text-slate-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600 mb-2" />
                                        <span className="text-slate-500">Loading customers...</span>
                                    </TableCell>
                                </TableRow>
                            ) : customers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                        No customers found.{' '}
                                        <Link href="/admin/customers/new" className="text-teal-600 underline">Add one</Link>
                                    </TableCell>
                                </TableRow>
                            ) : customers.map(customer => (
                                <TableRow key={customer.id} className="border-slate-100 hover:bg-slate-50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-slate-200">
                                                <AvatarFallback className="bg-teal-50 text-teal-600 text-xs font-semibold">
                                                    {customer.fullName.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-slate-900 text-sm">{customer.fullName}</p>
                                                <p className="text-xs text-slate-500">{customer.email}</p>
                                                {customer.phone && <p className="text-xs text-slate-400">{customer.phone}</p>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {customer.memberId ? (
                                            <div>
                                                <p className="font-mono text-xs font-medium text-slate-800">{customer.memberId}</p>
                                                {customer.cardUniqueId && (
                                                    <p className="font-mono text-xs text-slate-400">{customer.cardUniqueId}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">No plan assigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {customer.planName ? (
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{customer.planName}</p>
                                                {customer.planStatus && (
                                                    <Badge variant="outline" className={`text-xs mt-0.5 ${planStatusColor(customer.planStatus)}`}>
                                                        {customer.planStatus}
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => openAssignPlan(customer)}
                                                className="text-xs text-teal-600 hover:underline flex items-center gap-1"
                                            >
                                                <Plus className="h-3 w-3" /> Assign Plan
                                            </button>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {customer.validFrom ? (
                                            <div className="text-xs text-slate-600">
                                                <p>{customer.validFrom} →</p>
                                                <p className="text-slate-800 font-medium">{customer.validTill}</p>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={customer.status === 'active'
                                                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                                : 'text-red-600 bg-red-50 border-red-200'}
                                        >
                                            {customer.status === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-white border-slate-200">
                                                <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = `/admin/users/${customer.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" /> View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer" onClick={() => openAssignPlan(customer)}>
                                                    <CreditCard className="mr-2 h-4 w-4" /> Assign / Change Plan
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer" onClick={() => openResetPassword(customer)}>
                                                    <KeyRound className="mr-2 h-4 w-4" /> Reset Password
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Assign Plan Dialog */}
            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                <DialogContent className="bg-white border-slate-200 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900">Assign Plan</DialogTitle>
                        <p className="text-sm text-slate-500">
                            Assign a health plan to <strong>{selectedCustomer?.fullName}</strong>
                        </p>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        {selectedCustomer?.planName && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                                Current plan: <strong>{selectedCustomer.planName}</strong> — assigning a new plan will expire this one.
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label>Select Plan</Label>
                            <Select value={assignPlanId} onValueChange={setAssignPlanId}>
                                <SelectTrigger className="bg-white border-slate-200">
                                    <SelectValue placeholder="Choose a plan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {plans.map((p: any) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name} — ₹{p.basePrice?.toLocaleString()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Valid From</Label>
                            <Input
                                type="date"
                                value={assignValidFrom}
                                onChange={e => setAssignValidFrom(e.target.value)}
                                className="bg-white border-slate-200"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleAssignPlan}
                            disabled={assigning || !assignPlanId}
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                            {assigning ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
                            Assign Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={resetOpen} onOpenChange={setResetOpen}>
                <DialogContent className="bg-white border-slate-200 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900">Reset Password</DialogTitle>
                        <p className="text-sm text-slate-500">Reset login password for <strong>{resetUserEmail}</strong></p>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>New Password</Label>
                            <div className="flex gap-2">
                                <Input
                                    type={passwordVisible ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="bg-white border-slate-200 font-mono"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setPasswordVisible(v => !v)}
                                    title={passwordVisible ? 'Hide' : 'Show'}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setNewPassword(generatePassword())}
                                    title="Generate new password"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500">Share this password with the customer securely.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { navigator.clipboard.writeText(newPassword); toast.success('Copied!'); }}
                            >
                                Copy Password
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setResetOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleResetPassword}
                            disabled={resetting}
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                            {resetting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <KeyRound className="h-4 w-4 mr-2" />}
                            Reset Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
