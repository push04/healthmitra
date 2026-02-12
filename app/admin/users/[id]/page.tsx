'use client';

import { useState, useEffect, use } from 'react';
import { User, MOCK_USERS, BankDetails } from '@/app/lib/mock/users-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ArrowLeft, Edit2, Mail, Phone, Clock, Shield, UserX, UserCheck,
    MapPin, Globe, CreditCard, FileText, Send, Loader2, RefreshCw,
    Calendar, User as UserIcon, Landmark, Upload, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { toggleUserStatus, changePlan, resendCredentials, activateNewPlan } from '@/app/actions/users';
import Link from 'next/link';

const KYC_STYLES: Record<string, string> = {
    verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    rejected: 'bg-red-100 text-red-600 border-red-200',
};

const TYPE_STYLES: Record<string, string> = {
    Admin: 'bg-indigo-100 text-indigo-700', Employee: 'bg-blue-100 text-blue-700',
    Customer: 'bg-teal-100 text-teal-700', 'Referral Partner': 'bg-orange-100 text-orange-700',
};

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const found = MOCK_USERS.find(u => u.id === id) || MOCK_USERS[0];
        setUser(found);
        setLoading(false);
    }, [id]);

    const handleToggleStatus = async () => {
        if (!user) return;
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        const res = await toggleUserStatus(user.id, newStatus);
        if (res.success) {
            setUser({ ...user, status: newStatus });
            toast.success(res.message);
        }
    };

    const handleChangePlan = async (planId: string) => {
        if (!user) return;
        const planNames: Record<string, string> = { plan_gold: 'Gold Health Plan', plan_silver: 'Silver Health Plan', plan_platinum: 'Platinum Health Plan' };
        const res = await changePlan(user.id, planId, planNames[planId]);
        if (res.success) {
            setUser({ ...user, planId, planName: planNames[planId] });
            toast.success(res.message);
        }
    };

    const handleResend = async (method: 'whatsapp' | 'email') => {
        if (!user) return;
        const res = await resendCredentials(user.id, method);
        if (res.success) toast.success(res.message);
    };

    const handleActivatePlan = async () => {
        if (!user) return;
        const res = await activateNewPlan(user.id, user.planId || 'plan_gold');
        if (res.success) toast.success(res.message);
    };

    const fmt = (d?: string) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div>;
    if (!user) return <div className="text-center py-20 text-slate-400">User not found.</div>;

    return (
        <div className="space-y-6 animate-in fade-in py-6 max-w-5xl mx-auto">
            {/* Header Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6">
                    <Avatar className="h-20 w-20 border-2 border-slate-200">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                        <AvatarFallback className="text-xl bg-slate-100 text-slate-600">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <Badge variant="outline" className="text-xs bg-slate-50 text-slate-500 border-slate-200">{user.id}</Badge>
                                    <Badge className={`text-xs ${TYPE_STYLES[user.type]}`}>{user.type}</Badge>
                                    <Badge className={`text-xs border ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-600 border-red-200'}`}>
                                        {user.status}
                                    </Badge>
                                    {user.planName && <Badge className="text-xs bg-cyan-100 text-cyan-700">{user.planName}</Badge>}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="border-slate-200 text-slate-600" onClick={() => toast.info('Edit mode opening...', { description: 'User profile editing will be available shortly.' })}><Edit2 className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
                                <Button variant="outline" size="sm" onClick={handleToggleStatus} className={user.status === 'active' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}>
                                    {user.status === 'active' ? <><UserX className="mr-1.5 h-3.5 w-3.5" /> Disable</> : <><UserCheck className="mr-1.5 h-3.5 w-3.5" /> Enable</>}
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-6 mt-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {user.email}</span>
                            <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {user.phone}</span>
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Joined {fmt(user.joinedDate)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="profile">
                <TabsList className="bg-slate-100 border border-slate-200">
                    <TabsTrigger value="profile" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Profile</TabsTrigger>
                    <TabsTrigger value="bank" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Bank Details</TabsTrigger>
                    <TabsTrigger value="documents" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Documents</TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Activity</TabsTrigger>
                    <TabsTrigger value="actions" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Admin Actions</TabsTrigger>
                </TabsList>

                {/* PROFILE TAB */}
                <TabsContent value="profile" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Personal Information</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <Row label="Full Name" value={user.name} />
                                <Row label="Email" value={user.email} />
                                <Row label="Date of Birth" value={fmt(user.dob)} />
                                <Row label="Gender" value={user.gender || '—'} />
                                <Row label="User Type" value={user.type} />
                                <Row label="Designation" value={user.designation || '—'} />
                                <Row label="Department" value={user.department || '—'} />
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Contact & Location</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <Row label="Phone" value={user.phone} />
                                <Row label="Alt Phone" value={user.altPhone || '—'} />
                                <Row label="2nd Email" value={user.secondEmail || '—'} />
                                <Row label="Landline" value={user.landline || '—'} />
                                <Row label="Country" value={user.country || '—'} />
                                <Row label="State" value={user.state || '—'} />
                                <Row label="City" value={user.city || '—'} />
                                <Row label="Address" value={user.address || '—'} />
                                <Row label="Pincode" value={user.pincode || '—'} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Partner-specific */}
                    {user.type === 'Referral Partner' && (
                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Partner Details</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <Row label="Referral Code" value={user.referralCode || '—'} />
                                <Row label="Commission Rate" value={user.commissionRate ? `${user.commissionRate}%` : '—'} />
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* BANK DETAILS TAB */}
                <TabsContent value="bank" className="mt-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-base text-slate-700">Bank Account Details</CardTitle>
                            <Button variant="outline" size="sm" className="border-slate-200 text-slate-600" onClick={() => toast.info('Edit bank details', { description: 'Bank details editing will be available shortly.' })}><Edit2 className="mr-1.5 h-3.5 w-3.5" /> Edit</Button>
                        </CardHeader>
                        <CardContent>
                            {user.bankDetails ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Row label="Bank Name" value={user.bankDetails.bankName || '—'} />
                                    <Row label="Branch Name" value={user.bankDetails.branchName || '—'} />
                                    <Row label="Account Holder" value={user.bankDetails.accountHolder || '—'} />
                                    <Row label="Account Number" value={user.bankDetails.accountNumber || '—'} />
                                    <Row label="Account Type" value={user.bankDetails.accountType || '—'} />
                                    <Row label="IFSC Code" value={user.bankDetails.ifscCode || '—'} />
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <Landmark className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                    <p>No bank details on file.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* DOCUMENTS TAB */}
                <TabsContent value="documents" className="mt-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">KYC Documents</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <DocumentCard title="Aadhaar Card" number={user.kycDetails?.aadhaarNumber} status={user.kycDetails?.aadhaarNumber ? 'uploaded' : 'not_uploaded'} />
                                <DocumentCard title="PAN Card" number={user.kycDetails?.panNumber} status={user.kycDetails?.panNumber ? 'uploaded' : 'not_uploaded'} />
                                <DocumentCard title="Profile Picture" status={user.profilePicture ? 'uploaded' : 'not_uploaded'} />
                            </div>

                            {user.kycDetails && (
                                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600">Overall KYC Status</span>
                                        <Badge className={`text-xs border ${KYC_STYLES[user.kycDetails.status]}`}>{user.kycDetails.status}</Badge>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ACTIVITY TAB */}
                <TabsContent value="activity" className="mt-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Recent Activity</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {[
                                    { action: 'Login Successful', desc: 'Logged in from Chrome on Windows', time: '2 hours ago' },
                                    { action: 'Plan Renewed', desc: `${user.planName || 'Health Plan'} renewed for 12 months`, time: '5 days ago' },
                                    { action: 'Profile Updated', desc: 'Phone number changed', time: '1 week ago' },
                                    { action: 'Service Request', desc: 'Consultation request created #SR-1024', time: '2 weeks ago' },
                                    { action: 'Document Uploaded', desc: 'Aadhaar card uploaded for verification', time: '1 month ago' },
                                ].map((a, i) => (
                                    <div key={i} className="flex items-start gap-3 py-3 relative">
                                        {i < 4 && <div className="absolute left-[15px] top-[40px] bottom-0 w-px bg-slate-200" />}
                                        <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0 z-10">
                                            <Clock className="h-3.5 w-3.5 text-teal-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-800">{a.action}</p>
                                            <p className="text-xs text-slate-500">{a.desc}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ADMIN ACTIONS TAB */}
                <TabsContent value="actions" className="mt-6 space-y-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Quick Actions</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Enable/Disable */}
                            <ActionCard
                                title={user.status === 'active' ? 'Disable User' : 'Enable User'}
                                desc={user.status === 'active' ? 'Temporarily deactivate this user account.' : 'Reactivate this user account.'}
                                icon={user.status === 'active' ? UserX : UserCheck}
                                color={user.status === 'active' ? 'text-red-600' : 'text-emerald-600'}
                                onClick={handleToggleStatus}
                            />

                            {/* Activate Plan */}
                            <ActionCard
                                title="Activate Plan from Backend"
                                desc="Force-activate the user's plan without payment flow."
                                icon={RefreshCw}
                                color="text-indigo-600"
                                onClick={handleActivatePlan}
                            />

                            {/* Resend via WhatsApp */}
                            <ActionCard
                                title="Resend Credentials (WhatsApp)"
                                desc="Send login credentials to user via WhatsApp."
                                icon={Send}
                                color="text-green-600"
                                onClick={() => handleResend('whatsapp')}
                            />

                            {/* Resend via Email */}
                            <ActionCard
                                title="Resend Credentials (Email)"
                                desc="Send login credentials to user via Email."
                                icon={Mail}
                                color="text-blue-600"
                                onClick={() => handleResend('email')}
                            />
                        </CardContent>
                    </Card>

                    {/* Plan Change */}
                    {user.type === 'Customer' && (
                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Change User Plan</CardTitle></CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-600 mb-2">Current Plan: <strong>{user.planName || 'None'}</strong></p>
                                        <Select onValueChange={handleChangePlan}>
                                            <SelectTrigger className="bg-white border-slate-200 text-slate-700"><SelectValue placeholder="Select new plan" /></SelectTrigger>
                                            <SelectContent className="bg-white border-slate-200 text-slate-700">
                                                <SelectItem value="plan_silver">Silver Health Plan</SelectItem>
                                                <SelectItem value="plan_gold">Gold Health Plan</SelectItem>
                                                <SelectItem value="plan_platinum">Platinum Health Plan</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between py-2 border-b border-slate-100 last:border-0">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="text-sm font-medium text-slate-800">{value}</span>
        </div>
    );
}

function DocumentCard({ title, number, status }: { title: string; number?: string; status: string }) {
    return (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-800">{title}</p>
                <Badge className={`text-[10px] ${status === 'uploaded' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {status === 'uploaded' ? 'Uploaded' : 'Not Uploaded'}
                </Badge>
            </div>
            {number && <p className="text-xs font-mono text-slate-500">{number}</p>}
            <div className="flex gap-2 mt-3">
                {status === 'uploaded' ? (
                    <Button variant="outline" size="sm" className="text-xs border-slate-200 text-slate-600" onClick={() => toast.info(`Previewing ${title}`, { description: 'Document preview opened.' })}><Eye className="mr-1 h-3 w-3" /> View</Button>
                ) : (
                    <Button variant="outline" size="sm" className="text-xs border-slate-200 text-slate-600" onClick={() => toast.info(`Upload ${title}`, { description: 'File upload dialog opening.' })}><Upload className="mr-1 h-3 w-3" /> Upload</Button>
                )}
            </div>
        </div>
    );
}

function ActionCard({ title, desc, icon: Icon, color, onClick }: { title: string; desc: string; icon: any; color: string; onClick: () => void }) {
    return (
        <button onClick={onClick} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors text-left w-full">
            <Icon className={`h-5 w-5 ${color} shrink-0 mt-0.5`} />
            <div>
                <p className="text-sm font-medium text-slate-800">{title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
        </button>
    );
}
