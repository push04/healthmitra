'use client';

import { useState, useEffect } from 'react';
import { Coupon } from '@/types/coupons';
import { getCoupons, upsertCoupon, deleteCoupon } from '@/app/actions/coupons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Search, Copy, Check, Percent, IndianRupee, Calendar, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface CouponFormData {
    id?: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    is_active: boolean;
    valid_until: string;
    usage_limit: number | null;
    used_count: number;
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<CouponFormData>({
        code: '',
        discount_type: 'percentage',
        discount_value: 10,
        is_active: true,
        valid_until: '',
        usage_limit: null,
        used_count: 0
    });

    const loadData = async () => {
        setLoading(true);
        const res = await getCoupons();
        if (res.success && res.data) {
            setCoupons(res.data);
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

    const handleSave = async () => {
        if (!editingCoupon.code) {
            toast.error("Please enter a coupon code");
            return;
        }
        if (!editingCoupon.discount_value || editingCoupon.discount_value <= 0) {
            toast.error("Please enter a valid discount value");
            return;
        }

        const res = await upsertCoupon({
            id: editingCoupon.id,
            code: editingCoupon.code,
            type: editingCoupon.discount_type,
            value: editingCoupon.discount_value,
            status: editingCoupon.is_active ? 'active' : 'inactive',
            endDate: editingCoupon.valid_until || undefined,
            totalUsesAllowed: editingCoupon.usage_limit || undefined
        });

        if (res.success) {
            toast.success(editingCoupon.id ? "Coupon updated!" : "Coupon created!");
            setIsEditOpen(false);
            setEditingCoupon({
                code: '',
                discount_type: 'percentage',
                discount_value: 10,
                is_active: true,
                valid_until: '',
                usage_limit: null,
                used_count: 0
            });
            loadData();
        } else {
            toast.error(res.error || "Failed to save coupon");
        }
    };

    const openCreate = () => {
        setEditingCoupon({
            code: '',
            discount_type: 'percentage',
            discount_value: 10,
            is_active: true,
            valid_until: '',
            usage_limit: null,
            used_count: 0
        });
        setIsEditOpen(true);
    };

    const openEdit = (coupon: Coupon) => {
        setEditingCoupon({
            id: coupon.id,
            code: coupon.code,
            discount_type: coupon.type === 'percentage' ? 'percentage' : 'fixed',
            discount_value: coupon.value,
            is_active: coupon.status === 'active',
            valid_until: coupon.endDate || '',
            usage_limit: coupon.usageType === 'limited' ? coupon.totalUsesAllowed : null,
            used_count: coupon.currentUses
        });
        setIsEditOpen(true);
    };

    const filteredCoupons = coupons.filter(c => 
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = coupons.filter(c => c.status === 'active').length;
    const totalUses = coupons.reduce((sum, c) => sum + c.currentUses, 0);

    return (
        <div className="space-y-6 animate-in fade-in max-w-[1600px] mx-auto p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Coupon Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Create and manage discount codes for your customers.</p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Create Coupon
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Coupons</p>
                            <h3 className="text-2xl font-bold text-slate-800">{coupons.length}</h3>
                        </div>
                        <Percent className="h-8 w-8 text-teal-600/20" />
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Active Coupons</p>
                            <h3 className="text-2xl font-bold text-green-600">{activeCount}</h3>
                        </div>
                        <Check className="h-8 w-8 text-green-600/20" />
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Uses</p>
                            <h3 className="text-2xl font-bold text-slate-800">{totalUses}</h3>
                        </div>
                        <Users className="h-8 w-8 text-blue-600/20" />
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Avg. Discount</p>
                            <h3 className="text-2xl font-bold text-slate-800">
                                {coupons.length > 0 ? Math.round(coupons.reduce((s, c) => s + c.value, 0) / coupons.length) : 0}%
                            </h3>
                        </div>
                        <TrendingUp className="h-8 w-8 text-purple-600/20" />
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Search coupon codes..." 
                        className="pl-9 bg-white border-slate-200" 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                    />
                </div>
            </div>

            {/* Coupon Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            ) : filteredCoupons.length === 0 ? (
                <Card className="bg-white border-slate-200 p-12 text-center">
                    <Percent className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No coupons found. Create your first coupon!</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCoupons.map(coupon => (
                        <Card key={coupon.id} className="bg-white border-slate-200 hover:border-teal-300 hover:shadow-md transition-all">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-slate-100 border border-slate-200 rounded px-3 py-1 font-mono font-bold text-lg text-slate-700 tracking-widest flex items-center gap-2">
                                        {coupon.code}
                                        <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400" onClick={() => handleCopy(coupon.code)}>
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <Badge className={coupon.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                        {coupon.status}
                                    </Badge>
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-3xl font-bold text-slate-800">
                                        {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                                        <span className="text-sm font-normal text-slate-500 ml-1">OFF</span>
                                    </h3>
                                </div>

                                <div className="space-y-2 text-sm text-slate-500 border-t border-slate-100 pt-4">
                                    <div className="flex justify-between">
                                        <span>Used:</span>
                                        <span className="text-slate-700">{coupon.currentUses} {coupon.usageType === 'limited' ? `/ ${coupon.totalUsesAllowed}` : ''}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Expires:</span>
                                        <span className="text-slate-700">{coupon.endDate || 'Never'}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Button className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200" onClick={() => openEdit(coupon)}>
                                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                                    </Button>
                                    <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(coupon.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit/Create Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-white border-slate-200 max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingCoupon.id ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Coupon Code *</Label>
                            <div className="flex gap-2">
                                <Input 
                                    value={editingCoupon.code} 
                                    onChange={e => setEditingCoupon({...editingCoupon, code: e.target.value.toUpperCase()})} 
                                    className="font-mono uppercase" 
                                    placeholder="SUMMER20" 
                                />
                                <Button variant="outline" onClick={handleGenerateCode}>Generate</Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Discount Type *</Label>
                                <Select 
                                    value={editingCoupon.discount_type} 
                                    onValueChange={(v: 'percentage' | 'fixed') => setEditingCoupon({...editingCoupon, discount_type: v})}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Discount Value *</Label>
                                <Input 
                                    type="number" 
                                    value={editingCoupon.discount_value} 
                                    onChange={e => setEditingCoupon({...editingCoupon, discount_value: parseFloat(e.target.value) || 0})} 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Usage Limit (leave empty for unlimited)</Label>
                            <Input 
                                type="number" 
                                value={editingCoupon.usage_limit || ''} 
                                onChange={e => setEditingCoupon({...editingCoupon, usage_limit: e.target.value ? parseInt(e.target.value) : null})} 
                                placeholder="100"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Expiry Date (leave empty for no expiry)</Label>
                            <Input 
                                type="date" 
                                value={editingCoupon.valid_until} 
                                onChange={e => setEditingCoupon({...editingCoupon, valid_until: e.target.value})} 
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded border">
                            <Label>Active</Label>
                            <Switch 
                                checked={editingCoupon.is_active} 
                                onCheckedChange={c => setEditingCoupon({...editingCoupon, is_active: c})} 
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSave}>
                            {editingCoupon.id ? 'Update' : 'Create'} Coupon
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
