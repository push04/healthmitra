'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Search, Loader2, Plus, Building2, MapPin, Shield, CheckCircle, AlertCircle, Clock, Eye
} from 'lucide-react';
import { Franchise } from '@/types/franchise';
import { getFranchises } from '@/app/actions/franchise';
import Link from 'next/link';

const KYC_STYLES: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
};

const VERIFY_STYLES: Record<string, string> = {
    unverified: 'bg-slate-100 text-slate-500 border-slate-200',
    in_review: 'bg-blue-100 text-blue-700 border-blue-200',
    verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    suspended: 'bg-red-100 text-red-700 border-red-200',
};

export default function AdminFranchisesPage() {
    const [franchises, setFranchises] = useState<Franchise[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const res = await getFranchises(search || undefined);
            if (res.success && res.data) setFranchises(res.data);
            setLoading(false);
        };
        const timeout = setTimeout(fetch, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        Franchise Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage franchise partners, permissions, and activity.</p>
                </div>
                <Link href="/admin/franchises/new">
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Franchise
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Franchises', value: franchises.length, color: 'bg-slate-50 border-slate-200 text-slate-900', icon: Building2 },
                    { label: 'Active', value: franchises.filter(f => f.status === 'active').length, color: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: CheckCircle },
                    { label: 'KYC Pending', value: franchises.filter(f => f.kycStatus !== 'verified').length, color: 'bg-amber-50 border-amber-200 text-amber-700', icon: Clock },
                    { label: 'Total Partners', value: franchises.reduce((a, f) => a + f.totalPartners, 0), color: 'bg-blue-50 border-blue-200 text-blue-700', icon: Shield },
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

            {/* Search */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search by name, email, city, or referral code..." className="pl-9 bg-white border-slate-200 text-slate-900" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-teal-500" /></div>
                ) : franchises.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <Building2 className="h-10 w-10 opacity-20 mb-2" />
                        <p>No franchises found.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 border-slate-200">
                                <TableHead className="text-slate-600 font-semibold">Franchise</TableHead>
                                <TableHead className="text-slate-600 font-semibold">City</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Contact</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Commission</TableHead>
                                <TableHead className="text-slate-600 font-semibold">KYC</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Verification</TableHead>
                                <TableHead className="text-slate-600 font-semibold text-center">Partners</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Revenue</TableHead>
                                <TableHead className="text-slate-600 font-semibold text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {franchises.map(f => (
                                <TableRow key={f.id} className="border-slate-100 hover:bg-slate-50/50">
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-800">{f.name}</p>
                                            <p className="text-xs text-slate-400">{f.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-slate-600">
                                            <MapPin className="h-3 w-3 text-slate-400" /> {f.city}, {f.state}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">{f.contact}</TableCell>
                                    <TableCell>
                                        <span className="text-sm font-semibold text-teal-600">{f.commissionPercent}%</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`text-xs border ${KYC_STYLES[f.kycStatus]}`}>{f.kycStatus}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`text-xs border ${VERIFY_STYLES[f.verificationStatus]}`}>{f.verificationStatus.replace('_', ' ')}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-sm font-medium text-slate-700">{f.totalPartners}</TableCell>
                                    <TableCell>
                                        <span className="text-sm font-medium text-slate-700">₹{(f.totalRevenue / 100000).toFixed(1)}L</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/franchises/${f.id}`}>
                                            <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 text-xs">
                                                <Eye className="h-3.5 w-3.5 mr-1" /> View
                                            </Button>
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
