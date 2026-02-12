'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    FileText, Users, TrendingUp, IndianRupee, Clock, CheckCircle
} from 'lucide-react';

const dashboardData = {
    franchiseName: 'HealthMitra Delhi NCR',
    stats: [
        { label: 'Total Partners', value: '28', icon: Users, color: 'bg-blue-50 border-blue-200 text-blue-700' },
        { label: 'Service Requests', value: '42', icon: FileText, color: 'bg-amber-50 border-amber-200 text-amber-700' },
        { label: 'Revenue (MTD)', value: '₹3.2L', icon: IndianRupee, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
        { label: 'Commission Earned', value: '₹48K', icon: TrendingUp, color: 'bg-teal-50 border-teal-200 text-teal-700' },
    ],
    recentRequests: [
        { id: 'SR-1001', customer: 'Rajesh Kumar', type: 'Consultation', status: 'pending', time: '2 hours ago' },
        { id: 'SR-1002', customer: 'Sunita Devi', type: 'Nursing', status: 'assigned', time: '6 hours ago' },
        { id: 'SR-1004', customer: 'Meera Joshi', type: 'Ambulance', status: 'completed', time: '3 days ago' },
    ],
    recentActivity: [
        { text: 'Service Request SR-1001 created for Rajesh Kumar', time: '2 hours ago' },
        { text: 'New partner "Apollo Clinic, Noida" added', time: '1 day ago' },
        { text: 'Gold Health Plan pricing updated', time: '3 days ago' },
    ],
};

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    assigned: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
};

export default function FranchiseDashboardPage() {
    return (
        <div className="space-y-6 animate-in fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
                <p className="text-slate-500 text-sm">{dashboardData.franchiseName} — Dashboard Overview</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dashboardData.stats.map(s => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-slate-700 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" /> Recent Service Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {dashboardData.recentRequests.map(r => (
                                <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-mono text-slate-400">{r.id}</span>
                                            <span className="text-sm font-medium text-slate-800">{r.customer}</span>
                                        </div>
                                        <span className="text-xs text-slate-400">{r.type} • {r.time}</span>
                                    </div>
                                    <Badge className={`text-xs ${STATUS_COLORS[r.status]}`}>{r.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-slate-700 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" /> Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {dashboardData.recentActivity.map((a, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="h-6 w-6 bg-teal-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle className="h-3 w-3 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-700">{a.text}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
