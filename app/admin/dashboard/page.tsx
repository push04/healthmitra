'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/app/actions/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpRight, ArrowDownRight, Users, CreditCard, Activity, ShoppingCart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardStats().then(res => {
            if (res.success) setData(res.data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="p-8 text-slate-800">Loading Dashboard...</div>;

    const MetricCard = ({ title, value, change, icon: Icon, trend }: any) => (
        <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-slate-500">{title}</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
                    </div>
                    <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
                <div className="flex items-center mt-4 text-xs">
                    {trend === 'up' ? <ArrowUpRight className="h-4 w-4 text-emerald-600 mr-1" /> : <ArrowDownRight className="h-4 w-4 text-rose-600 mr-1" />}
                    <span className={trend === 'up' ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>{change}</span>
                    <span className="text-slate-400 ml-1">vs last month</span>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500">Welcome back, Admin!</p>
                </div>
                <Select defaultValue="30days">
                    <SelectTrigger className="w-[180px] bg-white border-slate-200 text-slate-800"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="90days">Last Quarter</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    title="Total Revenue" 
                    value={data.metrics?.totalRevenue ? `₹${(data.metrics.totalRevenue / 100000).toFixed(2)}L` : '₹0'} 
                    change="+15%" 
                    icon={CreditCard} 
                    trend="up" 
                />
                <MetricCard 
                    title="Active Plans" 
                    value={String(data.metrics?.activePlans || 0)} 
                    change="+8%" 
                    icon={ShoppingCart} 
                    trend="up" 
                />
                <MetricCard 
                    title="New Customers" 
                    value={String(data.metrics?.newCustomers || 0)} 
                    change="+22%" 
                    icon={Users} 
                    trend="up" 
                />
                <MetricCard 
                    title="Pending Tasks" 
                    value={String(data.metrics?.pendingTasks || 0)} 
                    change="-5%" 
                    icon={Activity} 
                    trend={data.metrics?.pendingTasks > 0 ? 'down' : 'up'} 
                />
            </div>

            {/* CHARTS ROW 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
                    <CardHeader><CardTitle className="text-lg text-slate-800">Revenue Trend</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenueChart}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ color: '#1e293b' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader><CardTitle className="text-lg text-slate-800">Plan Sales</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.planSales} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#64748b" fontSize={12} hide />
                                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', color: '#1e293b' }} />
                                <Bar dataKey="value" fill="#f472b6" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* CHARTS ROW 2 & ACTIVITY */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-white border-slate-200 shadow-sm">
                    <CardHeader><CardTitle className="text-lg text-slate-800">Customer Growth (Retention)</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.customerGrowth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="month" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }} />
                                <Area type="monotone" dataKey="retained" stackId="1" stroke="#818cf8" fill="#818cf8" fillOpacity={0.6} />
                                <Area type="monotone" dataKey="new" stackId="1" stroke="#34d399" fill="#34d399" fillOpacity={0.6} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader><CardTitle className="text-lg text-slate-800">Recent Activity</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        {data.activities.map((act: any) => (
                            <div key={act.id} className="flex gap-4">
                                <div className={`mt-1 h-2 w-2 rounded-full ring-4 ring-opacity-20 flex-shrink-0 ${act.type === 'purchase' ? 'bg-emerald-500 ring-emerald-200' : act.type === 'claim' ? 'bg-rose-500 ring-rose-200' : 'bg-blue-500 ring-blue-200'}`} />
                                <div>
                                    <p className="text-sm text-slate-700 font-medium mb-1">{act.message}</p>
                                    <p className="text-xs text-slate-400">{act.time}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
