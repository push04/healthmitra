'use client';

import { useState, useEffect } from 'react';
import { Coupon, CouponType } from '@/types/coupons';
import { getCoupons, upsertCoupon, deleteCoupon } from '@/app/actions/coupons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, Search, Copy, Check, BarChart3, TrendingUp, Users, Calendar, Percent, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [stats, setStats] = useState({ revenue: 0, discounts: 0, activeUsers: 0, avgOrder: 0 });

    // Wizard State
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon>>({});

    const loadData = async () => {
        setLoading(true);
        const res = await getCoupons();
        if (res.success && res.data) {
            setCoupons(res.data);
            // Calculate stats from real coupon data
            const activeCoupons = res.data.filter((c: Coupon) => c.status === 'active');
            const totalUses = activeCoupons.reduce((sum: number, c: Coupon) => sum + (c.currentUses || 0), 0);
            const totalDiscounts = activeCoupons.reduce((sum: number, c: Coupon) => sum + (c.totalDiscountGiven || 0), 0);
            const totalRevenue = activeCoupons.reduce((sum: number, c: Coupon) => sum + (c.revenueGenerated || 0), 0);
            setStats({
                revenue: totalRevenue,
                discounts: totalDiscounts,
                activeUsers: totalUses,
                avgOrder: totalUses > 0 ? Math.round(totalRevenue / totalUses) : 0
            });
        }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Code copied!");
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this coupon?")) {
            await deleteCoupon(id);
            loadData();
            toast.success("Coupon deleted");
        }
    };

    const handleGenerateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        setEditingCoupon({ ...editingCoupon, code });
    };

    const handleSaveCoupon = async () => {
        await upsertCoupon(editingCoupon);
        setIsWizardOpen(false);
        setEditingCoupon({});
        setWizardStep(1);
        loadData();
        toast.success("Coupon saved successfully");
    };

    return (
        <div className="space-y-6 animate-in fade-in max-w-[1600px] mx-auto p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">Coupon Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Create and manage discount codes.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className={showAnalytics ? "bg-slate-100 text-slate-900 border-slate-300" : "text-slate-600 border-slate-200"} onClick={() => setShowAnalytics(!showAnalytics)}>
                        <BarChart3 className="mr-2 h-4 w-4" /> Analytics
                    </Button>
                    <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={() => { setEditingCoupon({ type: 'percentage', usageType: 'unlimited', validityType: 'limited', status: 'active', value: 0 }); setWizardStep(1); setIsWizardOpen(true); }}>
                        <Plus className="mr-2 h-4 w-4" /> Create Coupon
                    </Button>
                </div>
            </div>

            {showAnalytics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in slide-in-from-top-4">
                    <Card className="bg-white border-slate-200 shadow-sm"><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm text-slate-500">Total Revenue Generated</p><h3 className="text-2xl font-bold text-slate-800">₹{stats.revenue.toLocaleString()}</h3></div><TrendingUp className="h-8 w-8 text-green-600/20" /></CardContent></Card>
                    <Card className="bg-white border-slate-200 shadow-sm"><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm text-slate-500">Total Discounts Given</p><h3 className="text-2xl font-bold text-slate-800">₹{stats.discounts.toLocaleString()}</h3></div><Percent className="h-8 w-8 text-pink-600/20" /></CardContent></Card>
                    <Card className="bg-white border-slate-200 shadow-sm"><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm text-slate-500">Active Coupons Users</p><h3 className="text-2xl font-bold text-slate-800">{stats.activeUsers.toLocaleString()}</h3></div><Users className="h-8 w-8 text-blue-600/20" /></CardContent></Card>
                    <Card className="bg-white border-slate-200 shadow-sm"><CardContent className="p-4 flex items-center justify-between"><div><p className="text-sm text-slate-500">Avg. Order Value</p><h3 className="text-2xl font-bold text-slate-800">₹{stats.avgOrder.toLocaleString()}</h3></div><IndianRupee className="h-8 w-8 text-amber-600/20" /></CardContent></Card>
                </div>
            )}

            {/* FILTERS */}
            <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search coupon code..." className="pl-9 bg-white border-slate-200 text-slate-900" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-white border-slate-200 text-slate-700"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-700">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map(coupon => (
                    <Card key={coupon.id} className="bg-white border-slate-200 group hover:border-pink-300 hover:shadow-md transition-all shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-slate-100 border border-slate-200 rounded px-3 py-1 font-mono font-bold text-lg text-slate-700 tracking-widest flex items-center gap-2">
                                    {coupon.code}
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-slate-700" onClick={() => handleCopy(coupon.code)}><Copy className="h-3 w-3" /></Button>
                                </div>
                                <Badge variant={coupon.status === 'active' ? 'default' : 'secondary'} className={coupon.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{coupon.status}</Badge>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-2xl font-bold text-slate-800 mb-1">
                                    {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-2">{coupon.description}</p>
                            </div>

                            <div className="space-y-2 text-sm text-slate-500 border-t border-slate-100 pt-4 mb-4">
                                <div className="flex justify-between">
                                    <span>Usage:</span>
                                    <span className={coupon.currentUses >= coupon.totalUsesAllowed ? "text-rose-500 font-medium" : "text-slate-700"}>{coupon.currentUses} / {coupon.usageType === 'unlimited' ? '∞' : coupon.totalUsesAllowed}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Valid:</span>
                                    <span className="text-slate-700">{coupon.validityType === 'always' ? 'Always Active' : `${coupon.startDate} - ${coupon.endDate}`}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Min. Purchase:</span>
                                    <span className="text-slate-700">{coupon.minPurchaseAmount ? `₹${coupon.minPurchaseAmount}` : 'None'}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700" variant="secondary" onClick={() => { setEditingCoupon(coupon); setWizardStep(1); setIsWizardOpen(true); }}>
                                    <Edit2 className="mr-2 h-4 w-4" /> Edit
                                </Button>
                                <Button size="icon" variant="ghost" className="text-rose-500 hover:bg-rose-50 hover:text-rose-600" onClick={() => handleDelete(coupon.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* WIZARD MODAL */}
            <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCoupon.id ? 'Edit Coupon' : 'Create New Coupon'}
                            <span className="ml-2 text-slate-500 font-normal text-sm">Step {wizardStep} of 5</span>
                        </DialogTitle>
                    </DialogHeader>

                    {/* WIZARD STEPS CONTENT */}
                    <div className="py-4 min-h-[300px]">
                        {wizardStep === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <h3 className="font-semibold text-pink-600">Step 1: Basic Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <Label>Coupon Code *</Label>
                                        <div className="flex gap-2">
                                            <Input value={editingCoupon.code || ''} onChange={e => setEditingCoupon({ ...editingCoupon, code: e.target.value })} className="bg-slate-50 border-slate-200 font-mono text-lg uppercase text-slate-900" placeholder="EXAMPLE20" />
                                            <Button variant="outline" onClick={handleGenerateCode}>Generate</Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Description *</Label>
                                        <Textarea value={editingCoupon.description || ''} onChange={e => setEditingCoupon({ ...editingCoupon, description: e.target.value })} className="bg-slate-50 border-slate-200 text-slate-900" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type *</Label>
                                        <Select value={editingCoupon.type} onValueChange={v => setEditingCoupon({ ...editingCoupon, type: v as CouponType })}>
                                            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900"><SelectValue /></SelectTrigger>
                                            <SelectContent className="bg-white border-slate-200 text-slate-900"><SelectItem value="percentage">Percentage (%)</SelectItem><SelectItem value="fixed">Fixed Amount (₹)</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Value *</Label>
                                        <Input type="number" value={editingCoupon.value || 0} onChange={e => setEditingCoupon({ ...editingCoupon, value: parseFloat(e.target.value) })} className="bg-slate-50 border-slate-200 text-slate-900" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {wizardStep === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <h3 className="font-semibold text-pink-600">Step 2: Applicability</h3>
                                <div className="space-y-2">
                                    <Label>Apply To Plans</Label>
                                    <Select value={Array.isArray(editingCoupon.applicablePlans) ? 'specific' : 'all'} onValueChange={v => setEditingCoupon({ ...editingCoupon, applicablePlans: v === 'all' ? 'all' : [] })}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 text-slate-900">
                                            <SelectItem value="all">All Plans</SelectItem>
                                            <SelectItem value="specific">Specific Plans</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Min. Purchase Amount (Optional)</Label>
                                        <Input type="number" value={editingCoupon.minPurchaseAmount || ''} onChange={e => setEditingCoupon({ ...editingCoupon, minPurchaseAmount: parseFloat(e.target.value) })} className="bg-slate-50 border-slate-200 text-slate-900" placeholder="₹" />
                                    </div>
                                    {editingCoupon.type === 'percentage' && (
                                        <div className="space-y-2">
                                            <Label>Max Discount Limit (Optional)</Label>
                                            <Input type="number" value={editingCoupon.maxDiscountAmount || ''} onChange={e => setEditingCoupon({ ...editingCoupon, maxDiscountAmount: parseFloat(e.target.value) })} className="bg-slate-50 border-slate-200 text-slate-900" placeholder="₹" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {wizardStep === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <h3 className="font-semibold text-pink-600">Step 3: Usage Limits</h3>
                                <div className="space-y-2">
                                    <Label>Usage Type</Label>
                                    <Select value={editingCoupon.usageType} onValueChange={v => setEditingCoupon({ ...editingCoupon, usageType: v as any })}>
                                        <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 text-slate-900"><SelectItem value="unlimited">Unlimited</SelectItem><SelectItem value="limited">Limited</SelectItem></SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Total Uses Allowed</Label>
                                        <Input type="number" disabled={editingCoupon.usageType === 'unlimited'} value={editingCoupon.totalUsesAllowed || ''} onChange={e => setEditingCoupon({ ...editingCoupon, totalUsesAllowed: parseInt(e.target.value) })} className="bg-slate-50 border-slate-200 text-slate-900" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Uses Per Customer</Label>
                                        <Input type="number" value={editingCoupon.usesPerCustomer || 1} onChange={e => setEditingCoupon({ ...editingCoupon, usesPerCustomer: parseInt(e.target.value) })} className="bg-slate-50 border-slate-200 text-slate-900" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {wizardStep === 4 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <h3 className="font-semibold text-pink-600">Step 4: Validity Period</h3>
                                <div className="space-y-2">
                                    <Label>Validity Type</Label>
                                    <div className="flex items-center space-x-2">
                                        <Switch checked={editingCoupon.validityType === 'always'} onCheckedChange={c => setEditingCoupon({ ...editingCoupon, validityType: c ? 'always' : 'limited' })} />
                                        <Label>Always Active</Label>
                                    </div>
                                </div>
                                {!editingCoupon.validityType || editingCoupon.validityType === 'limited' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Date</Label>
                                            <Input type="date" value={editingCoupon.startDate || ''} onChange={e => setEditingCoupon({ ...editingCoupon, startDate: e.target.value })} className="bg-slate-50 border-slate-200 text-slate-900" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Date</Label>
                                            <Input type="date" value={editingCoupon.endDate || ''} onChange={e => setEditingCoupon({ ...editingCoupon, endDate: e.target.value })} className="bg-slate-50 border-slate-200 text-slate-900" />
                                        </div>
                                    </div>
                                ) : <p className="text-slate-500 italic">This coupon will never expire.</p>}
                            </div>
                        )}

                        {wizardStep === 5 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <h3 className="font-semibold text-pink-600">Step 5: Review & Settings</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                                        <Label>Exclusive Offer (No combining)</Label>
                                        <Switch checked={editingCoupon.isExclusive} onCheckedChange={c => setEditingCoupon({ ...editingCoupon, isExclusive: c })} />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                                        <Label>Display on Website</Label>
                                        <Switch checked={editingCoupon.showOnWebsite} onCheckedChange={c => setEditingCoupon({ ...editingCoupon, showOnWebsite: c })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={editingCoupon.status} onValueChange={v => setEditingCoupon({ ...editingCoupon, status: v as any })}>
                                            <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900"><SelectValue /></SelectTrigger>
                                            <SelectContent className="bg-white border-slate-200 text-slate-900"><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        {wizardStep > 1 && <Button variant="outline" onClick={() => setWizardStep(wizardStep - 1)}>Back</Button>}
                        {wizardStep < 5 && <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => setWizardStep(wizardStep + 1)}>Next</Button>}
                        {wizardStep === 5 && <Button className="bg-green-600 hover:bg-green-700" onClick={handleSaveCoupon}>Save Coupon</Button>}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
