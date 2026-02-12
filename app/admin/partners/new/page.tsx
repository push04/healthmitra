'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { createPartner } from '@/app/actions/partners';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddPartnerPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', phone: '', altPhone: '',
        referralCode: '', commissionPercent: 10,
        city: '', state: '', address: '', pincode: '',
        canAddSubPartners: false, designationAccess: false,
        bankName: '', branchName: '', accountHolder: '',
        accountNumber: '', ifscCode: '', accountType: 'Savings' as const,
    });

    const update = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

    const handleSave = async () => {
        if (!form.name || !form.email || !form.referralCode) {
            toast.error('Please fill required fields'); return;
        }
        setSaving(true);
        const res = await createPartner({
            name: form.name, email: form.email, phone: form.phone,
            referralCode: form.referralCode, commissionPercent: form.commissionPercent,
            city: form.city, state: form.state, address: form.address, pincode: form.pincode,
            canAddSubPartners: form.canAddSubPartners, designationAccess: form.designationAccess,
            status: 'active', kycStatus: 'pending', mouSigned: false,
            totalSales: 0, totalCommission: 0, totalSubPartners: 0, joinedDate: new Date().toISOString().split('T')[0],
            bankDetails: form.bankName ? {
                bankName: form.bankName, branchName: form.branchName,
                accountHolder: form.accountHolder, accountNumber: form.accountNumber,
                ifscCode: form.ifscCode, accountType: form.accountType,
            } : undefined,
        });
        if (res.success) { toast.success(res.message); router.push('/admin/partners'); }
        setSaving(false);
    };

    return (
        <div className="space-y-6 py-6 max-w-4xl mx-auto animate-in fade-in">
            <div className="flex items-center gap-3">
                <Link href="/admin/partners"><Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900"><ArrowLeft className="h-5 w-5" /></Button></Link>
                <div><h1 className="text-2xl font-bold text-slate-900">Add New Partner</h1><p className="text-slate-500 text-sm">Create a new referral partner account.</p></div>
            </div>

            {/* Basic Details */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Partner Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label className="text-slate-600">Partner Name *</Label><Input value={form.name} onChange={e => update('name', e.target.value)} className="bg-white border-slate-200 text-slate-900 mt-1" /></div>
                    <div><Label className="text-slate-600">Email *</Label><Input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="bg-white border-slate-200 text-slate-900 mt-1" /></div>
                    <div><Label className="text-slate-600">Phone</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} className="bg-white border-slate-200 text-slate-900 mt-1" /></div>
                    <div><Label className="text-slate-600">Alt Phone</Label><Input value={form.altPhone} onChange={e => update('altPhone', e.target.value)} className="bg-white border-slate-200 text-slate-900 mt-1" /></div>
                    <div><Label className="text-slate-600">Referral Code *</Label><Input value={form.referralCode} onChange={e => update('referralCode', e.target.value)} placeholder="e.g. PTR-2024-001" className="bg-white border-slate-200 text-slate-900 mt-1" /></div>
                    <div><Label className="text-slate-600">Commission %</Label><Input type="number" value={form.commissionPercent} onChange={e => update('commissionPercent', +e.target.value)} className="bg-white border-slate-200 text-slate-900 mt-1" /></div>
                </CardContent>
            </Card>

            {/* Address */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Address</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2"><Label className="text-slate-600">Address</Label><Input value={form.address} onChange={e => update('address', e.target.value)} className="bg-white border-slate-200 text-slate-900 mt-1" /></div>
                    <div><Label className="text-slate-600">City</Label><Input value={form.city} onChange={e => update('city', e.target.value)} className="bg-white border-slate-200 text-slate-900 mt-1" /></div>
                    <div><Label className="text-slate-600">State</Label><Input value={form.state} onChange={e => update('state', e.target.value)} className="bg-white border-slate-200 text-slate-900 mt-1" /></div>
                    <div><Label className="text-slate-600">Pincode</Label><Input value={form.pincode} onChange={e => update('pincode', e.target.value)} className="bg-white border-slate-200 text-slate-900 mt-1" /></div>
                </CardContent>
            </Card>

            {/* Bank Details */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Bank Details (for Payout)</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label className="text-slate-600">Bank Name</Label><Input value={form.bankName} onChange={e => update('bankName', e.target.value)} className="bg-white border-slate-200 text-slate-900 mt-1" /></div>
                    <div><Label className="text-slate-600">Branch Name</Label><Input value={form.branchName} onChange={e => update('branchName', e.target.value)} className="bg-white border-slate-200 text-slate-900 mt-1" /></div>
                    <div><Label className="text-slate-600">Account Holder Name</Label><Input value={form.accountHolder} onChange={e => update('accountHolder', e.target.value)} className="bg-white border-slate-200 text-slate-900 mt-1" /></div>
                    <div><Label className="text-slate-600">Account Number</Label><Input value={form.accountNumber} onChange={e => update('accountNumber', e.target.value)} className="bg-white border-slate-200 text-slate-900 mt-1" /></div>
                    <div><Label className="text-slate-600">IFSC Code</Label><Input value={form.ifscCode} onChange={e => update('ifscCode', e.target.value)} className="bg-white border-slate-200 text-slate-900 mt-1" /></div>
                    <div>
                        <Label className="text-slate-600">Account Type</Label>
                        <Select value={form.accountType} onValueChange={v => update('accountType', v)}>
                            <SelectTrigger className="bg-white border-slate-200 text-slate-700 mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white border-slate-200 text-slate-700">
                                <SelectItem value="Savings">Savings</SelectItem>
                                <SelectItem value="Current">Current</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Permissions */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Permissions</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Checkbox checked={form.canAddSubPartners} onCheckedChange={v => update('canAddSubPartners', v)} />
                        <div><p className="text-sm font-medium text-slate-800">Allow Sub-Partners</p><p className="text-xs text-slate-400">Partner can add and manage their own sub-partner network.</p></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Checkbox checked={form.designationAccess} onCheckedChange={v => update('designationAccess', v)} />
                        <div><p className="text-sm font-medium text-slate-800">Designation Access</p><p className="text-xs text-slate-400">Partner can assign designations and manage access for sub-partners.</p></div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
                <Link href="/admin/partners"><Button variant="outline" className="border-slate-200 text-slate-600">Cancel</Button></Link>
                <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Create Partner
                </Button>
            </div>
        </div>
    );
}
