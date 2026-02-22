'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Search, Loader2, FileText, User, Shield, Upload, Eye, Users, FolderOpen, TrendingUp, Calendar, Plus, Activity
} from 'lucide-react';
import { PatientMember } from '@/types/phr';
import { getPatients, getPHRStats } from '@/app/actions/phr';
import { createClient } from '@/lib/supabase/client';

export default function PHRDashboard() {
    const [patients, setPatients] = useState<PatientMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({ totalMembers: 0, totalRecords: 0, thisMonthRecords: 0 });

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const [patientsRes, statsRes] = await Promise.all([
                getPatients(search || undefined),
                getPHRStats()
            ]);
            if (patientsRes.success && patientsRes.data) setPatients(patientsRes.data);
            if (statsRes.success && statsRes.data) {
                setStats({
                    totalMembers: statsRes.data.totalMembers,
                    totalRecords: statsRes.data.totalRecords,
                    thisMonthRecords: statsRes.data.thisMonthRecords
                });
            }
            setLoading(false);
        };
        const timeout = setTimeout(fetch, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Activity className="h-8 w-8 text-teal-600" />
                                <div>
                                    <h1 className="text-xl font-bold text-slate-800">PHR Management</h1>
                                    <p className="text-xs text-slate-500">Personal Health Records Dashboard</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/admin/phr/vendor">
                                <Button variant="outline" className="border-teal-200 text-teal-700">
                                    <Upload className="mr-2 h-4 w-4" /> Vendor Portal
                                </Button>
                            </Link>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">Total Members</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{stats.totalMembers}</h3>
                                </div>
                                <div className="bg-teal-50 p-3 rounded-full">
                                    <Users className="h-6 w-6 text-teal-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">Total PHR Records</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{stats.totalRecords}</h3>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-full">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">This Month</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{stats.thisMonthRecords}</h3>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-full">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">Active Vendors</p>
                                    <h3 className="text-2xl font-bold text-slate-900">5</h3>
                                </div>
                                <div className="bg-amber-50 p-3 rounded-full">
                                    <Shield className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Actions */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            className="pl-9 bg-white border-slate-200"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                        <Plus className="mr-2 h-4 w-4" /> Add Member
                    </Button>
                </div>

                {/* Members Table */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                            </div>
                        ) : patients.length === 0 ? (
                            <div className="text-center p-12">
                                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">No PHR members found</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="font-semibold">Member</TableHead>
                                        <TableHead className="font-semibold">Contact</TableHead>
                                        <TableHead className="font-semibold">Plan</TableHead>
                                        <TableHead className="font-semibold">Records</TableHead>
                                        <TableHead className="font-semibold">Joined</TableHead>
                                        <TableHead className="font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patients.slice(0, 20).map((patient) => (
                                        <TableRow key={patient.id} className="hover:bg-slate-50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-teal-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{patient.name}</p>
                                                        <p className="text-xs text-slate-500">ID: {patient.id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm">{patient.email}</p>
                                                <p className="text-xs text-slate-500">{patient.phone}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-teal-200 text-teal-700">
                                                    {patient.planName || 'Basic'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-lg font-semibold text-slate-900">{patient.recordCount || 0}</span>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">
                                                {patient.lastUpdated ? new Date(patient.lastUpdated).toLocaleDateString('en-IN') : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Link href={`/admin/phr/${patient.id}`}>
                                                        <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
