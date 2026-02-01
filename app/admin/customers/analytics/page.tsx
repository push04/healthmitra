'use client';

import { useState, useEffect } from 'react';
import { getCustomerMetrics } from '@/app/actions/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, UserPlus, UserMinus, Wallet } from 'lucide-react';

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981'];

export default function CustomerAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCustomerMetrics().then(res => {
            if (res.success) setData(res.data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-8 text-slate-800">Loading Analytics...</div>;

    const insights = [
        { title: 'Total Customers', value: data.total, icon: Users, color: 'text-blue-600' },
        { title: 'Active', value: data.active, sub: `${Math.round((data.active / data.total) * 100)}%`, icon: UserPlus, color: 'text-green-600' },
        { title: 'Inactive', value: data.inactive, sub: `${Math.round((data.inactive / data.total) * 100)}%`, icon: UserMinus, color: 'text-red-500' },
        { title: 'Avg CLV', value: `₹${data.clv.toLocaleString()}`, icon: Wallet, color: 'text-yellow-600' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in max-w-[1200px] mx-auto p-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Customer Analytics</h1>

            {/* INSIGHTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {insights.map((item, i) => (
                    <Card key={i} className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{item.title}</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{item.value}</h3>
                                {item.sub && <p className="text-xs text-slate-400 mt-1">{item.sub}</p>}
                            </div>
                            <div className={`p-3 rounded-full bg-slate-50 border border-slate-200 ${item.color}`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ACQUISITION CHANNELS */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader><CardTitle>Acquisition Channels</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data.acquisition} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {data.acquisition.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-4">
                            {data.acquisition.map((entry: any, index: number) => (
                                <div key={entry.name} className="flex items-center text-xs text-slate-500">
                                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    {entry.name} ({entry.value}%)
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* DEMOGRAPHICS */}
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader><CardTitle>Customer Demographics (Age)</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.demographics.age}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#0f172a' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
