'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, FileText, Users, Settings, MapPin, Shield } from 'lucide-react';
import { getFranchiseActivity } from '@/app/actions/franchise';
import { FranchiseActivity } from '@/types/franchise';

const ACTION_ICONS: Record<string, any> = {
    'Service Request Created': FileText, 'Service Request Completed': FileText,
    'Partner Added': Users, 'City Added': MapPin, 'Plan Modified': Settings, 'KYC Submitted': Shield,
};

const ACTION_COLORS: Record<string, string> = {
    'Service Request Created': 'bg-amber-100 text-amber-600', 'Service Request Completed': 'bg-emerald-100 text-emerald-600',
    'Partner Added': 'bg-blue-100 text-blue-600', 'City Added': 'bg-indigo-100 text-indigo-600',
    'Plan Modified': 'bg-orange-100 text-orange-600', 'KYC Submitted': 'bg-teal-100 text-teal-600',
};

export default function FranchiseHistoryPage() {
    const [activities, setActivities] = useState<FranchiseActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const res = await getFranchiseActivity('fr_1');
            if (res.success && res.data) setActivities(res.data);
            setLoading(false);
        };
        fetch();
    }, []);

    const formatDateTime = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="space-y-6 animate-in fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Activity History</h1>
                <p className="text-slate-500 text-sm">Complete log of all actions performed under this franchise.</p>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-48"><Loader2 className="h-6 w-6 animate-spin text-teal-500" /></div>
                    ) : activities.length === 0 ? (
                        <div className="text-center py-12 text-slate-400"><Clock className="h-10 w-10 mx-auto mb-2 opacity-30" /><p>No activity recorded yet.</p></div>
                    ) : (
                        <div className="space-y-1">
                            {activities.map((a, i) => {
                                const Icon = ACTION_ICONS[a.action] || Clock;
                                const colors = ACTION_COLORS[a.action] || 'bg-slate-100 text-slate-600';
                                return (
                                    <div key={a.id} className="flex items-start gap-4 py-4 relative">
                                        {i !== activities.length - 1 && <div className="absolute left-[19px] top-[48px] bottom-0 w-px bg-slate-200" />}
                                        <div className={`h-10 w-10 rounded-full ${colors} flex items-center justify-center shrink-0 z-10`}><Icon className="h-4 w-4" /></div>
                                        <div className="flex-1 pt-0.5">
                                            <p className="text-sm font-medium text-slate-800">{a.action}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{a.description}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-xs text-slate-400">{formatDateTime(a.timestamp)}</span>
                                                <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200">{a.performedBy}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
