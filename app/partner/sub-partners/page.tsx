'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Plus, Search, TrendingUp, IndianRupee, Loader2 } from 'lucide-react';
import { getCurrentPartner, getSubPartners } from '@/app/actions/partners';
import { Partner, SubPartner } from '@/types/partners';
import { toast } from 'sonner';

export default function SubPartnersPage() {
    const [partner, setPartner] = useState<Partner | null>(null);
    const [allSubs, setAllSubs] = useState<SubPartner[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            const res: any = await getCurrentPartner();
            if (res.success && res.data?.partner) {
                setPartner(res.data.partner);
                // getCurrentPartner returns subPartners in data.subPartners
                setAllSubs(res.data.subPartners || []);
            } else {
                toast.error(res.error || "Failed to load partner data");
            }
            setLoading(false);
        };
        load();
    }, []);

    const filtered = allSubs.filter(sp => sp.name.toLowerCase().includes(search.toLowerCase()) || sp.referralCode.toLowerCase().includes(search.toLowerCase()));

    const totalSales = allSubs.reduce((a, sp) => a + (sp.salesCount || 0), 0);
    const totalRev = allSubs.reduce((a, sp) => a + (sp.totalRevenue || 0), 0);

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-teal-600" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-900">Sub-Partners</h1><p className="text-slate-500 text-sm">Manage your sub-partner network.</p></div>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => toast.info('Add Sub-Partner dialog coming soon')}><Plus className="mr-2 h-4 w-4" /> Add Sub-Partner</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-blue-50 border-blue-200 text-blue-700 shadow-sm">
                    <div className="flex items-center justify-between"><div><div className="text-2xl font-bold">{allSubs.length}</div><div className="text-xs uppercase tracking-wider opacity-70">Total Sub-Partners</div></div><Users className="h-5 w-5 opacity-40" /></div>
                </div>
                <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm">
                    <div className="flex items-center justify-between"><div><div className="text-2xl font-bold">{totalSales}</div><div className="text-xs uppercase tracking-wider opacity-70">Combined Sales</div></div><TrendingUp className="h-5 w-5 opacity-40" /></div>
                </div>
                <div className="p-4 rounded-xl border bg-amber-50 border-amber-200 text-amber-700 shadow-sm">
                    <div className="flex items-center justify-between"><div><div className="text-2xl font-bold">₹{(totalRev / 1000).toFixed(0)}K</div><div className="text-xs uppercase tracking-wider opacity-70">Combined Revenue</div></div><IndianRupee className="h-5 w-5 opacity-40" /></div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search sub-partners..." className="pl-9 bg-white border-slate-200 text-slate-900" value={search} onChange={e => setSearch(e.target.value)} /></div>
            </div>

            {/* Table */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow className="bg-slate-50 border-slate-200">
                            <TableHead className="text-slate-600 font-semibold">Name</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Code</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Designation</TableHead>
                            <TableHead className="text-slate-600 font-semibold text-center">Commission %</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                            <TableHead className="text-slate-600 font-semibold text-center">Sales</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Revenue</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-400">No sub-partners found.</TableCell></TableRow>
                            ) : filtered.map(sp => (
                                <TableRow key={sp.id} className="border-slate-100 hover:bg-slate-50/50">
                                    <TableCell>
                                        <p className="font-medium text-slate-800">{sp.name}</p>
                                        <p className="text-xs text-slate-400">{sp.email}</p>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-orange-600">{sp.referralCode}</TableCell>
                                    <TableCell className="text-sm text-slate-600">{sp.designation || '—'}</TableCell>
                                    <TableCell className="text-center text-sm font-medium text-slate-700">{sp.commissionPercent}%</TableCell>
                                    <TableCell><Badge className={`text-xs ${sp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{sp.status}</Badge></TableCell>
                                    <TableCell className="text-center text-sm text-slate-700">{sp.salesCount}</TableCell>
                                    <TableCell className="text-sm font-medium text-slate-700">₹{(sp.totalRevenue / 1000).toFixed(0)}K</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
