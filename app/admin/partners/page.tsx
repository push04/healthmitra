'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Search, Loader2, Handshake, Plus, Users, IndianRupee, Shield, TrendingUp, Eye
} from 'lucide-react';
import { Partner } from '@/app/lib/mock/partner-data';
import { getPartners } from '@/app/actions/partners';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200',
    suspended: 'bg-red-100 text-red-600 border-red-200',
};

const KYC_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    submitted: 'bg-blue-100 text-blue-700',
    verified: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-600',
};

export default function PartnersListingPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, kycVerified: 0, totalRevenue: 0 });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await getPartners({ query: search, status: statusFilter });
            if (res.success) {
                setPartners(res.data);
                setStats(res.stats);
            }
            setLoading(false);
        };
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [search, statusFilter]);

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            <div className="flex items-center justify-between">
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Partners', value: stats.total, icon: Handshake, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                    { label: 'Active', value: stats.active, icon: TrendingUp, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                    { label: 'KYC Verified', value: stats.kycVerified, icon: Shield, color: 'bg-teal-50 border-teal-200 text-teal-700' },
                    { label: 'Total Commission', value: `₹${(stats.totalRevenue / 100000).toFixed(1)}L`, icon: IndianRupee, color: 'bg-amber-50 border-amber-200 text-amber-700' },
                ].map(s => (
                    <div key={s.label} className={`p-4 rounded-xl border ${s.color} shadow-sm`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold">{s.value}</div>
                                <div className="text-xs uppercase tracking-wider opacity-70">{s.label}</div>
                            </div>
                            <s.icon className="h-5 w-5 opacity-40" />
                        </div>
                    </div>
                ))}
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
                                <TableHead className="text-slate-600 font-semibold">Referral Code</TableHead>
                                <TableHead className="text-slate-600 font-semibold text-center">Commission %</TableHead>
                                <TableHead className="text-slate-600 font-semibold text-center">Sub-Partners</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                                <TableHead className="text-slate-600 font-semibold">KYC</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Total Sales</TableHead>
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
                                    <TableCell className="font-mono text-xs text-teal-600 font-medium">{p.referralCode}</TableCell>
                                    <TableCell className="text-center text-sm font-medium text-slate-700">{p.commissionPercent}%</TableCell>
                                    <TableCell className="text-center text-sm text-slate-600">{p.totalSubPartners}</TableCell>
                                    <TableCell><Badge className={`text-xs border ${STATUS_COLORS[p.status]}`}>{p.status}</Badge></TableCell>
                                    <TableCell><Badge className={`text-xs ${KYC_COLORS[p.kycStatus]}`}>{p.kycStatus}</Badge></TableCell>
                                    <TableCell className="text-sm font-medium text-slate-700">{p.totalSales} sales</TableCell>
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
