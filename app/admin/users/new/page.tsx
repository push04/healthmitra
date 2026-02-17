'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, Save, User as UserIcon, Building2, MapPin, Shield, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { createUser, getDepartments } from '@/app/actions/users';
import { UserType } from '@/types/user';

const STEPS = [
    { id: 1, title: 'Basic Info', icon: UserIcon },
    { id: 2, title: 'Role & Department', icon: Building2 },
    { id: 3, title: 'Location', icon: MapPin },
    { id: 4, title: 'Permissions', icon: Shield },
];

export default function NewUserPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        type: 'Customer' as any, // Cast to any or UserType to avoid conflict with string
        departmentId: '', // For Employees
        designation: '',
        city: '',
        state: '',
        status: 'active',
        // Partner specific
        referralCode: '',
        commissionRate: '10',
    });

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getDepartments();
                if (res.success && res.data) setDepartments(res.data);
            } catch (e) {
                console.error("Failed to load departments", e);
            }
        };
        load();
    }, []);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        // Validation logic per step
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.phone) {
                toast.error("Please fill in all basic fields");
                return;
            }
        }
        if (step < STEPS.length) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            // @ts-ignore
            const res = await createUser(formData);
            if (res.success) {
                toast.success('User created successfully');
                router.push('/admin/users');
            } else {
                // @ts-ignore
                toast.error(res.error || res.message || 'Failed to create user');
            }
        } catch (error) {
            toast.error('An error occurred');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 space-y-8 animate-in fade-in">
            {/* Header */}
            <div>
                <Button variant="ghost" className="mb-4 pl-0 text-slate-500 hover:text-teal-600" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
                </Button>
                <h1 className="text-3xl font-bold text-slate-900">Add New User</h1>
                <p className="text-slate-500 mt-1">Create a new user account with specific roles and permissions.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Stepper */}
                <div className="w-full lg:w-64 shrink-0">
                    <div className="sticky top-6 space-y-1">
                        {STEPS.map((s, i) => (
                            <div
                                key={s.id}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${step === s.id ? 'bg-teal-50 text-teal-700 font-medium border border-teal-100' :
                                    step > s.id ? 'text-emerald-600' : 'text-slate-400'
                                    }`}
                            >
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${step === s.id ? 'bg-white border-teal-200 text-teal-600' :
                                    step > s.id ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200'
                                    }`}>
                                    {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                                </div>
                                <span className="text-sm">{s.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg text-slate-800">{STEPS[step - 1].title}</CardTitle>
                            <CardDescription>Enter the details for step {step} of {STEPS.length}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 h-[400px]">
                            {/* STEP 1: BASIC INFO */}
                            {step === 1 && (
                                <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <div className="grid gap-2">
                                        <Label>Full Name</Label>
                                        <Input placeholder="e.g. John Doe" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Email Address</Label>
                                        <Input type="email" placeholder="e.g. john@example.com" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Phone Number</Label>
                                        <Input placeholder="e.g. +91 9876543210" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: ROLE & DEPARTMENT */}
                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <div className="grid gap-2">
                                        <Label>User Role</Label>
                                        <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Customer">Customer (Member)</SelectItem>
                                                <SelectItem value="Employee">Employee (Internal)</SelectItem>
                                                <SelectItem value="Admin">Administrator</SelectItem>
                                                <SelectItem value="Referral Partner">Referral Partner</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-slate-500">
                                            {formData.type === 'Customer' && "Standard user with access to health plans and services."}
                                            {formData.type === 'Employee' && "Internal staff member belonging to a department."}
                                            {formData.type === 'Admin' && "Full access to the admin dashboard and settings."}
                                            {formData.type === 'Referral Partner' && "External partner managing referrals and commissions."}
                                        </p>
                                    </div>

                                    {formData.type === 'Employee' && (
                                        <>
                                            <div className="grid gap-2">
                                                <Label>Department</Label>
                                                <Select value={formData.departmentId} onValueChange={(v) => handleChange('departmentId', v)}>
                                                    <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                                                    <SelectContent>
                                                        {departments.map((d: any) => (
                                                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Designation</Label>
                                                <Input placeholder="e.g. Senior Manager" value={formData.designation} onChange={e => handleChange('designation', e.target.value)} />
                                            </div>
                                        </>
                                    )}

                                    {formData.type === 'Referral Partner' && (
                                        <>
                                            <div className="grid gap-2">
                                                <Label>Commission Rate (%)</Label>
                                                <Input type="number" value={formData.commissionRate} onChange={e => handleChange('commissionRate', e.target.value)} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Custom Referral Code (Optional)</Label>
                                                <Input placeholder="Leave blank to auto-generate" value={formData.referralCode} onChange={e => handleChange('referralCode', e.target.value)} />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* STEP 3: LOCATION */}
                            {step === 3 && (
                                <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <div className="grid gap-2">
                                        <Label>City</Label>
                                        <Input placeholder="e.g. Mumbai" value={formData.city} onChange={e => handleChange('city', e.target.value)} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>State</Label>
                                        <Input placeholder="e.g. Maharashtra" value={formData.state} onChange={e => handleChange('state', e.target.value)} />
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-100">
                                        <p>Additional address details can be added by the user later from their profile settings.</p>
                                    </div>
                                </div>
                            )}

                            {/* STEP 4: PERMISSIONS */}
                            {step === 4 && (
                                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                    <div className="grid gap-2">
                                        <Label>Initial Status</Label>
                                        <RadioGroup value={formData.status} onValueChange={(v) => handleChange('status', v)} className="flex gap-4">
                                            <div className={`flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer hover:bg-slate-50 transition-colors ${formData.status === 'active' ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200'}`}>
                                                <RadioGroupItem value="active" id="active" />
                                                <Label htmlFor="active" className="cursor-pointer">Active</Label>
                                            </div>
                                            <div className={`flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer hover:bg-slate-50 transition-colors ${formData.status === 'inactive' ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200'}`}>
                                                <RadioGroupItem value="inactive" id="inactive" />
                                                <Label htmlFor="inactive" className="cursor-pointer">Inactive</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="welcome" defaultChecked />
                                            <Label htmlFor="welcome">Send welcome email with login credentials</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="verify" defaultChecked />
                                            <Label htmlFor="verify">Mark email as verified (skip verification)</Label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between">
                            <Button variant="outline" onClick={handleBack} disabled={step === 1} className="w-32">
                                Back
                            </Button>
                            {step === STEPS.length ? (
                                <Button onClick={handleSubmit} disabled={submitting} className="w-32 bg-teal-600 hover:bg-teal-700 text-white">
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Create User</>}
                                </Button>
                            ) : (
                                <Button onClick={handleNext} className="w-32">
                                    Next
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
