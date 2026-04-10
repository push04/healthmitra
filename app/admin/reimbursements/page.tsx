'use client';

import { useState, useEffect } from 'react';
import { ReimbursementClaim } from '@/types/reimbursements';
import { getClaims, processClaim } from '@/app/actions/reimbursements';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, Eye, CheckCircle, XCircle, FileText, AlertTriangle, Download, CreditCard, Building, Wallet, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function ReimbursementsPage() {
    const [claims, setClaims] = useState<ReimbursementClaim[]>([]);
    const [allClaims, setAllClaims] = useState<ReimbursementClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClaim, setSelectedClaim] = useState<ReimbursementClaim | null>(null);
    const [isProcessOpen, setIsProcessOpen] = useState(false);
    const [audit, setAudit] = useState({ approvedAmount: 0, notes: '', action: 'approve' });
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const loadData = async () => {
        setLoading(true);
        const res = await getClaims();
        if (res.success && res.data) {
            setAllClaims(res.data);
            
            // Also filter for display
            if (filterStatus === 'all') {
                setClaims(res.data);
            } else {
                setClaims(res.data.filter((c: ReimbursementClaim) => c.status === filterStatus));
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [filterStatus]);

    const handleProcess = async () => {
        if (!selectedClaim) return;
        if (audit.action === 'reject' && !audit.notes) return toast.error("Rejection reason required");

        const res = await processClaim(selectedClaim.id, audit.action as any, { amount: audit.approvedAmount, notes: audit.notes });
        if (res.success) {
            toast.success(`Claim ${audit.action === 'approve' ? 'approved' : 'rejected'}`);
            setIsProcessOpen(false);
            setSelectedClaim(null);
            loadData();
        } else {
            toast.error(res.error || 'Failed to process claim');
        }
    };

    const openProcess = (claim: ReimbursementClaim) => {
        setSelectedClaim(claim);
        setAudit({ approvedAmount: claim.amount, notes: '', action: 'approve' });
        setIsProcessOpen(true);
    };

    const pendingCount = allClaims.filter(c => c.status === 'pending').length;
    const approvedCount = allClaims.filter(c => c.status === 'approved').length;
    const rejectedCount = allClaims.filter(c => c.status === 'rejected').length;
    const pendingAmount = allClaims.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0);
    const approvedAmount = allClaims.filter(c => c.status === 'approved').reduce((sum, c) => sum + (c.approvedAmount || c.amount), 0);

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
                <Card className="bg-white border-slate-200 shadow-sm"><CardContent className="p-4 text-center"><p className="text-slate-500 text-sm mb-1">Pending Claims</p><h3 className="text-2xl font-bold text-amber-600">{pendingCount}</h3><p className="text-xs text-slate-400">₹{pendingAmount.toLocaleString()}</p></CardContent></Card>
                <Card className="bg-white border-slate-200 shadow-sm"><CardContent className="p-4 text-center"><p className="text-slate-500 text-sm mb-1">Approved</p><h3 className="text-2xl font-bold text-emerald-600">{approvedCount}</h3><p className="text-xs text-slate-400">₹{approvedAmount.toLocaleString()}</p></CardContent></Card>
                <Card className="bg-white border-slate-200 shadow-sm"><CardContent className="p-4 text-center"><p className="text-slate-500 text-sm mb-1">Rejected</p><h3 className="text-2xl font-bold text-red-600">{rejectedCount}</h3></CardContent></Card>
                <Card className="bg-white border-slate-200 shadow-sm"><CardContent className="p-4 text-center"><p className="text-slate-500 text-sm mb-1">Total Claims</p><h3 className="text-2xl font-bold text-slate-900">{allClaims.length}</h3></CardContent></Card>
            </div>

            {/* TABS */}
            <Tabs value={filterStatus} onValueChange={setFilterStatus}>
                <TabsList className="bg-slate-100 border border-slate-200">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white">All ({allClaims.length})</TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:bg-white">Pending ({pendingCount})</TabsTrigger>
                    <TabsTrigger value="approved" className="data-[state=active]:bg-white">Approved ({approvedCount})</TabsTrigger>
                    <TabsTrigger value="rejected" className="data-[state=active]:bg-white">Rejected ({rejectedCount})</TabsTrigger>
                </TabsList>

                <TabsContent value={filterStatus} className="mt-4">
                    {/* LIST */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-12 text-slate-500">Loading...</div>
                        ) : claims.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">No claims found</div>
                        ) : (
                            claims.map(claim => (
                                <Card key={claim.id} className="bg-white border-slate-200 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                                    <CardContent className="p-4 flex items-center gap-6">
                                        <div className={`p-3 rounded-full ${claim.status === 'pending' ? 'bg-amber-50 border border-amber-100' : claim.status === 'approved' ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                                            {claim.status === 'pending' ? <Clock className="h-6 w-6 text-amber-600" /> : claim.status === 'approved' ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <XCircle className="h-6 w-6 text-red-600" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-slate-900 text-lg">{claim.title}</h3>
                                                    <Badge className={`text-xs border ${STATUS_STYLES[claim.status]}`}>{claim.status}</Badge>
                                                </div>
                                                <div className="font-mono text-emerald-600 font-bold">₹{claim.amount.toLocaleString()}</div>
                                            </div>
                                            <div className="flex gap-6 text-sm text-slate-500">
                                                <span className="font-mono">{claim.claimId}</span>
                                                <span>{claim.customerName}</span>
                                                <span>{claim.planName}</span>
                                                <span>{new Date(claim.submittedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {claim.status === 'pending' && (
                                                <Button variant="default" size="sm" onClick={() => openProcess(claim)} className="bg-emerald-600 hover:bg-emerald-700">Process</Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* PROCESS MODAL */}
            <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl">
                    {selectedClaim && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Process Claim: {selectedClaim.claimId}</DialogTitle>
                                <p className="text-sm text-slate-500">{selectedClaim.customerName} - {selectedClaim.planName}</p>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Claimed Amount</span>
                                        <span className="font-bold">₹{selectedClaim.amount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Action</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            variant={audit.action === 'approve' ? 'default' : 'outline'}
                                            className={audit.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 flex-1' : 'flex-1'}
                                            onClick={() => setAudit({ ...audit, action: 'approve' })}
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                        </Button>
                                        <Button
                                            variant={audit.action === 'reject' ? 'destructive' : 'outline'}
                                            className="flex-1"
                                            onClick={() => setAudit({ ...audit, action: 'reject' })}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" /> Reject
                                        </Button>
                                    </div>
                                </div>

                                {audit.action === 'approve' && (
                                    <div className="space-y-2">
                                        <Label>Approved Amount</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-500">₹</span>
                                            <Input type="number" value={audit.approvedAmount} onChange={e => setAudit({ ...audit, approvedAmount: parseFloat(e.target.value) || 0 })} className="pl-6" />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>{audit.action === 'reject' ? 'Rejection Reason *' : 'Notes'}</Label>
                                    <Textarea value={audit.notes} onChange={e => setAudit({ ...audit, notes: e.target.value })} placeholder={audit.action === 'reject' ? "Required" : "Optional"} />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsProcessOpen(false)}>Cancel</Button>
                                <Button 
                                    className={audit.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
                                    onClick={handleProcess}
                                >
                                    Confirm {audit.action === 'approve' ? 'Approval' : 'Rejection'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
