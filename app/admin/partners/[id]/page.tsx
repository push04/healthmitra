'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ArrowLeft, Loader2, Building2, Mail, Phone, MapPin, Shield, Percent,
    IndianRupee, Users, Calendar, Edit, Globe, CheckCircle, Clock, CreditCard
} from 'lucide-react';
import { Partner, SubPartner, PartnerCommission } from '@/types/partners';
import { getPartner } from '@/app/actions/partners';
import { toast } from 'sonner';
import Link from 'next/link';

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200',
    suspended: 'bg-red-100 text-red-600 border-red-200',
};

const COM_STATUS: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    processed: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
};

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [partner, setPartner] = useState<Partner | null>(null);
    const [subs, setSubs] = useState<SubPartner[]>([]);
    const [comms, setComms] = useState<PartnerCommission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const res = await getPartner(id);
            if (res.success && res.data) {
                setPartner(res.data.partner);
                setSubs(res.data.subPartners);
                setComms(res.data.commissions);
            }
            setLoading(false);
        };
        fetch();
    }, [id]);

    const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div>;
    if (!partner) return <div className="flex flex-col items-center justify-center h-96 text-slate-500"><Building2 className="h-12 w-12 mb-4 text-slate-300" /><p>Partner not found.</p></div>;

    return (
        <div className="space-y-6 animate-in fade-in py-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/partners"><Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900"><ArrowLeft className="h-5 w-5" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{partner.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs border ${STATUS_STYLES[partner.status]}`}>{partner.status}</Badge>
                            <Badge className="text-xs font-mono bg-teal-50 text-teal-700 border-teal-200">{partner.referralCode}</Badge>
                        </div>
                    </div>
                </div>
                <Button variant="outline" className="border-slate-200 text-slate-600" onClick={() => toast.info('Edit partner', { description: 'Partner editing mode will be available shortly.' })}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            </div>

            <Tabs defaultValue="details">
                <TabsList className="bg-slate-100 border border-slate-200">
                    <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Details</TabsTrigger>
                    <TabsTrigger value="sub-partners" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Sub-Partners ({subs.length})</TabsTrigger>
                    <TabsTrigger value="commissions" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Commission Ledger</TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Contact Information</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <Info icon={Mail} label="Email" value={partner.email} />
                                <Info icon={Phone} label="Phone" value={partner.phone} />
                                <Info icon={MapPin} label="Address" value={`${partner.address || '—'}, ${partner.city}, ${partner.state}`} />
                                {partner.franchiseName && <Info icon={Building2} label="Franchise" value={partner.franchiseName} />}
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Commission & Financial</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <Info icon={Percent} label="Commission Rate" value={`${partner.commissionPercent}%`} />
                                <Info icon={IndianRupee} label="Total Commission" value={`₹${(partner.totalCommission / 1000).toFixed(0)}K`} />
                                <Info icon={Calendar} label="Joined" value={fmt(partner.joinedDate)} />
                                <Info icon={Shield} label="MOU" value={partner.mouSigned ? `Signed (${fmt(partner.mouDate!)})` : 'Not signed'} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bank Details */}
                    {partner.bankDetails && (
                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Bank Details</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <Info icon={CreditCard} label="Bank" value={partner.bankDetails.bankName || '—'} />
                                <Info icon={Building2} label="Branch" value={partner.bankDetails.branchName || '—'} />
                                <Info icon={Users} label="Holder" value={partner.bankDetails.accountHolder || '—'} />
                                <Info icon={Shield} label="Account No" value={partner.bankDetails.accountNumber || '—'} />
                                <Info icon={Globe} label="IFSC" value={partner.bankDetails.ifscCode || '—'} />
                                <Info icon={CreditCard} label="Type" value={partner.bankDetails.accountType || '—'} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Stat label="Total Sales" value={partner.totalSales} icon={IndianRupee} color="bg-emerald-50 border-emerald-200 text-emerald-700" />
                        <Stat label="Sub-Partners" value={partner.totalSubPartners} icon={Users} color="bg-blue-50 border-blue-200 text-blue-700" />
                        <Stat label="Commission Earned" value={`₹${(partner.totalCommission / 1000).toFixed(0)}K`} icon={Percent} color="bg-teal-50 border-teal-200 text-teal-700" />
                        <Stat label="KYC" value={partner.kycStatus} icon={Shield} color="bg-amber-50 border-amber-200 text-amber-700" />
                    </div>
                </TabsContent>

                {/* Sub-Partners Tab */}
                <TabsContent value="sub-partners" className="mt-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Sub-Partners</CardTitle></CardHeader>
                        <CardContent>
                            {subs.length === 0 ? (
                                <p className="text-center text-slate-400 py-8">No sub-partners yet.</p>
                            ) : (
                                <Table>
                                    <TableHeader><TableRow className="bg-slate-50 border-slate-200">
                                        <TableHead className="text-slate-600 font-semibold">Name</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Referral Code</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Designation</TableHead>
                                        <TableHead className="text-slate-600 font-semibold text-center">Commission %</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                                        <TableHead className="text-slate-600 font-semibold text-center">Sales</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Revenue</TableHead>
                                    </TableRow></TableHeader>
                                    <TableBody>
                                        {subs.map(sp => (
                                            <TableRow key={sp.id} className="border-slate-100">
                                                <TableCell><p className="font-medium text-slate-800">{sp.name}</p><p className="text-xs text-slate-400">{sp.email}</p></TableCell>
                                                <TableCell className="font-mono text-xs text-teal-600">{sp.referralCode}</TableCell>
                                                <TableCell className="text-sm text-slate-600">{sp.designation || '—'}</TableCell>
                                                <TableCell className="text-center text-sm font-medium text-slate-700">{sp.commissionPercent}%</TableCell>
                                                <TableCell><Badge className={`text-xs ${sp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{sp.status}</Badge></TableCell>
                                                <TableCell className="text-center text-sm text-slate-700">{sp.salesCount}</TableCell>
                                                <TableCell className="text-sm font-medium text-slate-700">₹{(sp.totalRevenue / 1000).toFixed(0)}K</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Commission Ledger Tab */}
                <TabsContent value="commissions" className="mt-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Commission Ledger</CardTitle></CardHeader>
                        <CardContent>
                            {comms.length === 0 ? (
                                <p className="text-center text-slate-400 py-8">No commission entries yet.</p>
                            ) : (
                                <Table>
                                    <TableHeader><TableRow className="bg-slate-50 border-slate-200">
                                        <TableHead className="text-slate-600 font-semibold">Sale ID</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Customer</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Plan</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Sale Amount</TableHead>
                                        <TableHead className="text-slate-600 font-semibold text-center">%</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Commission</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Date</TableHead>
                                    </TableRow></TableHeader>
                                    <TableBody>
                                        {comms.map(c => (
                                            <TableRow key={c.id} className="border-slate-100">
                                                <TableCell className="font-mono text-xs text-slate-500">{c.saleId}</TableCell>
                                                <TableCell className="text-sm text-slate-800">{c.customerName}</TableCell>
                                                <TableCell className="text-sm text-slate-600">{c.planName}</TableCell>
                                                <TableCell className="text-sm text-slate-700">₹{c.saleAmount.toLocaleString('en-IN')}</TableCell>
                                                <TableCell className="text-center text-sm text-slate-600">{c.commissionPercent}%</TableCell>
                                                <TableCell className="text-sm font-medium text-emerald-700">₹{c.commissionAmount.toLocaleString('en-IN')}</TableCell>
                                                <TableCell><Badge className={`text-xs ${COM_STATUS[c.status]}`}>{c.status}</Badge></TableCell>
                                                <TableCell className="text-xs text-slate-500">{fmt(c.saleDate)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (<div className="flex items-center gap-2"><Icon className="h-4 w-4 text-slate-400 shrink-0" /><span className="text-xs text-slate-400 w-28 shrink-0">{label}</span><span className="text-sm text-slate-700">{value}</span></div>);
}

function Stat({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
    return (<div className={`p-4 rounded-xl border ${color} shadow-sm`}><div className="flex items-center justify-between"><div><div className="text-xl font-bold">{value}</div><div className="text-xs uppercase tracking-wider opacity-70">{label}</div></div><Icon className="h-5 w-5 opacity-40" /></div></div>);
}
