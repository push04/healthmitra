'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    ArrowLeft, Save, Building2, Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { Franchise, DEFAULT_MODULES, FranchiseModule } from '@/types/franchise';
import { createFranchise, assignModules } from '@/app/actions/franchise';
import Link from 'next/link';

export default function AddFranchisePage() {
    const [franchise, setFranchise] = useState<Partial<Franchise>>({
        name: '', startDate: '', endDate: '', contact: '', altContact: '',
        email: '', password: '', referralCode: '', website: '', gst: '',
        commissionPercent: 10, kycStatus: 'pending', verificationStatus: 'unverified',
        address: '', city: '', state: '', payoutDelay: 7, status: 'active',
    });

    const [modules, setModules] = useState<FranchiseModule[]>(
        DEFAULT_MODULES.map(m => ({ ...m }))
    );

    const update = (updates: Partial<Franchise>) => setFranchise(prev => ({ ...prev, ...updates }));

    const toggleModuleAccess = (moduleId: string, field: keyof FranchiseModule) => {
        setModules(prev => prev.map(m =>
            m.id === moduleId ? { ...m, [field]: !m[field] } : m
        ));
    };

    const handleSave = async () => {
        const res = await createFranchise(franchise);
        if (res.success) {
            await assignModules('new_franchise', modules);
            toast.success('Franchise created successfully');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in py-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/franchises">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Add New Franchise</h1>
                        <p className="text-sm text-slate-500">Fill in all details to register a new franchise partner.</p>
                    </div>
                </div>
                <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Save className="mr-2 h-4 w-4" /> Save Franchise
                </Button>
            </div>

            {/* Basic Details */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-slate-700 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-teal-500" /> Franchise Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Franchise Name *" value={franchise.name} onChange={v => update({ name: v })} placeholder="e.g. HealthMitra Delhi NCR" />
                        <Field label="Email *" value={franchise.email} onChange={v => update({ email: v })} placeholder="email@domain.com" type="email" />
                        <Field label="Password *" value={franchise.password} onChange={v => update({ password: v })} placeholder="Login password" type="password" />
                        <Field label="Referral Code *" value={franchise.referralCode} onChange={v => update({ referralCode: v })} placeholder="e.g. HMDEL2024" />
                        <Field label="Contact Number *" value={franchise.contact} onChange={v => update({ contact: v })} placeholder="+91 98765 00001" />
                        <Field label="Alternate Contact" value={franchise.altContact} onChange={v => update({ altContact: v })} placeholder="+91 98765 00002" />
                        <Field label="Start Date *" value={franchise.startDate} onChange={v => update({ startDate: v })} type="date" />
                        <Field label="End Date *" value={franchise.endDate} onChange={v => update({ endDate: v })} type="date" />
                        <Field label="Website" value={franchise.website} onChange={v => update({ website: v })} placeholder="https://..." />
                        <Field label="GST Number" value={franchise.gst} onChange={v => update({ gst: v })} placeholder="GST registration number" />
                    </div>
                </CardContent>
            </Card>

            {/* Address */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-slate-700">Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-slate-600">Full Address</Label>
                        <Textarea value={franchise.address} onChange={e => update({ address: e.target.value })} placeholder="Street address..." className="bg-white border-slate-200 text-slate-900" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="City *" value={franchise.city} onChange={v => update({ city: v })} placeholder="e.g. New Delhi" />
                        <Field label="State *" value={franchise.state} onChange={v => update({ state: v })} placeholder="e.g. Delhi" />
                    </div>
                </CardContent>
            </Card>

            {/* Commission & Payout */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-slate-700">Financial Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-600">Commission (%)</Label>
                            <Input type="number" value={franchise.commissionPercent} onChange={e => update({ commissionPercent: parseFloat(e.target.value) })} className="bg-white border-slate-200 text-slate-900" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600">Payout Delay (days)</Label>
                            <Input type="number" value={franchise.payoutDelay} onChange={e => update({ payoutDelay: parseInt(e.target.value) })} className="bg-white border-slate-200 text-slate-900" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600">KYC Status</Label>
                            <Select value={franchise.kycStatus} onValueChange={v => update({ kycStatus: v as any })}>
                                <SelectTrigger className="bg-white border-slate-200 text-slate-900"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-white border-slate-200 text-slate-900">
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Module Assignment */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-slate-700 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-teal-500" /> Module Assignment
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 border-slate-200">
                                <TableHead className="text-slate-600 font-semibold">S.No.</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Module Name</TableHead>
                                <TableHead className="text-slate-600 font-semibold text-center">Add</TableHead>
                                <TableHead className="text-slate-600 font-semibold text-center">Edit</TableHead>
                                <TableHead className="text-slate-600 font-semibold text-center">Delete</TableHead>
                                <TableHead className="text-slate-600 font-semibold text-center">Upload</TableHead>
                                <TableHead className="text-slate-600 font-semibold text-center">Download</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {modules.map(m => (
                                <TableRow key={m.id} className="border-slate-100">
                                    <TableCell className="text-slate-500 font-mono text-sm">{m.sno}</TableCell>
                                    <TableCell className="font-medium text-slate-800">{m.moduleName}</TableCell>
                                    {(['addAccess', 'editAccess', 'deleteAccess', 'uploadAccess', 'downloadAccess'] as const).map(field => (
                                        <TableCell key={field} className="text-center">
                                            <Checkbox checked={m[field]} onCheckedChange={() => toggleModuleAccess(m.id, field)} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
    label: string; value?: string | number; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
    return (
        <div className="space-y-2">
            <Label className="text-slate-600">{label}</Label>
            <Input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="bg-white border-slate-200 text-slate-900" />
        </div>
    );
}
