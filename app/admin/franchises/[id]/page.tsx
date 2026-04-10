'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    ArrowLeft, Building2, MapPin, Mail, Phone, Globe, Shield, Calendar,
    Loader2, CheckCircle, Clock, Users, DollarSign, Percent, Edit, Upload, Eye, FileText, CheckCircle2, XCircle
} from 'lucide-react';
import { Franchise, FranchiseModule, FranchiseActivity, FranchisePartner, FranchiseKYC, KYCHistoryEntry } from '@/types/franchise';
import { getFranchise, assignModules, getFranchiseKYC, updateFranchiseKYC, verifyFranchiseKYC, uploadKYCDocument } from '@/app/actions/franchise';
import { toast } from 'sonner';
import Link from 'next/link';

const KYC_STYLES: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    submitted: 'bg-blue-100 text-blue-700 border-blue-200',
    verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
};

export default function FranchiseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [franchise, setFranchise] = useState<Franchise | null>(null);
    const [modules, setModules] = useState<FranchiseModule[]>([]);
    const [activities, setActivities] = useState<FranchiseActivity[]>([]);
    const [partners, setPartners] = useState<FranchisePartner[]>([]);
    const [loading, setLoading] = useState(true);
    
    // KYC State
    const [kyc, setKyc] = useState<FranchiseKYC | null>(null);
    const [kycLoading, setKycLoading] = useState(false);
    const [editingKyc, setEditingKyc] = useState(false);
    const [kycForm, setKycForm] = useState({
        aadhaarNumber: '',
        panNumber: '',
    });
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [verifyStatus, setVerifyStatus] = useState<'verified' | 'rejected'>('verified');
    const [rejectionReason, setRejectionReason] = useState('');
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

    const handleDocUpload = async (docType: 'aadhaar_front' | 'aadhaar_back' | 'pan_card' | 'photo', file: File) => {
        setUploadingDoc(docType);
        const res = await uploadKYCDocument(id, docType, file);
        setUploadingDoc(null);
        if (res.success) {
            toast.success('Document uploaded');
            // Reload KYC
            const kycRes = await getFranchiseKYC(id);
            if (kycRes.success && kycRes.data) setKyc(kycRes.data);
        } else {
            toast.error(res.error || 'Upload failed');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await getFranchise(id);
            if (res.success && res.data) {
                setFranchise(res.data.franchise);
                setModules(res.data.modules);
                setActivities(res.data.activities);
                setPartners(res.data.partners);
            }
            setLoading(false);
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        const loadKyc = async () => {
            setKycLoading(true);
            const res = await getFranchiseKYC(id);
            if (res.success && res.data) {
                setKyc(res.data);
                setKycForm({
                    aadhaarNumber: res.data.aadhaarNumber || '',
                    panNumber: res.data.panNumber || '',
                });
            }
            setKycLoading(false);
        };
        loadKyc();
    }, [id]);

    const toggleModuleAccess = (moduleId: string, field: keyof FranchiseModule) => {
        setModules(prev => prev.map(m =>
            m.id === moduleId ? { ...m, [field]: !m[field] } : m
        ));
    };

    const handleSaveModules = async () => {
        const res = await assignModules(id, modules);
        if (res.success) toast.success(res.message);
    };

    const handleSaveKyc = async () => {
        const res = await updateFranchiseKYC(id, {
            aadhaarNumber: kycForm.aadhaarNumber,
            panNumber: kycForm.panNumber,
        });
        if (res.success) {
            toast.success(res.message);
            setEditingKyc(false);
            // Reload KYC
            const kycRes = await getFranchiseKYC(id);
            if (kycRes.success && kycRes.data) setKyc(kycRes.data);
        } else {
            toast.error(res.error || 'Failed to update KYC');
        }
    };

    const handleVerify = async () => {
        const res = await verifyFranchiseKYC(id, verifyStatus, rejectionReason);
        if (res.success) {
            toast.success(res.message);
            setVerifyDialogOpen(false);
            setRejectionReason('');
            // Reload KYC
            const kycRes = await getFranchiseKYC(id);
            if (kycRes.success && kycRes.data) {
                setKyc(kycRes.data);
                setFranchise(prev => prev ? { ...prev, kycStatus: kycRes.data.kycStatus as any } : null);
            }
        } else {
            toast.error(res.error || 'Failed to verify KYC');
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const formatDateTime = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div>;
    if (!franchise) return <div className="flex flex-col items-center justify-center h-96 text-slate-500"><Building2 className="h-12 w-12 mb-4 text-slate-300" /><p>Franchise not found.</p></div>;

    return (
        <div className="space-y-6 animate-in fade-in py-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/admin/franchises"><Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900"><ArrowLeft className="h-5 w-5" /></Button></Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{franchise.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs border ${franchise.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                {franchise.status}
                            </Badge>
                            <Badge className={`text-xs border ${KYC_STYLES[franchise.kycStatus]}`}>KYC: {franchise.kycStatus}</Badge>
                        </div>
                    </div>
                </div>
                <Button variant="outline" className="border-slate-200 text-slate-600" onClick={() => toast.info('Edit franchise', { description: 'Franchise editing mode will be available shortly.' })}><Edit className="mr-2 h-4 w-4" /> Edit</Button>
            </div>

            <Tabs defaultValue="details">
                <TabsList className="bg-slate-100 border border-slate-200">
                    <TabsTrigger value="details" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Details</TabsTrigger>
                    <TabsTrigger value="kyc" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">KYC Documents</TabsTrigger>
                    <TabsTrigger value="modules" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Module Access</TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Activity History</TabsTrigger>
                    <TabsTrigger value="partners" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Partners ({partners.length})</TabsTrigger>
                </TabsList>

                {/* Tab: Details */}
                <TabsContent value="details" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Contact Information</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <InfoRow icon={Mail} label="Email" value={franchise.email} />
                                <InfoRow icon={Phone} label="Contact" value={franchise.contact} />
                                {franchise.altContact && <InfoRow icon={Phone} label="Alt Contact" value={franchise.altContact} />}
                                <InfoRow icon={Globe} label="Website" value={franchise.website || '—'} />
                                <InfoRow icon={MapPin} label="Address" value={`${franchise.address}, ${franchise.city}, ${franchise.state}`} />
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-slate-200 shadow-sm">
                            <CardHeader className="pb-3"><CardTitle className="text-base text-slate-700">Contract & Financial</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <InfoRow icon={Calendar} label="Contract" value={`${formatDate(franchise.startDate)} → ${formatDate(franchise.endDate)}`} />
                                <InfoRow icon={Percent} label="Commission" value={`${franchise.commissionPercent}%`} />
                                <InfoRow icon={Clock} label="Payout Delay" value={`${franchise.payoutDelay} days`} />
                                <InfoRow icon={Shield} label="GST" value={franchise.gst || '—'} />
                                <InfoRow icon={Shield} label="Referral Code" value={franchise.referralCode} />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Total Partners" value={franchise.totalPartners} icon={Users} color="bg-blue-50 border-blue-200 text-blue-700" />
                        <StatCard label="Total Revenue" value={`$${(franchise.totalRevenue / 100000).toFixed(1)}L`} icon={DollarSign} color="bg-emerald-50 border-emerald-200 text-emerald-700" />
                        <StatCard label="Commission Earned" value={`$${((franchise.totalRevenue * franchise.commissionPercent) / 100 / 1000).toFixed(0)}K`} icon={Percent} color="bg-teal-50 border-teal-200 text-teal-700" />
                        <StatCard label="KYC Status" value={franchise.kycStatus} icon={Shield} color="bg-amber-50 border-amber-200 text-amber-700" />
                    </div>
                </TabsContent>

                {/* Tab: Modules */}
                <TabsContent value="modules" className="mt-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-base text-slate-700">Module Permissions</CardTitle>
                            <Button onClick={handleSaveModules} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">Save Changes</Button>
                        </CardHeader>
                        <CardContent>
                            {modules.length === 0 ? (
                                <p className="text-center text-slate-400 py-8">No modules assigned yet.</p>
                            ) : (
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
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Activity */}
                <TabsContent value="activity" className="mt-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-slate-700">Activity History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activities.length === 0 ? (
                                <p className="text-center text-slate-400 py-8">No activity recorded yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {activities.map(a => (
                                        <div key={a.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                            <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                                                <Clock className="h-4 w-4 text-teal-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-slate-800">{a.action}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{a.description}</p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                    <span>{formatDateTime(a.timestamp)}</span>
                                                    <span>by {a.performedBy}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: KYC */}
                <TabsContent value="kyc" className="mt-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-base text-slate-700">KYC Documents</CardTitle>
                            <Badge className={`text-xs border ${KYC_STYLES[kyc?.kycStatus || 'pending']}`}>{kyc?.kycStatus || 'pending'}</Badge>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {kycLoading ? (
                                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-teal-500" /></div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Aadhaar Number</Label>
                                            {editingKyc ? (
                                                <Input value={kycForm.aadhaarNumber} onChange={e => setKycForm({ ...kycForm, aadhaarNumber: e.target.value })} placeholder="XXXX XXXX XXXX" className="bg-white border-slate-200" />
                                            ) : (
                                                <p className="text-sm text-slate-700 font-mono">{kyc?.aadhaarNumber || '—'}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>PAN Number</Label>
                                            {editingKyc ? (
                                                <Input value={kycForm.panNumber} onChange={e => setKycForm({ ...kycForm, panNumber: e.target.value })} placeholder="ABCDE1234F" className="bg-white border-slate-200" />
                                            ) : (
                                                <p className="text-sm text-slate-700 font-mono">{kyc?.panNumber || '—'}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Uploaded Documents</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <DocCard label="Aadhaar Front" url={kyc?.aadhaarFront} onUpload={(f) => handleDocUpload('aadhaar_front', f)} uploading={uploadingDoc === 'aadhaar_front'} />
                                            <DocCard label="Aadhaar Back" url={kyc?.aadhaarBack} onUpload={(f) => handleDocUpload('aadhaar_back', f)} uploading={uploadingDoc === 'aadhaar_back'} />
                                            <DocCard label="PAN Card" url={kyc?.panCard} onUpload={(f) => handleDocUpload('pan_card', f)} uploading={uploadingDoc === 'pan_card'} />
                                            <DocCard label="Photo" url={kyc?.photo} onUpload={(f) => handleDocUpload('photo', f)} uploading={uploadingDoc === 'photo'} />
                                        </div>
                                    </div>

                                    {kyc?.history && kyc.history.length > 0 && (
                                        <div className="space-y-3">
                                            <Label>Verification History</Label>
                                            <div className="space-y-2">
                                                {kyc.history.map(h => (
                                                    <div key={h.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${h.status === 'verified' ? 'bg-emerald-100' : h.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'}`}>
                                                            {h.status === 'verified' ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : h.status === 'rejected' ? <XCircle className="h-4 w-4 text-red-600" /> : <Clock className="h-4 w-4 text-amber-600" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-slate-800">KYC {h.status}</p>
                                                            {h.notes && <p className="text-xs text-slate-500 mt-0.5">{h.notes}</p>}
                                                            <p className="text-xs text-slate-400 mt-1">{formatDateTime(h.timestamp)} by {h.performedBy}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                                        {editingKyc ? (
                                            <>
                                                <Button variant="ghost" onClick={() => setEditingKyc(false)}>Cancel</Button>
                                                <Button onClick={handleSaveKyc} className="bg-teal-600 hover:bg-teal-700 text-white">Save</Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button variant="outline" onClick={() => setEditingKyc(true)} className="border-slate-200"><Edit className="mr-2 h-4 w-4" /> Edit Details</Button>
                                                <Button onClick={() => setVerifyDialogOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white"><CheckCircle className="mr-2 h-4 w-4" /> Verify KYC</Button>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                        <DialogContent className="bg-white border-slate-200 text-slate-900">
                            <DialogHeader><DialogTitle>Verify KYC</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-2">
                                <div className="space-y-2">
                                    <Label>Verification Status</Label>
                                    <div className="flex gap-2">
                                        <Button variant={verifyStatus === 'verified' ? 'default' : 'outline'} className={verifyStatus === 'verified' ? 'bg-emerald-600 hover:bg-emerald-700' : ''} onClick={() => setVerifyStatus('verified')}>Verify</Button>
                                        <Button variant={verifyStatus === 'rejected' ? 'destructive' : 'outline'} onClick={() => setVerifyStatus('rejected')}>Reject</Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Notes (optional)</Label>
                                    <Textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder={verifyStatus === 'rejected' ? 'Reason for rejection...' : 'Optional notes...'} className="bg-white border-slate-200" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleVerify} className={verifyStatus === 'verified' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}>{verifyStatus === 'verified' ? 'Verify' : 'Reject'}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* Tab: Partners */}
                <TabsContent value="partners" className="mt-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-slate-700">Associated Partners</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {partners.length === 0 ? (
                                <p className="text-center text-slate-400 py-8">No partners associated with this franchise.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 border-slate-200">
                                            <TableHead className="text-slate-600 font-semibold">Partner</TableHead>
                                            <TableHead className="text-slate-600 font-semibold">Phone</TableHead>
                                            <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                                            <TableHead className="text-slate-600 font-semibold">Joined</TableHead>
                                            <TableHead className="text-slate-600 font-semibold text-center">Plans</TableHead>
                                            <TableHead className="text-slate-600 font-semibold">Revenue</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {partners.map(p => (
                                            <TableRow key={p.id} className="border-slate-100">
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{p.name}</p>
                                                        <p className="text-xs text-slate-400">{p.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-600">{p.phone}</TableCell>
                                                <TableCell>
                                                    <Badge className={`text-xs border ${p.status === 'active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                        {p.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-500">{formatDate(p.joinedAt)}</TableCell>
                                                <TableCell className="text-center text-sm font-medium text-slate-700">{p.plansCount}</TableCell>
                                                <TableCell className="text-sm font-medium text-slate-700">${(p.revenue / 1000).toFixed(0)}K</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-400 w-24 shrink-0">{label}</span>
            <span className="text-sm text-slate-700">{value}</span>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
    return (
        <div className={`p-4 rounded-xl border ${color} shadow-sm`}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-xl font-bold">{value}</div>
                    <div className="text-xs uppercase tracking-wider opacity-70">{label}</div>
                </div>
                <Icon className="h-5 w-5 opacity-40" />
            </div>
        </div>
    );
}

function DocCard({ label, url, onUpload, uploading }: { label: string; url?: string; onUpload?: (file: File) => void; uploading?: boolean }) {
    return (
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <p className="text-xs text-slate-500 mb-2">{label}</p>
            {url ? (
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-teal-600" />
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 hover:underline">View</a>
                </div>
            ) : (
                <div>
                    <p className="text-xs text-slate-400 mb-2">Not uploaded</p>
                    {onUpload && (
                        <label className="cursor-pointer">
                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onUpload(file);
                            }} />
                            <span className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                                <Upload className="h-3 w-3" /> Upload
                            </span>
                        </label>
                    )}
                </div>
            )}
            {uploading && (
                <div className="flex items-center gap-1 mt-1">
                    <Loader2 className="h-3 w-3 animate-spin text-teal-500" />
                    <span className="text-xs text-slate-400">Uploading...</span>
                </div>
            )}
        </div>
    );
}
