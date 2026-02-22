'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Search, Loader2, Plus, Building2, MapPin, Shield, CheckCircle, Clock, Eye, Users, TrendingUp, Phone, Mail, DollarSign
} from 'lucide-react';
import { Franchise } from '@/types/franchise';
import { getFranchises, getFranchiseStats } from '@/app/actions/franchise';

const KYC_STYLES: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
};

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function FranchiseDashboard() {
    const [franchises, setFranchises] = useState<Franchise[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({ total: 0, active: 0, verified: 0, totalMembers: 0, totalSales: 0 });

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const [franchisesRes, statsRes] = await Promise.all([
                getFranchises(search || undefined),
                getFranchiseStats()
            ]);
            if (franchisesRes.success && franchisesRes.data) setFranchises(franchisesRes.data);
            if (statsRes.success && statsRes.data) setStats(statsRes.data);
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
                                <Building2 className="h-8 w-8 text-teal-600" />
                                <div>
                                    <h1 className="text-xl font-bold text-slate-800">Franchise Management</h1>
                                    <p className="text-xs text-slate-500">Manage franchise partners and operations</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/admin/franchises/new">
                                <Button className="bg-teal-600 hover:bg-teal-700">
                                    <Plus className="mr-2 h-4 w-4" /> Add Franchise
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
                                    <p className="text-slate-500 text-sm">Total Franchises</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
                                </div>
                                <div className="bg-teal-50 p-3 rounded-full">
                                    <Building2 className="h-6 w-6 text-teal-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">Pending KYC</p>
                                    <h3 className="text-2xl font-bold text-amber-600">{stats.total - stats.verified}</h3>
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
                                    <p className="text-slate-500 text-sm">This Month Revenue</p>
                                    <h3 className="text-2xl font-bold text-emerald-600">₹{(stats.totalSales * 0.1 / 100000).toFixed(1)}L</h3>
                                </div>
                                <div className="bg-emerald-50 p-3 rounded-full">
                                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">Commission Payout</p>
                                    <h3 className="text-2xl font-bold text-purple-600">₹{(stats.totalSales * 0.15 / 100000).toFixed(1)}L</h3>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-full">
                                    <DollarSign className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search franchises by name or location..."
                            className="pl-9 bg-white border-slate-200"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Franchises Table */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                            </div>
                        ) : franchises.length === 0 ? (
                            <div className="text-center p-12">
                                <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">No franchises found</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="font-semibold">Franchise</TableHead>
                                        <TableHead className="font-semibold">Location</TableHead>
                                        <TableHead className="font-semibold">Contact</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">KYC</TableHead>
                                        <TableHead className="font-semibold">Members</TableHead>
                                        <TableHead className="font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {franchises.slice(0, 20).map((franchise) => (
                                        <TableRow key={franchise.id} className="hover:bg-slate-50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                                                        <Building2 className="h-5 w-5 text-teal-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{franchise.name}</p>
                                                        <p className="text-xs text-slate-500">ID: {franchise.id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                                    <MapPin className="h-3 w-3" />
                                                    {franchise.city}, {franchise.state}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3 text-slate-400" />
                                                        {franchise.contact}
                                                    </p>
                                                    <p className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Mail className="h-3 w-3" />
                                                        {franchise.email}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={STATUS_STYLES[franchise.status] || 'bg-slate-100 text-slate-500'}>
                                                    {franchise.status || 'inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={KYC_STYLES[franchise.kycStatus] || 'bg-slate-100 text-slate-500'}>
                                                    {franchise.kycStatus || 'pending'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-lg font-semibold text-slate-900">{franchise.totalPartners || 0}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Link href={`/admin/franchises/${franchise.id}`}>
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
