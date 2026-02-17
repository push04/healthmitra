'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IndianRupee, TrendingUp, Clock, CheckCircle2, Banknote, Loader2 } from 'lucide-react';
import { getCurrentPartner, getPartnerCommissions } from '@/app/actions/partners';
import { Partner, PartnerCommission } from '@/types/partners';
import { toast } from 'sonner';

const STATUS_COLORS: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    processed: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
};

export default function CommissionsPage() {
    const [partner, setPartner] = useState<Partner | null>(null);
    const [allCommissions, setAllCommissions] = useState<PartnerCommission[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const load = async () => {
            const res: any = await getCurrentPartner();
            if (res.success && res.data?.partner) {
                setPartner(res.data.partner);
                // Fetch commissions
                const comRes = await getPartnerCommissions(res.data.partner.id);
                setAllCommissions(comRes.data || []);
            } else {
                toast.error(res.error || "Failed to load partner data");
            }
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-teal-600" /></div>;
    if (!partner) return <div className="p-8 text-center text-slate-500">Partner profile not found. Please contact support.</div>;

    const filtered = statusFilter === 'all' ? allCommissions : allCommissions.filter(c => c.status === statusFilter);

    const totalEarned = allCommissions.reduce((a, c) => a + c.commissionAmount, 0);
    const paidOut = allCommissions.filter(c => c.status === 'paid').reduce((a, c) => a + c.commissionAmount, 0);
    const pending = allCommissions.filter(c => c.status === 'pending').reduce((a, c) => a + c.commissionAmount, 0);

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <div className="space-y-6 animate-in fade-in">
            <div><h1 className="text-2xl font-bold text-slate-900">Commission Ledger</h1><p className="text-slate-500 text-sm">Track your sales commissions and payouts.</p></div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm">
                    <div className="flex items-center justify-between"><div><div className="text-2xl font-bold">₹{(totalEarned / 1000).toFixed(1)}K</div><div className="text-xs uppercase tracking-wider opacity-70">Total Earned</div></div><TrendingUp className="h-5 w-5 opacity-40" /></div>
                </div>
                <div className="p-4 rounded-xl border bg-blue-50 border-blue-200 text-blue-700 shadow-sm">
                    <div className="flex items-center justify-between"><div><div className="text-2xl font-bold">₹{(paidOut / 1000).toFixed(1)}K</div><div className="text-xs uppercase tracking-wider opacity-70">Paid Out</div></div><CheckCircle2 className="h-5 w-5 opacity-40" /></div>
                </div>
                <div className="p-4 rounded-xl border bg-amber-50 border-amber-200 text-amber-700 shadow-sm">
                    <div className="flex items-center justify-between"><div><div className="text-2xl font-bold">₹{(pending / 1000).toFixed(1)}K</div><div className="text-xs uppercase tracking-wider opacity-70">Pending</div></div><Clock className="h-5 w-5 opacity-40" /></div>
                </div>
            </div>

            {/* Filter */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
                <span className="text-sm text-slate-600">Filter by status:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] bg-white border-slate-200 text-slate-700"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="processed">Processed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader><TableRow className="bg-slate-50 border-slate-200">
                            <TableHead className="text-slate-600 font-semibold">Sale ID</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Customer</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Plan</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Sale Amount</TableHead>
                            <TableHead className="text-slate-600 font-semibold text-center">%</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Commission</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Sale Date</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Payout Date</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={9} className="text-center py-8 text-slate-400">No commission entries found.</TableCell></TableRow>
                            ) : filtered.map(c => (
                                <TableRow key={c.id} className="border-slate-100 hover:bg-slate-50/50">
                                    <TableCell className="font-mono text-xs text-slate-500">{c.saleId}</TableCell>
                                    <TableCell className="text-sm text-slate-800">{c.customerName}</TableCell>
                                    <TableCell className="text-sm text-slate-600">{c.planName}</TableCell>
                                    <TableCell className="text-sm text-slate-700">₹{c.saleAmount.toLocaleString('en-IN')}</TableCell>
                                    <TableCell className="text-center text-sm text-slate-600">{c.commissionPercent}%</TableCell>
                                    <TableCell className="text-sm font-medium text-emerald-700">₹{c.commissionAmount.toLocaleString('en-IN')}</TableCell>
                                    <TableCell><Badge className={`text-xs ${STATUS_COLORS[c.status]}`}>{c.status}</Badge></TableCell>
                                    <TableCell className="text-xs text-slate-500">{fmt(c.saleDate)}</TableCell>
                                    <TableCell className="text-xs text-slate-500">{c.payoutDate ? fmt(c.payoutDate) : '—'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Bank Info */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700 flex items-center gap-2"><Banknote className="h-4 w-4 text-slate-400" /> Payout Bank Account</CardTitle></CardHeader>
                <CardContent>
                    {partner.bankDetails ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <BankRow label="Bank" value={partner.bankDetails.bankName || '—'} />
                            <BankRow label="Branch" value={partner.bankDetails.branchName || '—'} />
                            <BankRow label="A/C Holder" value={partner.bankDetails.accountHolder || '—'} />
                            <BankRow label="A/C Number" value={partner.bankDetails.accountNumber || '—'} />
                            <BankRow label="IFSC" value={partner.bankDetails.ifscCode || '—'} />
                            <BankRow label="Type" value={partner.bankDetails.accountType || '—'} />
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 text-center py-4">No bank details on file. Please contact admin.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function BankRow({ label, value }: { label: string; value: string }) {
    return (<div><p className="text-xs text-slate-400">{label}</p><p className="text-sm font-medium text-slate-700">{value}</p></div>);
}
