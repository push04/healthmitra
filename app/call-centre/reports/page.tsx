'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, BarChart3, Users, PhoneCall, PieChart } from 'lucide-react';
import { getCallCentreReports } from '@/app/actions/callcentre';

export default function ReportsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await getCallCentreReports();
            if (res.success) setData(res.data);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;
    if (!data) return <div className="text-center py-20 text-slate-400">Failed to load reports.</div>;

    const maxByType = Math.max(...data.byType.map((t: any) => t.count), 1);
    const maxByStatus = Math.max(...data.byStatus.map((s: any) => s.count), 1);

    const TYPE_COLORS = ['bg-blue-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500'];
    const STATUS_COLORS = ['bg-amber-500', 'bg-blue-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-slate-400'];

    return (
        <div className="space-y-6 animate-in fade-in">
            <div><h1 className="text-2xl font-bold text-slate-900">Call Centre Reports</h1><p className="text-slate-500 text-sm">Overview of service request performance and agent metrics.</p></div>

            {/* Summary stat */}
            <div className="p-5 rounded-xl border bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm flex items-center gap-4">
                <PhoneCall className="h-8 w-8 opacity-50" />
                <div>
                    <p className="text-3xl font-bold">{data.total}</p>
                    <p className="text-sm opacity-70">Total Service Requests</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* By Type */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-slate-400" /> By Request Type</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {data.byType.filter((t: any) => t.count > 0).map((t: any, i: number) => (
                            <div key={t.type}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">{t.type}</span>
                                    <span className="font-medium text-slate-800">{t.count}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${TYPE_COLORS[i % TYPE_COLORS.length]} transition-all`} style={{ width: `${(t.count / maxByType) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* By Status */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700 flex items-center gap-2"><PieChart className="h-4 w-4 text-slate-400" /> By Status</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {data.byStatus.filter((s: any) => s.count > 0).map((s: any, i: number) => (
                            <div key={s.status}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">{s.status}</span>
                                    <span className="font-medium text-slate-800">{s.count}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${STATUS_COLORS[i % STATUS_COLORS.length]} transition-all`} style={{ width: `${(s.count / maxByStatus) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Agent Performance */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700 flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" /> Agent Performance</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.byAgent.map((a: any) => (
                            <div key={a.name} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <p className="font-medium text-slate-800 mb-2">{a.name}</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="text-center p-2 bg-white rounded-lg">
                                        <p className="text-lg font-bold text-slate-800">{a.total}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400">Total</p>
                                    </div>
                                    <div className="text-center p-2 bg-emerald-50 rounded-lg">
                                        <p className="text-lg font-bold text-emerald-700">{a.completed}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400">Done</p>
                                    </div>
                                    <div className="text-center p-2 bg-amber-50 rounded-lg">
                                        <p className="text-lg font-bold text-amber-700">{a.pending}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400">Active</p>
                                    </div>
                                </div>
                                {a.total > 0 && (
                                    <div className="mt-2">
                                        <div className="w-full bg-slate-100 rounded-full h-1.5 flex overflow-hidden">
                                            <div className="bg-emerald-500 h-1.5" style={{ width: `${(a.completed / a.total) * 100}%` }} />
                                            <div className="bg-amber-400 h-1.5" style={{ width: `${(a.pending / a.total) * 100}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
