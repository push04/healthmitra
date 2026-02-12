'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, IndianRupee, FileText, TrendingUp } from 'lucide-react';

const partnersData = [
    { id: 'fp_1', name: 'Apollo Clinic Noida', email: 'apollo.noida@partner.com', phone: '+91 9876500010', status: 'active', joinedAt: '2024-03-15', plansCount: 145, revenue: 420000 },
    { id: 'fp_2', name: 'Max Care Delhi', email: 'maxcare.del@partner.com', phone: '+91 9876500011', status: 'active', joinedAt: '2024-04-20', plansCount: 98, revenue: 310000 },
    { id: 'fp_3', name: 'Wellness Hub Gurgaon', email: 'wellness.grg@partner.com', phone: '+91 9876500012', status: 'inactive', joinedAt: '2024-06-01', plansCount: 42, revenue: 150000 },
];

export default function FranchisePartnersPage() {
    const totalPartners = partnersData.length;
    const activePartners = partnersData.filter(p => p.status === 'active').length;
    const totalRevenue = partnersData.reduce((a, p) => a + p.revenue, 0);
    const totalPlans = partnersData.reduce((a, p) => a + p.plansCount, 0);
    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className="space-y-6 animate-in fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Partners</h1>
                <p className="text-slate-500 text-sm">View your franchise partners and performance reports.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Partners', value: totalPartners, icon: Users, color: 'bg-blue-50 border-blue-200 text-blue-700' },
                    { label: 'Active', value: activePartners, icon: TrendingUp, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                    { label: 'Total Plans', value: totalPlans, icon: FileText, color: 'bg-amber-50 border-amber-200 text-amber-700' },
                    { label: 'Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: IndianRupee, color: 'bg-teal-50 border-teal-200 text-teal-700' },
                ].map(s => (
                    <div key={s.label} className={`p-4 rounded-xl border ${s.color} shadow-sm`}>
                        <div className="flex items-center justify-between">
                            <div><div className="text-2xl font-bold">{s.value}</div><div className="text-xs uppercase tracking-wider opacity-70">{s.label}</div></div>
                            <s.icon className="h-5 w-5 opacity-40" />
                        </div>
                    </div>
                ))}
            </div>

            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Partner Performance</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 border-slate-200">
                                <TableHead className="text-slate-600 font-semibold">Partner</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Phone</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Joined</TableHead>
                                <TableHead className="text-slate-600 font-semibold text-center">Plans Sold</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Revenue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partnersData.map(p => (
                                <TableRow key={p.id} className="border-slate-100">
                                    <TableCell><div><p className="font-medium text-slate-800">{p.name}</p><p className="text-xs text-slate-400">{p.email}</p></div></TableCell>
                                    <TableCell className="text-sm text-slate-600">{p.phone}</TableCell>
                                    <TableCell><Badge className={`text-xs ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{p.status}</Badge></TableCell>
                                    <TableCell className="text-xs text-slate-500">{formatDate(p.joinedAt)}</TableCell>
                                    <TableCell className="text-center text-sm font-medium text-slate-700">{p.plansCount}</TableCell>
                                    <TableCell className="text-sm font-medium text-slate-700">₹{(p.revenue / 1000).toFixed(0)}K</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
