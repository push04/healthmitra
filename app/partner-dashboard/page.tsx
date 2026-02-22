'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Search, Loader2, Handshake, Plus, Users, IndianRupee, Shield, TrendingUp, Eye, MapPin, Phone
} from 'lucide-react';
import { Partner } from '@/types/partners';
import { getPartners, getPartnerStats } from '@/app/actions/partners';

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200',
    suspended: 'bg-red-100 text-red-600 border-red-200',
};

const KYC_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-100 text-red-600 border-red-200',
};

export default function PartnerDashboard() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, totalCommission: 0, totalRevenue: 0 });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [partnersRes, statsRes] = await Promise.all([
                getPartners({ query: search, status: statusFilter }),
                getPartnerStats()
            ]);
            if (partnersRes.success && partnersRes.data) {
                setPartners(partnersRes.data);
                if (partnersRes.stats) {
                    setStats({
                        total: partnersRes.stats.total,
                        active: partnersRes.stats.active,
                        totalCommission: partnersRes.stats.totalRevenue,
                        totalRevenue: partnersRes.stats.totalRevenue
                    });
                }
            }
            if (statsRes.success && statsRes.data) {
                setStats(prev => ({ ...prev, ...statsRes.data }));
            }
            setLoading(false);
        };
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [search, statusFilter]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Handshake className="h-8 w-8 text-teal-600" />
                                <div>
                                    <h1 className="text-xl font-bold text-slate-800">Partner Management</h1>
                                    <p className="text-xs text-slate-500">Manage referral partners and commissions</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/admin/partners/new">
                                <Button className="bg-teal-600 hover:bg-teal-700">
                                    <Plus className="mr-2 h-4 w-4" /> Add Partner
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
                                    <p className="text-slate-500 text-sm">Total Partners</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
                                </div>
                                <div className="bg-teal-50 p-3 rounded-full">
                                    <Handshake className="h-6 w-6 text-teal-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">Active Partners</p>
                                    <h3 className="text-2xl font-bold text-emerald-600">{stats.active}</h3>
                                </div>
                                <div className="bg-emerald-50 p-3 rounded-full">
                                    <Shield className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">Total Revenue</p>
                                    <h3 className="text-2xl font-bold text-amber-600">₹{(stats.totalRevenue / 100000).toFixed(1)}L</h3>
                                </div>
                                <div className="bg-amber-50 p-3 rounded-full">
                                    <IndianRupee className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-sm">Total Commission</p>
                                    <h3 className="text-2xl font-bold text-purple-600">₹{(stats.totalCommission / 100000).toFixed(1)}L</h3>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-full">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search partners by name or email..."
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
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Partners Table */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex items-center justify-center p-12">
                                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                            </div>
                        ) : partners.length === 0 ? (
                            <div className="text-center p-12">
                                <Handshake className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">No partners found</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead className="font-semibold">Partner</TableHead>
                                        <TableHead className="font-semibold">Location</TableHead>
                                        <TableHead className="font-semibold">Contact</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">KYC</TableHead>
                                        <TableHead className="font-semibold">Sales</TableHead>
                                        <TableHead className="font-semibold">Commission</TableHead>
                                        <TableHead className="font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {partners.slice(0, 20).map((partner) => (
                                        <TableRow key={partner.id} className="hover:bg-slate-50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                                                        <Handshake className="h-5 w-5 text-teal-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{partner.name}</p>
                                                        <p className="text-xs text-slate-500">Code: {partner.referralCode}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-slate-600">
                                                    <MapPin className="h-3 w-3" />
                                                    {partner.city}, {partner.state}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3 text-slate-400" />
                                                        {partner.phone}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{partner.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={STATUS_COLORS[partner.status] || 'bg-slate-100 text-slate-500'}>
                                                    {partner.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={KYC_COLORS[partner.kycStatus] || 'bg-slate-100 text-slate-500'}>
                                                    {partner.kycStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-lg font-semibold text-slate-900">₹{(partner.totalSales / 1000).toFixed(0)}K</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-lg font-semibold text-purple-600">₹{(partner.totalCommission / 1000).toFixed(0)}K</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Link href={`/admin/partners/${partner.id}`}>
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
