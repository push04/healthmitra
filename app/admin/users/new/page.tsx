'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Save, UploadCloud, File, CheckCircle } from 'lucide-react';
import { User, UserType, MOCK_USERS } from '@/app/lib/mock/users-data';
import { MOCK_DEPARTMENTS } from '@/app/lib/mock/departments';
import { createUser } from '@/app/actions/users';
import { toast } from 'sonner';
import Link from 'next/link';

// Helper to mock file upload
const MockFileUpload = ({ label }: { label: string }) => (
    <div className="border border-dashed border-slate-300 bg-slate-50/50 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors">
        <UploadCloud className="mx-auto h-8 w-8 text-slate-400 mb-2" />
        <div className="text-sm font-medium text-slate-700">{label}</div>
        <div className="text-xs text-slate-500 mt-1">Drag & drop or click to upload</div>
    </div>
);

// Helper for Permission Item
const PermissionItem = ({ label, id, checked, onChange }: { label: string, id: string, checked: boolean, onChange: (c: boolean) => void }) => (
    <div className="flex items-center space-x-2 py-1">
        <Checkbox id={id} checked={checked} onCheckedChange={(c) => onChange(c as boolean)} className="border-slate-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600" />
        <label htmlFor={id} className="text-sm text-slate-700 cursor-pointer select-none">{label}</label>
    </div>
);

const INITIAL_USER: Partial<User> = {
    type: 'Customer',
    name: '',
    email: '',
    phone: '',
    status: 'active',
    gender: 'Male',
    permissions: []
};

