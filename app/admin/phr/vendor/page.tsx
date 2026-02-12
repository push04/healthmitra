'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Shield, Key, Upload, Loader2, CheckCircle, AlertCircle, User, FileText, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { PatientMember, PHR_CATEGORIES, VendorAuditEntry } from '@/app/lib/mock/phr-data';
import { verifyPatientAccess, addVendorRecord, getVendorAuditLog } from '@/app/actions/phr';

export default function VendorPortalPage() {
    const [verifyMode, setVerifyMode] = useState<'otp' | 'abha'>('otp');
    const [verifyInput, setVerifyInput] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [verifiedPatient, setVerifiedPatient] = useState<PatientMember | null>(null);

    const [uploadCategory, setUploadCategory] = useState('');
    const [uploadNotes, setUploadNotes] = useState('');
    const [uploading, setUploading] = useState(false);

    const [auditLog, setAuditLog] = useState<VendorAuditEntry[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);

    const loadAudit = async () => {
        setAuditLoading(true);
        const res = await getVendorAuditLog();
        if (res.success && res.data) setAuditLog(res.data);
        setAuditLoading(false);
    };

    useEffect(() => { loadAudit(); }, []);

    const handleVerify = async () => {
        if (!verifyInput) return;
        setVerifying(true);
        const res = await verifyPatientAccess({ type: verifyMode, value: verifyInput });
        if (res.success && res.data) {
            setVerifiedPatient(res.data);
            toast.success(res.message);
        } else {
            toast.error(res.error || 'Verification failed');
        }
        setVerifying(false);
    };

    const handleUpload = async () => {
        if (!verifiedPatient || !uploadCategory) return;
        setUploading(true);
        const res = await addVendorRecord(verifiedPatient.id, {
            category: uploadCategory as any,
            notes: uploadNotes,
            addedBy: 'vendor',
            vendorName: 'Demo Vendor',
        });
        if (res.success) {
            toast.success(res.message);
            setUploadCategory('');
            setUploadNotes('');
        }
        setUploading(false);
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="space-y-6 animate-in fade-in py-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Vendor Portal — Add Patient Records
                </h1>
                <p className="text-slate-500 text-sm mt-1">Verify patient identity via OTP or ABHA ID, then upload health records to their PHR.</p>
            </div>

            <Tabs defaultValue="add-record" className="w-full">
                <TabsList className="bg-slate-100 border border-slate-200">
                    <TabsTrigger value="add-record" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Add Record</TabsTrigger>
                    <TabsTrigger value="audit-log" className="data-[state=active]:bg-white data-[state=active]:text-teal-700">Audit Log</TabsTrigger>
                </TabsList>

                {/* Tab: Add Record */}
                <TabsContent value="add-record" className="space-y-6 mt-6">
                    {/* Step 1: Verification */}
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-slate-700 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-teal-500" /> Step 1: Verify Patient
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Button
                                    variant={verifyMode === 'otp' ? 'default' : 'outline'}
                                    size="sm"
                                    className={verifyMode === 'otp' ? 'bg-teal-600 text-white' : 'border-slate-200 text-slate-600'}
                                    onClick={() => { setVerifyMode('otp'); setVerifyInput(''); setVerifiedPatient(null); }}
                                >
                                    <Key className="mr-1 h-3 w-3" /> OTP Verification
                                </Button>
                                <Button
                                    variant={verifyMode === 'abha' ? 'default' : 'outline'}
                                    size="sm"
                                    className={verifyMode === 'abha' ? 'bg-teal-600 text-white' : 'border-slate-200 text-slate-600'}
                                    onClick={() => { setVerifyMode('abha'); setVerifyInput(''); setVerifiedPatient(null); }}
                                >
                                    <Shield className="mr-1 h-3 w-3" /> ABHA ID
                                </Button>
                            </div>

                            <div className="flex gap-3 items-end">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-sm text-slate-600">
                                        {verifyMode === 'otp' ? 'Enter OTP sent to patient' : 'Enter ABHA ID'}
                                    </Label>
                                    <Input
                                        value={verifyInput}
                                        onChange={e => setVerifyInput(e.target.value)}
                                        placeholder={verifyMode === 'otp' ? 'e.g. 123456' : 'e.g. 91-1234-5678-9012'}
                                        className="bg-white border-slate-200 text-slate-900"
                                    />
                                    {verifyMode === 'otp' && <p className="text-xs text-slate-400">Demo: use OTP &quot;123456&quot;</p>}
                                </div>
                                <Button onClick={handleVerify} disabled={verifying || !verifyInput} className="bg-teal-600 hover:bg-teal-700 text-white">
                                    {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                                </Button>
                            </div>

                            {verifiedPatient && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-emerald-800">{verifiedPatient.name} — Verified</p>
                                        <p className="text-sm text-emerald-600">{verifiedPatient.email} • {verifiedPatient.phone}</p>
                                        {verifiedPatient.planName && <Badge className="mt-1 bg-emerald-100 text-emerald-700 border-emerald-300 text-xs">{verifiedPatient.planName}</Badge>}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Step 2: Upload Record */}
                    {verifiedPatient && (
                        <Card className="bg-white border-slate-200 shadow-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base text-slate-700 flex items-center gap-2">
                                    <Upload className="h-4 w-4 text-teal-500" /> Step 2: Upload Record
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Record Category</Label>
                                    <Select value={uploadCategory} onValueChange={setUploadCategory}>
                                        <SelectTrigger className="bg-white border-slate-200 text-slate-900"><SelectValue placeholder="Select category..." /></SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 text-slate-900">
                                            {PHR_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Upload File</Label>
                                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-slate-50 transition-all">
                                        <FileText className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                                        <p className="text-sm text-slate-600">Drag & drop or click to upload</p>
                                        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG, DICOM — max 10MB</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Notes (Optional)</Label>
                                    <Textarea value={uploadNotes} onChange={e => setUploadNotes(e.target.value)} placeholder="Any additional notes for this record..." className="bg-white border-slate-200 text-slate-900" />
                                </div>

                                <Button onClick={handleUpload} disabled={uploading || !uploadCategory} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                                    Upload Record to {verifiedPatient.name}&apos;s PHR
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Tab: Audit Log */}
                <TabsContent value="audit-log" className="mt-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-slate-700 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" /> Vendor Audit Trail
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {auditLoading ? (
                                <div className="flex items-center justify-center h-32"><Loader2 className="h-6 w-6 animate-spin text-teal-500" /></div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 border-slate-200">
                                            <TableHead className="text-slate-600 font-semibold">Vendor</TableHead>
                                            <TableHead className="text-slate-600 font-semibold">Action</TableHead>
                                            <TableHead className="text-slate-600 font-semibold">Patient</TableHead>
                                            <TableHead className="text-slate-600 font-semibold">Record</TableHead>
                                            <TableHead className="text-slate-600 font-semibold">Verified By</TableHead>
                                            <TableHead className="text-slate-600 font-semibold">Timestamp</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {auditLog.map(entry => (
                                            <TableRow key={entry.id} className="border-slate-100">
                                                <TableCell className="font-medium text-slate-800">{entry.vendorName}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                                        {entry.action === 'add_record' ? 'Added Record' : 'Viewed Record'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-600">{entry.memberName}</TableCell>
                                                <TableCell className="text-sm text-slate-500 max-w-[200px] truncate">{entry.recordName || '—'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`text-xs ${entry.verificationMethod === 'otp' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-teal-50 text-teal-700 border-teal-200'}`}>
                                                        {entry.verificationMethod.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-500">{formatDate(entry.timestamp)}</TableCell>
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
