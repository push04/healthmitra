'use client';

import { useState, useEffect } from 'react';
import { User, UserType } from '@/app/lib/mock/users-data';
import { MOCK_DEPARTMENTS } from '@/app/lib/mock/departments';
import { getUsers, toggleUserStatus } from '@/app/actions/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Filter, Loader2, Download, MoreHorizontal, UserCheck, UserX, Mail, Eye, Edit2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UsersListingPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [query, setQuery] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');
    const [stats, setStats] = useState({ total: 0, customers: 0, employees: 0, admins: 0, partners: 0 });

    // Load data
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Map generic tab names to specific user types for filtering
                // All -> 'all', Customers -> 'Customer', etc.
                const typeFilter =
                    activeTab === 'customers' ? 'Customer' :
                        activeTab === 'employees' ? 'Employee' :
                            activeTab === 'admins' ? 'Admin' :
                                activeTab === 'partners' ? 'Referral Partner' : 'all';

                const res = await getUsers({
                    query,
                    type: typeFilter,
                    department: deptFilter
                });

                if (res.success && res.data) {
                    setUsers(res.data);
                    if (res.stats) setStats(res.stats);
                }
            } catch (err) {
                toast.error("Failed to fetch users");
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(load, 300); // debounce
        return () => clearTimeout(timeout);
    }, [activeTab, query, deptFilter]);

    const handleStatusToggle = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        await toggleUserStatus(id, newStatus);

        // Optimistic update
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus as any } : u));
        toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    };

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        User Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage all roles and permissions across the platform.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-teal-600 text-teal-400 hover:bg-teal-900/10">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Link href="/admin/users/new">
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Add User
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Tabs & Filters */}
            <div className="space-y-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-white text-slate-500 border border-slate-200">
                        <TabsTrigger value="all" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">All Users ({stats.total})</TabsTrigger>
                        <TabsTrigger value="customers" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">Customers ({stats.customers})</TabsTrigger>
                        <TabsTrigger value="employees" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">Employees ({stats.employees})</TabsTrigger>
                        <TabsTrigger value="admins" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">Admins ({stats.admins})</TabsTrigger>
                        <TabsTrigger value="partners" className="data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">Partners ({stats.partners})</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by Name, Email, Phone or User ID..."
                            className="pl-9 bg-white border-slate-200 text-slate-900"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    {/* Department Filter - Only show for employees/admins context usually, but good to have */}
                    <div className="w-full md:w-64">
                        <Select value={deptFilter} onValueChange={setDeptFilter}>
                            <SelectTrigger className="bg-white border-slate-200 text-slate-700">
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 text-slate-700">
                                <SelectItem value="all">All Departments</SelectItem>
                                {MOCK_DEPARTMENTS.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <Card className="bg-white border-slate-200 overflow-hidden shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow className="border-slate-200 hover:bg-transparent">
                                <TableHead className="w-[80px] text-slate-700">Photo</TableHead>
                                <TableHead className="text-slate-700">User ID</TableHead>
                                <TableHead className="text-slate-700">Name / Email</TableHead>
                                <TableHead className="text-slate-700">Role</TableHead>
                                <TableHead className="text-slate-700">Info</TableHead>
                                <TableHead className="text-slate-700">Status</TableHead>
                                <TableHead className="text-right text-slate-700">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600 mb-2" />
                                        <span className="text-slate-500">Loading users...</span>
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                                        No users found matching your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map(user => (
                                    <TableRow key={user.id} className="border-slate-100 hover:bg-slate-50">
                                        <TableCell>
                                            <Avatar className="h-10 w-10 border border-slate-200">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                                                <AvatarFallback className="bg-slate-100 text-slate-500">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-slate-500">{user.id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-slate-900">{user.name}</span>
                                                <span className="text-xs text-slate-500">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`
                                                ${user.type === 'Admin' ? 'text-purple-600 border-purple-200 bg-purple-50' :
                                                    user.type === 'Employee' ? 'text-blue-600 border-blue-200 bg-blue-50' :
                                                        user.type === 'Customer' ? 'text-teal-600 border-teal-200 bg-teal-50' :
                                                            'text-amber-600 border-amber-200 bg-amber-50'}
                                            `}>
                                                {user.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.type === 'Employee' ? (
                                                <div className="flex flex-col text-xs text-slate-500">
                                                    <span>{MOCK_DEPARTMENTS.find(d => d.id === user.departmentId)?.name || '-'}</span>
                                                    <span className="text-slate-400">Joined: {user.joinedDate}</span>
                                                </div>
                                            ) : user.type === 'Referral Partner' ? (
                                                <div className="flex flex-col text-xs text-amber-600">
                                                    <span>Ref: {user.referralCode}</span>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-500">{user.city}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${user.status === 'active' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                                                {user.status === 'active' ? 'Active' : 'Inactive'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-700">
                                                    <DropdownMenuItem className="hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4" /> View Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">
                                                        <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="hover:bg-slate-50 focus:bg-slate-50 cursor-pointer">
                                                        <Mail className="mr-2 h-4 w-4" /> Send Email
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        className={`hover:bg-slate-50 focus:bg-slate-50 cursor-pointer ${user.status === 'active' ? 'text-red-600' : 'text-green-600'}`}
                                                        onClick={() => handleStatusToggle(user.id, user.status)}
                                                    >
                                                        {user.status === 'active' ? (
                                                            <> <UserX className="mr-2 h-4 w-4" /> Deactivate </>
                                                        ) : (
                                                            <> <UserCheck className="mr-2 h-4 w-4" /> Activate </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
