'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomer, generatePassword, FamilyMemberInput } from '@/app/actions/customers';
import { getPlans } from '@/app/actions/plans';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft, Loader2, Save, User as UserIcon, CreditCard,
    Shield, CheckCircle2, Eye, EyeOff, RefreshCw, Plus, Trash2,
    Copy, Check
} from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
    { id: 1, title: 'Personal Info', icon: UserIcon },
    { id: 2, title: 'Plan & Members', icon: CreditCard },
    { id: 3, title: 'Credentials', icon: Shield },
    { id: 4, title: 'Review & Create', icon: CheckCircle2 },
];

const RELATIONS = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Sibling', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = [{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'Other', label: 'Other' }];

export default function NewCustomerPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);
    const [copied, setCopied] = useState(false);
    const [createdUserId, setCreatedUserId] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dob: '',
        gender: '',
        bloodGroup: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        planId: '',
        validFrom: new Date().toISOString().split('T')[0],
        password: generatePassword(),
        showPassword: false,
    });

    const [familyMembers, setFamilyMembers] = useState<FamilyMemberInput[]>([]);

    useEffect(() => {
        const load = async () => {
            const res = await getPlans({ status: 'active' });
            if (res.success && res.data) setPlans(res.data);
        };
        load();
    }, []);

    const set = (field: string, value: string | boolean) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    const addFamilyMember = () => {
        setFamilyMembers(prev => [...prev, {
            fullName: '', relation: 'Spouse', dob: '', gender: '', bloodGroup: '', contactNumber: '', email: '', aadhaarLast4: ''
        }]);
    };

    const updateMember = (idx: number, field: keyof FamilyMemberInput, value: string) => {
        setFamilyMembers(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
    };

    const removeMember = (idx: number) => {
        setFamilyMembers(prev => prev.filter((_, i) => i !== idx));
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.fullName.trim()) { toast.error('Full name is required'); return; }
            if (!formData.email.trim()) { toast.error('Email is required'); return; }
            if (!formData.phone.trim()) { toast.error('Phone number is required'); return; }
            const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRe.test(formData.email)) { toast.error('Enter a valid email address'); return; }
        }
        if (step === 3) {
            if (!formData.password || formData.password.length < 8) {
                toast.error('Password must be at least 8 characters');
                return;
            }
        }
        if (step < STEPS.length) setStep(s => s + 1);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await createCustomer({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                dob: formData.dob || undefined,
                gender: formData.gender || undefined,
                bloodGroup: formData.bloodGroup || undefined,
                address: formData.address || undefined,
                city: formData.city || undefined,
                state: formData.state || undefined,
                pincode: formData.pincode || undefined,
                password: formData.password,
                planId: formData.planId || undefined,
                validFrom: formData.planId ? formData.validFrom : undefined,
                familyMembers: familyMembers.filter(m => m.fullName.trim()),
            });

            if (res.success) {
                setCreatedUserId(res.userId || '');
                toast.success('Customer created successfully!');
                if (res.warning) toast.warning(res.warning);
            } else {
                toast.error(res.error || 'Failed to create customer');
            }
        } catch (err) {
            toast.error('An unexpected error occurred');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const selectedPlan = plans.find(p => p.id === formData.planId);

    if (createdUserId) {
        return (
            <div className="max-w-2xl mx-auto py-16 text-center space-y-6 animate-in fade-in">
                <div className="h-20 w-20 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Customer Created!</h2>
                    <p className="text-slate-500 mt-1">The customer account has been set up successfully.</p>
                </div>
                <Card className="border-slate-200 shadow-sm text-left">
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-500">Full Name</p>
                                <p className="font-medium text-slate-900">{formData.fullName}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Email</p>
                                <p className="font-medium text-slate-900">{formData.email}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Phone</p>
                                <p className="font-medium text-slate-900">{formData.phone}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Plan Assigned</p>
                                <p className="font-medium text-slate-900">{selectedPlan?.name || 'None'}</p>
                            </div>
                        </div>
                        <div className="border-t border-slate-100 pt-4">
                            <p className="text-slate-500 text-sm mb-2">Login Credentials</p>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Email:</span>
                                    <span className="text-slate-900">{formData.email}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Password:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-900">{formData.password}</span>
                                        <button onClick={() => copyToClipboard(`Email: ${formData.email}\nPassword: ${formData.password}`)}>
                                            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-slate-400 hover:text-slate-700" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-amber-600 mt-2">Share these credentials securely. The customer should change their password on first login.</p>
                        </div>
                    </CardContent>
                </Card>
                <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => router.push('/admin/customers')}>
                        Back to Customers
                    </Button>
                    <Button onClick={() => router.push(`/admin/users/${createdUserId}`)} className="bg-teal-600 hover:bg-teal-700 text-white">
                        View Customer Profile
                    </Button>
                    <Button variant="outline" onClick={() => { setCreatedUserId(''); setStep(1); setFormData(prev => ({ ...prev, fullName: '', email: '', phone: '', dob: '', gender: '', bloodGroup: '', address: '', city: '', state: '', pincode: '', planId: '', validFrom: new Date().toISOString().split('T')[0], password: generatePassword() })); setFamilyMembers([]); }}>
                        Add Another
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 space-y-8 animate-in fade-in">
            {/* Header */}
            <div>
                <Button variant="ghost" className="mb-4 pl-0 text-slate-500 hover:text-teal-600" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customers
                </Button>
                <h1 className="text-3xl font-bold text-slate-900">Add New Customer</h1>
                <p className="text-slate-500 mt-1">Manually create a customer account, assign a plan, and set login credentials.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Stepper */}
                <div className="w-full lg:w-64 shrink-0">
                    <div className="sticky top-6 space-y-1">
                        {STEPS.map(s => (
                            <div
                                key={s.id}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${step === s.id ? 'bg-teal-50 text-teal-700 font-medium border border-teal-100' :
                                    step > s.id ? 'text-emerald-600' : 'text-slate-400'}`}
                            >
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${step === s.id ? 'bg-white border-teal-200 text-teal-600' :
                                    step > s.id ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200'}`}>
                                    {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                                </div>
                                <span className="text-sm">{s.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div className="flex-1">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg text-slate-800">{STEPS[step - 1].title}</CardTitle>
                            <CardDescription>Step {step} of {STEPS.length}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">

                            {/* STEP 1: Personal Info */}
                            {step === 1 && (
                                <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5 md:col-span-2">
                                            <Label>Full Name <span className="text-red-500">*</span></Label>
                                            <Input placeholder="e.g. Rahul Sharma" value={formData.fullName} onChange={e => set('fullName', e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Email Address <span className="text-red-500">*</span></Label>
                                            <Input type="email" placeholder="e.g. rahul@example.com" value={formData.email} onChange={e => set('email', e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Phone Number <span className="text-red-500">*</span></Label>
                                            <Input placeholder="+91 9876543210" value={formData.phone} onChange={e => set('phone', e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Date of Birth</Label>
                                            <Input type="date" value={formData.dob} onChange={e => set('dob', e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Gender</Label>
                                            <Select value={formData.gender} onValueChange={v => set('gender', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                                                <SelectContent>
                                                    {GENDERS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Blood Group</Label>
                                            <Select value={formData.bloodGroup} onValueChange={v => set('bloodGroup', v)}>
                                                <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                                                <SelectContent>
                                                    {BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5 md:col-span-2">
                                            <Label>Address</Label>
                                            <Input placeholder="Street address" value={formData.address} onChange={e => set('address', e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>City</Label>
                                            <Input placeholder="e.g. Mumbai" value={formData.city} onChange={e => set('city', e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>State</Label>
                                            <Input placeholder="e.g. Maharashtra" value={formData.state} onChange={e => set('state', e.target.value)} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>PIN Code</Label>
                                            <Input placeholder="e.g. 400001" value={formData.pincode} onChange={e => set('pincode', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Plan & Family Members */}
                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                    {/* Plan Selection */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold">Assign Health Plan (Optional)</Label>
                                        <div className="grid gap-3">
                                            {plans.map(plan => (
                                                <label
                                                    key={plan.id}
                                                    className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${formData.planId === plan.id ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="plan"
                                                        value={plan.id}
                                                        checked={formData.planId === plan.id}
                                                        onChange={() => set('planId', plan.id)}
                                                        className="mt-1 accent-teal-600"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium text-slate-900">{plan.name}</span>
                                                            <span className="text-teal-600 font-semibold">₹{plan.basePrice?.toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {plan.validityValue || 1} year validity • {plan.services?.length || 0} services
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                            <label className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${!formData.planId ? 'border-slate-400 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                                <input
                                                    type="radio"
                                                    name="plan"
                                                    value=""
                                                    checked={!formData.planId}
                                                    onChange={() => set('planId', '')}
                                                    className="mt-1"
                                                />
                                                <div>
                                                    <span className="font-medium text-slate-700">No Plan (Assign Later)</span>
                                                    <p className="text-xs text-slate-400 mt-0.5">Create account only, assign plan separately</p>
                                                </div>
                                            </label>
                                        </div>

                                        {formData.planId && (
                                            <div className="space-y-1.5 mt-2">
                                                <Label>Plan Start Date</Label>
                                                <Input
                                                    type="date"
                                                    value={formData.validFrom}
                                                    onChange={e => set('validFrom', e.target.value)}
                                                    className="max-w-xs"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Family Members */}
                                    <div className="space-y-3 pt-2 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-semibold">Family Members (Optional)</Label>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addFamilyMember}
                                                className="text-teal-600 border-teal-300 hover:bg-teal-50"
                                            >
                                                <Plus className="h-3.5 w-3.5 mr-1" /> Add Member
                                            </Button>
                                        </div>
                                        {familyMembers.length === 0 && (
                                            <p className="text-sm text-slate-400 italic">No family members added. You can add them later from the customer profile.</p>
                                        )}
                                        {familyMembers.map((member, idx) => (
                                            <Card key={idx} className="border-slate-200 bg-slate-50/50">
                                                <CardContent className="p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-slate-700">Member {idx + 1}</span>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => removeMember(idx)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1 col-span-2">
                                                            <Label className="text-xs">Full Name</Label>
                                                            <Input
                                                                placeholder="Member's full name"
                                                                value={member.fullName}
                                                                onChange={e => updateMember(idx, 'fullName', e.target.value)}
                                                                className="h-8 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Relation</Label>
                                                            <Select value={member.relation} onValueChange={v => updateMember(idx, 'relation', v)}>
                                                                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    {RELATIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Gender</Label>
                                                            <Select value={member.gender || ''} onValueChange={v => updateMember(idx, 'gender', v)}>
                                                                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                                                <SelectContent>
                                                                    {GENDERS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Date of Birth</Label>
                                                            <Input type="date" value={member.dob || ''} onChange={e => updateMember(idx, 'dob', e.target.value)} className="h-8 text-sm" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">Blood Group</Label>
                                                            <Select value={member.bloodGroup || ''} onValueChange={v => updateMember(idx, 'bloodGroup', v)}>
                                                                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                                                <SelectContent>
                                                                    {BLOOD_GROUPS.map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Credentials */}
                            {step === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                                        A unique password will be generated for this customer. You can share these credentials securely after creation.
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Login Email</Label>
                                        <Input value={formData.email} readOnly className="bg-slate-50 text-slate-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Password <span className="text-red-500">*</span></Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type={formData.showPassword ? 'text' : 'password'}
                                                value={formData.password}
                                                onChange={e => set('password', e.target.value)}
                                                className="font-mono"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => set('showPassword', !formData.showPassword)}
                                            >
                                                {formData.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => set('password', generatePassword())}
                                                title="Generate new password"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-slate-500">Minimum 8 characters. Use the refresh button to auto-generate a strong password.</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                        <p className="text-sm font-medium text-slate-700">Credentials Preview</p>
                                        <div className="font-mono text-sm space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Email:</span>
                                                <span className="text-slate-800">{formData.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Password:</span>
                                                <span className="text-slate-800">{formData.password}</span>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="mt-1"
                                            onClick={() => { copyToClipboard(`Email: ${formData.email}\nPassword: ${formData.password}`); toast.success('Copied to clipboard'); }}
                                        >
                                            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                                            {copied ? 'Copied!' : 'Copy Credentials'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: Review */}
                            {step === 4 && (
                                <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <p className="text-sm text-slate-500">Review all details before creating the customer account.</p>
                                    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                                        {[
                                            { label: 'Full Name', value: formData.fullName },
                                            { label: 'Email', value: formData.email },
                                            { label: 'Phone', value: formData.phone },
                                            { label: 'Date of Birth', value: formData.dob || '—' },
                                            { label: 'Gender', value: GENDERS.find(g => g.value === formData.gender)?.label || '—' },
                                            { label: 'Blood Group', value: formData.bloodGroup || '—' },
                                            { label: 'City / State', value: [formData.city, formData.state].filter(Boolean).join(', ') || '—' },
                                            { label: 'Plan', value: selectedPlan ? `${selectedPlan.name} (from ${formData.validFrom})` : 'None' },
                                            { label: 'Family Members', value: familyMembers.filter(m => m.fullName).length > 0 ? `${familyMembers.filter(m => m.fullName).length} member(s)` : 'None' },
                                        ].map(row => (
                                            <div key={row.label} className="flex justify-between px-4 py-3 text-sm">
                                                <span className="text-slate-500">{row.label}</span>
                                                <span className="font-medium text-slate-900 text-right max-w-xs truncate">{row.value}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between px-4 py-3 text-sm bg-slate-50">
                                            <span className="text-slate-500">Password</span>
                                            <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                                                Set ({formData.password.length} chars)
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                                        The customer will receive a pre-verified account. Share their credentials securely after creation.
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between">
                            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 1} className="w-32">
                                Back
                            </Button>
                            {step === STEPS.length ? (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-40 bg-teal-600 hover:bg-teal-700 text-white"
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Create Customer</>}
                                </Button>
                            ) : (
                                <Button onClick={handleNext} className="w-32 bg-teal-600 hover:bg-teal-700 text-white">
                                    Next →
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