export default function CreateUserWizard() {
    const [step, setStep] = useState(1);
    const [user, setUser] = useState<Partial<User>>(INITIAL_USER);
    const [submitting, setSubmitting] = useState(false);

    const updateUser = (updates: Partial<User>) => setUser(prev => ({ ...prev, ...updates }));

    const handleNext = () => {
        // Skip Step 2 (Professional) if Customer
        if (step === 1 && user.type === 'Customer') {
            setStep(3);
        } else if (step === 2 && user.type === 'Customer') {
            setStep(3); // Just in case
        } else if (step < 5) {
            setStep(s => s + 1);
        }
    };

    const handleBack = () => {
        if (step === 3 && user.type === 'Customer') {
            setStep(1);
        } else if (step > 1) {
            setStep(s => s - 1);
        }
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            await createUser(user);
            toast.success("User created successfully", { description: "Email has been sent with login credentials." });
            // Redirect logic here
        } catch (err) {
            toast.error("Failed to create user");
        } finally {
            setSubmitting(false);
        }
    };

    const togglePermission = (perm: string, checked: boolean) => {
        const current = user.permissions || [];
        if (checked) {
            updateUser({ permissions: [...current, perm] });
        } else {
            updateUser({ permissions: current.filter(p => p !== perm) });
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 animate-in fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New User</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className={step >= 1 ? "text-teal-600 font-medium" : ""}>1. Basic Info</span>
                        <span className="text-slate-300">/</span>
                        <span className={step >= 2 ? (user.type === "Customer" ? "text-slate-400 line-through" : "text-teal-600 font-medium") : ""}>2. Professional</span>
                        <span className="text-slate-300">/</span>
                        <span className={step >= 3 ? "text-teal-600 font-medium" : ""}>3. KYC</span>
                        <span className="text-slate-300">/</span>
                        <span className={step >= 4 ? "text-teal-600 font-medium" : ""}>4. Access</span>
                        <span className="text-slate-300">/</span>
                        <span className={step >= 5 ? "text-teal-600 font-medium" : ""}>5. Review</span>
                    </div>
                </div>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm min-h-[500px]">
                <CardContent className="p-8">
                    {/* STEP 1: BASIC */}
                    {step === 1 && (
                        <div className="space-y-6 slide-in-from-right-4 duration-500 animate-in fade-in">
                            <div className="space-y-3">
                                <Label>User Type *</Label>
                                <RadioGroup value={user.type} onValueChange={(v) => updateUser({ type: v as UserType })} className="grid grid-cols-4 gap-4">
                                    {['Customer', 'Employee', 'Admin', 'Referral Partner'].map(t => (
                                        <div key={t} className="relative">
                                            <RadioGroupItem value={t} id={t} className="peer sr-only" />
                                            <Label htmlFor={t} className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-slate-200 bg-slate-50 hover:bg-white peer-data-[state=checked]:border-teal-500 peer-data-[state=checked]:text-teal-600 peer-data-[state=checked]:bg-teal-50 cursor-pointer transition-all text-slate-700">
                                                {t}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Full Name *</Label>
                                    <Input value={user.name} onChange={e => updateUser({ name: e.target.value })} className="bg-white border-slate-200 text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address *</Label>
                                    <Input type="email" value={user.email} onChange={e => updateUser({ email: e.target.value })} className="bg-white border-slate-200 text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Mobile Number *</Label>
                                    <Input value={user.phone} onChange={e => updateUser({ phone: e.target.value })} className="bg-white border-slate-200 text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date of Birth</Label>
                                    <Input type="date" value={user.dob} onChange={e => updateUser({ dob: e.target.value })} className="bg-white border-slate-200 text-slate-900" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Current Address</Label>
                                <Textarea value={user.address} onChange={e => updateUser({ address: e.target.value })} className="bg-white border-slate-200 text-slate-900" />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PROFESSIONAL (Not for Customers) */}
                    {step === 2 && (
                        <div className="space-y-6 slide-in-from-right-4 duration-500 animate-in fade-in">
                            <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg mb-6">
                                <h3 className="text-teal-700 font-bold mb-1">Employement Details</h3>
                                <p className="text-sm text-slate-500">Configure role, department and reporting structure.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Select value={user.departmentId} onValueChange={v => updateUser({ departmentId: v })}>
                                        <SelectTrigger className="bg-white border-slate-200 text-slate-900"><SelectValue placeholder="Select Department" /></SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 text-slate-900">
                                            {MOCK_DEPARTMENTS.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Designation</Label>
                                    <Select value={user.designationId} onValueChange={v => updateUser({ designationId: v })}>
                                        <SelectTrigger className="bg-white border-slate-200 text-slate-900"><SelectValue placeholder="Select Designation" /></SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 text-slate-900">
                                            {MOCK_DEPARTMENTS.find(d => d.id === user.departmentId)?.designations.map(des => (
                                                <SelectItem key={des.id} value={des.id}>{des.name}</SelectItem>
                                            )) || <SelectItem value="none" disabled>Select Department First</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Date of Joining</Label>
                                    <Input type="date" className="bg-white border-slate-200 text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reporting Manager</Label>
                                    <Input placeholder="Search employee..." className="bg-white border-slate-200 text-slate-900" />
                                </div>
                            </div>

                            {user.type === 'Referral Partner' && (
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg space-y-4">
                                    <h4 className="text-amber-700 font-bold text-sm">Partner Configuration</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Commission Rate (%)</Label>
                                            <Input type="number" defaultValue={10} className="bg-white border-slate-200 text-slate-900" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Referral Code (Auto)</Label>
                                            <Input disabled defaultValue="REF-XXXX" className="bg-slate-100 border-slate-200 opacity-50 text-slate-500" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: KYC */}
                    {step === 3 && (
                        <div className="space-y-6 slide-in-from-right-4 duration-500 animate-in fade-in">
                            <div className="grid grid-cols-2 gap-6">
                                <Card className="bg-white border-slate-200 shadow-sm">
                                    <CardHeader><CardTitle className="text-base text-slate-800">Aadhaar Verification</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <Input placeholder="Aadhaar Number (12 digits)" className="bg-white border-slate-200 text-slate-900" />
                                        <MockFileUpload label="Upload Front Side" />
                                        <MockFileUpload label="Upload Back Side" />
                                    </CardContent>
                                </Card>
                                <Card className="bg-white border-slate-200 shadow-sm">
                                    <CardHeader><CardTitle className="text-base text-slate-800">PAN Verification</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <Input placeholder="PAN Number (10 chars)" className="bg-white border-slate-200 text-slate-900" />
                                        <MockFileUpload label="Upload PAN Card" />
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-200">
                                <h3 className="font-bold text-slate-800">Bank Account Details</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2"><Label>Account Number</Label><Input className="bg-white border-slate-200 text-slate-900" /></div>
                                    <div className="space-y-2"><Label>IFSC Code</Label><Input className="bg-white border-slate-200 text-slate-900" /></div>
                                    <div className="space-y-2"><Label>Bank Name</Label><Input className="bg-white border-slate-200 text-slate-900" /></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: PERMISSIONS */}
                    {step === 4 && (
                        <div className="space-y-6 slide-in-from-right-4 duration-500 animate-in fade-in">
                            <div className="flex items-center justify-between bg-slate-50 p-4 border border-slate-200 rounded-lg">
                                <div>
                                    <Label className="text-base text-slate-800">Quick Roles</Label>
                                    <p className="text-sm text-slate-500">Apply preset permissions based on role.</p>
                                </div>
                                <Select onValueChange={(v) => toast.info(`Applied ${v} role permissions.`)}>
                                    <SelectTrigger className="w-[200px] bg-white border-slate-200 text-slate-900"><SelectValue placeholder="Select Role Preset" /></SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                                        <SelectItem value="super_admin">Super Admin</SelectItem>
                                        <SelectItem value="sales">Sales Team</SelectItem>
                                        <SelectItem value="support">Support Team</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-teal-600 border-b border-slate-100 pb-2">Plan Management</h4>
                                    <PermissionItem label="View Plans" id="perm_plans_view" checked={user.permissions?.includes('perm_plans_view') || false} onChange={(c) => togglePermission('perm_plans_view', c)} />
                                    <PermissionItem label="Create/Edit Plans" id="perm_plans_edit" checked={user.permissions?.includes('perm_plans_edit') || false} onChange={(c) => togglePermission('perm_plans_edit', c)} />
                                    <PermissionItem label="Delete Plans" id="perm_plans_delete" checked={user.permissions?.includes('perm_plans_delete') || false} onChange={(c) => togglePermission('perm_plans_delete', c)} />
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-teal-600 border-b border-slate-100 pb-2">User Management</h4>
                                    <PermissionItem label="View Users" id="perm_users_view" checked={user.permissions?.includes('perm_users_view') || false} onChange={(c) => togglePermission('perm_users_view', c)} />
                                    <PermissionItem label="Create/Edit Users" id="perm_users_edit" checked={user.permissions?.includes('perm_users_edit') || false} onChange={(c) => togglePermission('perm_users_edit', c)} />
                                    <PermissionItem label="Delete Users" id="perm_users_delete" checked={user.permissions?.includes('perm_users_delete') || false} onChange={(c) => togglePermission('perm_users_delete', c)} />
                                </div>
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-teal-600 border-b border-slate-100 pb-2">Modules</h4>
                                    <PermissionItem label="Service Requests" id="perm_req" checked={user.permissions?.includes('perm_req') || false} onChange={(c) => togglePermission('perm_req', c)} />
                                    <PermissionItem label="Reimbursements" id="perm_claims" checked={user.permissions?.includes('perm_claims') || false} onChange={(c) => togglePermission('perm_claims', c)} />
                                    <PermissionItem label="Wallet & Payments" id="perm_wallet" checked={user.permissions?.includes('perm_wallet') || false} onChange={(c) => togglePermission('perm_wallet', c)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: REVIEW */}
                    {step === 5 && (
                        <div className="space-y-8 slide-in-from-right-4 duration-500 animate-in fade-in text-center">
                            <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-lg mx-auto space-y-6 shadow-sm">
                                <div className="flex flex-col items-center">
                                    <div className="h-20 w-20 bg-teal-50 rounded-full flex items-center justify-center text-3xl font-bold text-teal-600 mb-4 border border-teal-100">
                                        {user.name?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
                                    <Badge variant="outline" className="mt-2 text-slate-500 border-slate-200">{user.type}</Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-left text-sm">
                                    <div className="bg-slate-50 p-3 rounded">
                                        <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Email</div>
                                        <div className="text-slate-900 font-medium">{user.email}</div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded">
                                        <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Phone</div>
                                        <div className="text-slate-900 font-medium">{user.phone}</div>
                                    </div>
                                    {user.type !== 'Customer' && (
                                        <>
                                            <div className="bg-slate-50 p-3 rounded">
                                                <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Department</div>
                                                <div className="text-slate-900 font-medium">{MOCK_DEPARTMENTS.find(d => d.id === user.departmentId)?.name || 'N/A'}</div>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded">
                                                <div className="text-slate-500 text-xs uppercase tracking-wide mb-1">Designation</div>
                                                <div className="text-slate-900 font-medium text-xs">{user.designationId || 'N/A'}</div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="bg-slate-50 p-4 rounded text-left">
                                    <div className="text-slate-500 mb-2 font-medium">Assigned Permissions</div>
                                    <div className="flex flex-wrap gap-1">
                                        {user.permissions?.length === 0 && <span className="text-slate-400 italic">No specific permissions assigned.</span>}
                                        {user.permissions?.map(p => (
                                            <Badge key={p} variant="secondary" className="bg-white border border-slate-200 text-slate-600 pointer-events-none">
                                                {p}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 justify-center bg-blue-50 text-blue-600 p-3 rounded border border-blue-100 text-sm">
                                    <CheckCircle className="h-4 w-4" />
                                    Email notification will be sent to user.
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Footer Navigation */}
            <div className="flex justify-between mt-8">
                <Button
                    onClick={handleBack}
                    disabled={step === 1}
                    variant="outline"
                    className="border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                {step === 5 ? (
                    <Button onClick={handleSave} disabled={submitting} className="bg-teal-600 hover:bg-teal-700 text-white min-w-[150px]">
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Create User
                    </Button>
                ) : (
                    <Button onClick={handleNext} className="bg-slate-900 text-white hover:bg-slate-800">
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

// Importing Loader2 here to fix the usage above if not already imported
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

