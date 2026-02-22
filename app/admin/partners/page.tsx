'use client';

import { useState, useEffect } from 'react';
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
import Link from 'next/link';

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

export default function PartnersListingPage() {
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
        <div className="space-y-6 animate-in fade-in py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Partner Management</h1>
                    <p className="text-slate-500 text-sm">Manage referral partners, commissions, and sub-partners.</p>
                </div>
                <Link href="/admin/partners/new">
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Partner
                    </Button>
                </Link>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Total Partners</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-full">
                                <Handshake className="h-6 w-6 text-blue-600" />
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
                                <TrendingUp className="h-6 w-6 text-emerald-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-500 text-sm">Total Sales</p>
                                <h3 className="text-2xl font-bold text-amber-600">{stats.totalRevenue}</h3>
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
                                <p className="text-slate-500 text-sm">KYC Verified</p>
                                <h3 className="text-2xl font-bold text-teal-600">{partners.filter(p => p.kycStatus === 'verified').length}</h3>
                            </div>
                            <div className="bg-teal-50 p-3 rounded-full">
                                <Shield className="h-6 w-6 text-teal-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search by name, email, or referral code..." className="pl-9 bg-white border-slate-200 text-slate-900" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-white border-slate-200 text-slate-700"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-teal-500" /></div>
                ) : partners.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                        <Handshake className="h-10 w-10 opacity-20 mb-2" /><p>No partners found.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 border-slate-200">
                                <TableHead className="text-slate-600 font-semibold">Partner</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Location</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Contact</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Referral Code</TableHead>
                                <TableHead className="text-slate-600 font-semibold text-center">Commission</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                                <TableHead className="text-slate-600 font-semibold">KYC</TableHead>
                                <TableHead className="text-slate-600 font-semibold text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partners.map(p => (
                                <TableRow key={p.id} className="border-slate-100 hover:bg-slate-50/50">
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-800">{p.name}</p>
                                            <p className="text-xs text-slate-400">{p.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-slate-600">
                                            <MapPin className="h-3 w-3 text-slate-400" /> {p.city}, {p.state}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-slate-600">
                                            <Phone className="h-3 w-3 text-slate-400" /> {p.phone}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-teal-600 font-medium">{p.referralCode}</TableCell>
                                    <TableCell className="text-center text-sm font-medium text-slate-700">{p.commissionPercent}%</TableCell>
                                    <TableCell><Badge className={`text-xs border ${STATUS_COLORS[p.status]}`}>{p.status}</Badge></TableCell>
                                    <TableCell><Badge className={`text-xs border ${KYC_COLORS[p.kycStatus]}`}>{p.kycStatus}</Badge></TableCell>
                                    <TableCell className="text-center">
                                        <Link href={`/admin/partners/${p.id}`}>
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-teal-600"><Eye className="h-4 w-4" /></Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
