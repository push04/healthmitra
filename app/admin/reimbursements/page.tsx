'use client';

import { useState, useEffect } from 'react';
import { ReimbursementClaim, MOCK_CLAIMS } from '@/app/lib/mock/support-data';
import { getClaims, processClaim } from '@/app/actions/support';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Eye, CheckCircle, XCircle, FileText, AlertTriangle, Download, CreditCard, Building, Wallet } from 'lucide-react';
import { toast } from 'sonner';

export default function ReimbursementsPage() {
    const [claims, setClaims] = useState<ReimbursementClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClaim, setSelectedClaim] = useState<ReimbursementClaim | null>(null);
    const [isProcessOpen, setIsProcessOpen] = useState(false);
    const [audit, setAudit] = useState({ approvedAmount: 0, notes: '', action: 'approve' });

    const loadData = async () => {
        setLoading(true);
        const res = await getClaims();
        if (res.success) setClaims(res.data || []);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleProcess = async () => {
        if (!selectedClaim) return;
        if (audit.action === 'reject' && !audit.notes) return toast.error("Rejection reason required");

        await processClaim(selectedClaim.id, audit.action as any, { amount: audit.approvedAmount, notes: audit.notes });
        setIsProcessOpen(false);
        setSelectedClaim(null);
        loadData();
        toast.success(`Claim ${audit.action}ed`);
    };

    const openProcess = (claim: ReimbursementClaim) => {
        setSelectedClaim(claim);
        setAudit({ approvedAmount: claim.amount, notes: '', action: 'approve' });
        setIsProcessOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in max-w-[1600px] mx-auto p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Reimbursement Claims</h1>
                    <p className="text-slate-500 text-sm mt-1">Process and audit customer claims.</p>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm"><CardContent className="p-4 text-center"><p className="text-slate-500 text-sm mb-1">Pending Amount</p><h3 className="text-2xl font-bold text-slate-900">₹45,600</h3></CardContent></Card>
                <Card className="bg-white border-slate-200 shadow-sm"><CardContent className="p-4 text-center"><p className="text-slate-500 text-sm mb-1">Approved (This Month)</p><h3 className="text-2xl font-bold text-slate-900">₹2,45,800</h3></CardContent></Card>
                <Card className="bg-white border-slate-200 shadow-sm"><CardContent className="p-4 text-center"><p className="text-slate-500 text-sm mb-1">Rejected</p><h3 className="text-2xl font-bold text-slate-900">₹12,300</h3></CardContent></Card>
                <Card className="bg-white border-slate-200 shadow-sm"><CardContent className="p-4 text-center"><p className="text-slate-500 text-sm mb-1">Total Processed</p><h3 className="text-2xl font-bold text-slate-900">₹3.1L</h3></CardContent></Card>
            </div>

            {/* LIST */}
            <div className="space-y-4">
                {claims.map(claim => (
                    <Card key={claim.id} className="bg-white border-slate-200 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                        <CardContent className="p-4 flex items-center gap-6">
                            <div className="bg-emerald-50 p-3 rounded-full border border-emerald-100">
                                <CreditCard className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                    <h3 className="font-bold text-slate-900 text-lg">{claim.title}</h3>
                                    <div className="font-mono text-emerald-600 font-bold">₹{claim.amount.toLocaleString()}</div>
                                </div>
                                <div className="flex gap-6 text-sm text-slate-500">
                                    <span>{claim.claimId}</span>
                                    <span>{claim.customerName}</span>
                                    <span>{claim.providerName}</span>
                                    <span>{claim.billDate}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => openProcess(claim)} className="border-slate-200 hover:bg-slate-50 text-slate-700">Review</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* PROCESS MODAL */}
            <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-6xl h-[90vh] flex flex-col p-0">
                    {selectedClaim && (
                        <>
                            <DialogHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between bg-slate-50/50">
                                <div>
                                    <DialogTitle className="text-xl text-slate-900">Process Claim: {selectedClaim.claimId}</DialogTitle>
                                    <div className="text-sm text-slate-500 mt-1">Submitted on {selectedClaim.submittedAt}</div>
                                </div>
                                <div className="text-xl font-bold text-emerald-600 font-mono">₹{selectedClaim.amount.toLocaleString()}</div>
                            </DialogHeader>
                            <div className="flex-1 overflow-hidden flex">
                                {/* DOCUMENTS VIEWER (Left) */}
                                <div className="w-1/2 border-r border-slate-200 p-6 bg-slate-50 flex flex-col">
                                    <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><FileText className="h-4 w-4" /> Supporting Documents</h4>
                                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                        {selectedClaim.documents.map((doc, i) => (
                                            <div key={i} className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-medium text-slate-900">{doc.type}</span>
                                                    <Button size="sm" variant="ghost" className="h-6 text-slate-500"><Download className="h-3 w-3" /></Button>
                                                </div>
                                                <div className="aspect-video bg-slate-100 rounded flex items-center justify-center border border-slate-200 border-dashed text-slate-500">
                                                    [Document Preview: {doc.name}]
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* AUDIT FORM (Right) */}
                                <div className="w-1/2 p-6 flex flex-col bg-white">
                                    <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Audit & Approval</h4>

                                    <div className="space-y-6 flex-1">
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Claimed Amount</span>
                                                <span className="text-slate-900 font-medium">₹{selectedClaim.amount}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Policy Limit</span>
                                                <span className="text-emerald-600 font-medium">₹5,00,000 (Available)</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-slate-700">Action</Label>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant={audit.action === 'approve' ? 'default' : 'outline'}
                                                        className={audit.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 flex-1 text-white' : 'flex-1 border-slate-200 text-slate-600 hover:bg-slate-50'}
                                                        onClick={() => setAudit({ ...audit, action: 'approve' })}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                                    </Button>
                                                    <Button
                                                        variant={audit.action === 'reject' ? 'default' : 'outline'}
                                                        className={audit.action === 'reject' ? 'bg-rose-600 hover:bg-rose-700 flex-1 text-white' : 'flex-1 border-slate-200 text-slate-600 hover:bg-slate-50'}
                                                        onClick={() => setAudit({ ...audit, action: 'reject' })}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" /> Reject
                                                    </Button>
                                                </div>
                                            </div>

                                            {audit.action === 'approve' && (
                                                <div className="space-y-2 animate-in fade-in">
                                                    <Label className="text-slate-700">Approved Amount</Label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                                                        <Input type="number" value={audit.approvedAmount} onChange={e => setAudit({ ...audit, approvedAmount: parseFloat(e.target.value) })} className="pl-6 bg-white border-slate-200 text-slate-900" />
                                                    </div>
                                                    <div className="space-y-2 mt-4">
                                                        <Label className="text-slate-700">Payment Method</Label>
                                                        <Select defaultValue="wallet">
                                                            <SelectTrigger className="bg-white border-slate-200 text-slate-900"><SelectValue /></SelectTrigger>
                                                            <SelectContent className="bg-white border-slate-200 text-slate-900">
                                                                <SelectItem value="wallet"><div className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Credit to Wallet (Instant)</div></SelectItem>
                                                                <SelectItem value="bank"><div className="flex items-center gap-2"><Building className="h-4 w-4" /> Bank Transfer (3-5 days)</div></SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label className="text-slate-700">{audit.action === 'reject' ? 'Rejection Reason *' : 'Internal Notes (Optional)'}</Label>
                                                <Textarea value={audit.notes} onChange={e => setAudit({ ...audit, notes: e.target.value })} className="bg-white border-slate-200 text-slate-900" placeholder={audit.action === 'reject' ? "Please explain why this claim is being rejected..." : "Any observations..."} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                                        <Button variant="ghost" onClick={() => setIsProcessOpen(false)} className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">Cancel</Button>
                                        <Button className={audit.action === 'approve' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"} onClick={handleProcess}>
                                            Confirm {audit.action === 'approve' ? 'Approval' : 'Rejection'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
