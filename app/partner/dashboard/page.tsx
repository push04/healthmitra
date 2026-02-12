'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, IndianRupee, TrendingUp, ShoppingCart, Clock, Activity, Percent } from 'lucide-react';
import { MOCK_PARTNERS, MOCK_COMMISSIONS, MOCK_SUB_PARTNERS } from '@/app/lib/mock/partner-data';

const partner = MOCK_PARTNERS[0]; // simulate logged-in partner
const commissions = MOCK_COMMISSIONS.filter(c => c.partnerId === partner.id);
const subPartners = MOCK_SUB_PARTNERS.filter(sp => sp.parentPartnerId === partner.id);

const COM_STATUS: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    processed: 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
};

export default function PartnerDashboardPage() {
    const stats = [
        { label: 'Total Sales', value: partner.totalSales, icon: ShoppingCart, color: 'bg-blue-50 border-blue-200 text-blue-700' },
        { label: 'Commission Earned', value: `₹${(partner.totalCommission / 1000).toFixed(0)}K`, icon: IndianRupee, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
        { label: 'Sub-Partners', value: subPartners.length, icon: Users, color: 'bg-orange-50 border-orange-200 text-orange-700' },
        { label: 'Commission Rate', value: `${partner.commissionPercent}%`, icon: Percent, color: 'bg-teal-50 border-teal-200 text-teal-700' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome, {partner.name}</h1>
                <p className="text-slate-500 text-sm">Your referral code: <span className="font-mono font-medium text-orange-600">{partner.referralCode}</span></p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className={`p-4 rounded-xl border ${s.color} shadow-sm`}>
                        <div className="flex items-center justify-between">
                            <div><div className="text-2xl font-bold">{s.value}</div><div className="text-xs uppercase tracking-wider opacity-70">{s.label}</div></div>
                            <s.icon className="h-5 w-5 opacity-40" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Commissions */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Recent Commissions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {commissions.slice(0, 4).map(c => (
                            <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{c.customerName}</p>
                                    <p className="text-xs text-slate-400">{c.planName} — {new Date(c.saleDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-emerald-700">₹{c.commissionAmount.toLocaleString('en-IN')}</p>
                                    <Badge className={`text-[10px] ${COM_STATUS[c.status]}`}>{c.status}</Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Sub-Partners Quick View */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Sub-Partner Performance</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {subPartners.slice(0, 4).map(sp => (
                            <div key={sp.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-slate-800">{sp.name}</p>
                                    <p className="text-xs text-slate-400">{sp.designation || 'Associate'} — {sp.commissionPercent}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-700">{sp.salesCount} sales</p>
                                    <p className="text-xs text-slate-400">₹{(sp.totalRevenue / 1000).toFixed(0)}K</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
