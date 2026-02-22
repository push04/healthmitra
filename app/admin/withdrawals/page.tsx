'use client';

import { useState, useEffect } from 'react';
import { WithdrawalRequest } from '@/types/wallet';
import { getWithdrawals, processWithdrawal } from '@/app/actions/withdrawals';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Filter, Eye, CheckCircle, XCircle, Building, Wallet, DollarSign, Clock, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-blue-100 text-blue-800 border-blue-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export default function WithdrawalsPage() {
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
    const [isProcessOpen, setIsProcessOpen] = useState(false);
    const [audit, setAudit] = useState({ notes: '', action: 'approve' as 'approve' | 'reject' | 'complete' });
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, completed: 0, totalPending: 0 });

    const loadData = async () => {
        setLoading(true);
        const res = await getWithdrawals();
        if (res.success && res.data) {
            setWithdrawals(res.data);
            const pending = res.data.filter((w: WithdrawalRequest) => w.status === 'pending').length;
            const approved = res.data.filter((w: WithdrawalRequest) => w.status === 'approved').length;
            const rejected = res.data.filter((w: WithdrawalRequest) => w.status === 'rejected').length;
            const completed = res.data.filter((w: WithdrawalRequest) => w.status === 'completed').length;
            const totalPending = res.data.filter((w: WithdrawalRequest) => w.status === 'pending').reduce((sum: number, w: WithdrawalRequest) => sum + w.amount, 0);
            setStats({ pending, approved, rejected, completed, totalPending });
        }
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleProcess = async () => {
        if (!selectedWithdrawal) return;
        if (audit.action === 'reject' && !audit.notes) return toast.error("Rejection reason required");

        const result = await processWithdrawal(selectedWithdrawal.id, audit.action, audit.notes);
        if (result.success) {
            setIsProcessOpen(false);
            setSelectedWithdrawal(null);
            loadData();
            toast.success(`Withdrawal ${audit.action}ed successfully`);
        } else {
            toast.error(result.error || 'Failed to process withdrawal');
        }
    };

    const openProcess = (withdrawal: WithdrawalRequest) => {
        setSelectedWithdrawal(withdrawal);
        setAudit({ notes: '', action: withdrawal.status === 'pending' ? 'approve' : 'complete' });
        setIsProcessOpen(true);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const maskAccount = (account: string) => {
        if (!account || account.length < 4) return account;
        return '****' + account.slice(-4);
    };

    return (
        <div className="space-y-6 animate-in fade-in max-w-[1600px] mx-auto p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Withdrawal Requests</h1>
                    <p className="text-slate-500 text-sm mt-1">Process customer wallet withdrawal requests.</p>
                </div>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-5 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 text-center">
                        <p className="text-slate-500 text-sm mb-1">Pending</p>
                        <h3 className="text-2xl font-bold text-amber-600">{stats.pending}</h3>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 text-center">
                        <p className="text-slate-500 text-sm mb-1">Pending Amount</p>
                        <h3 className="text-2xl font-bold text-amber-600">₹{stats.totalPending.toLocaleString()}</h3>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 text-center">
                        <p className="text-slate-500 text-sm mb-1">Approved</p>
                        <h3 className="text-2xl font-bold text-blue-600">{stats.approved}</h3>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 text-center">
                        <p className="text-slate-500 text-sm mb-1">Rejected</p>
                        <h3 className="text-2xl font-bold text-red-600">{stats.rejected}</h3>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-4 text-center">
                        <p className="text-slate-500 text-sm mb-1">Completed</p>
                        <h3 className="text-2xl font-bold text-emerald-600">{stats.completed}</h3>
                    </CardContent>
                </Card>
            </div>

            {/* LIST */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading...</div>
                ) : withdrawals.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">No withdrawal requests found</div>
                ) : (
                    withdrawals.map(withdrawal => (
                        <Card key={withdrawal.id} className="bg-white border-slate-200 shadow-sm transition-all hover:border-amber-200 hover:shadow-md">
                            <CardContent className="p-4 flex items-center gap-6">
                                <div className="bg-amber-50 p-3 rounded-full border border-amber-100">
                                    <Wallet className="h-6 w-6 text-amber-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <h3 className="font-bold text-slate-900 text-lg">{withdrawal.customerName}</h3>
                                        <div className="font-mono text-amber-600 font-bold">₹{withdrawal.amount.toLocaleString()}</div>
                                    </div>
                                    <div className="flex gap-6 text-sm text-slate-500">
                                        <span>{withdrawal.customerEmail}</span>
                                        <span className="flex items-center gap-1"><Building className="h-3 w-3" /> {withdrawal.bankName}</span>
                                        <span>****{withdrawal.bankAccount.slice(-4)}</span>
                                        <span>{formatDate(withdrawal.createdAt)}</span>
                                    </div>
                                </div>
                                <Badge className={statusColors[withdrawal.status] || 'bg-slate-100 text-slate-800'}>
                                    {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                                </Badge>
                                <div className="flex gap-2">
                                    {withdrawal.status === 'pending' && (
                                        <Button variant="outline" size="sm" onClick={() => openProcess(withdrawal)} className="border-slate-200 hover:bg-slate-50 text-slate-700">
                                            Review
                                        </Button>
                                    )}
                                    {withdrawal.status === 'approved' && (
                                        <Button variant="outline" size="sm" onClick={() => openProcess(withdrawal)} className="border-emerald-200 hover:bg-emerald-50 text-emerald-700">
                                            Mark Complete
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* PROCESS MODAL */}
            <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl">
                    {selectedWithdrawal && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-xl text-slate-900">
                                Process Withdrawal Request
                                </DialogTitle>
                                <div className="text-sm text-slate-500 mt-1">
                                    Submitted on {formatDate(selectedWithdrawal.createdAt)}
                                </div>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* AMOUNT */}
                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-amber-800 font-medium">Withdrawal Amount</span>
                                        <span className="text-2xl font-bold text-amber-600">₹{selectedWithdrawal.amount.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* BANK DETAILS */}
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                                    <h4 className="font-semibold text-slate-700 flex items-center gap-2"><Building className="h-4 w-4" /> Bank Details</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-slate-500">Bank Name</span>
                                            <p className="text-slate-900 font-medium">{selectedWithdrawal.bankName}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Account Number</span>
                                            <p className="text-slate-900 font-medium font-mono">{maskAccount(selectedWithdrawal.bankAccount)}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">IFSC Code</span>
                                            <p className="text-slate-900 font-medium font-mono">{selectedWithdrawal.ifscCode}</p>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Customer</span>
                                            <p className="text-slate-900 font-medium">{selectedWithdrawal.customerName}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* ACTION BUTTONS */}
                                {selectedWithdrawal.status === 'pending' && (
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
                                )}

                                {selectedWithdrawal.status === 'approved' && (
                                    <div className="space-y-2">
                                        <Label className="text-slate-700">Mark as Completed</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="default"
                                                className="bg-emerald-600 hover:bg-emerald-700 flex-1 text-white"
                                                onClick={() => setAudit({ ...audit, action: 'complete' })}
                                            >
                                                <Check className="mr-2 h-4 w-4" /> Mark as Completed (Funds Transferred)
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-slate-700">
                                        {audit.action === 'reject' ? 'Rejection Reason *' : 'Internal Notes (Optional)'}
                                    </Label>
                                    <Textarea 
                                        value={audit.notes} 
                                        onChange={e => setAudit({ ...audit, notes: e.target.value })} 
                                        className="bg-white border-slate-200 text-slate-900" 
                                        placeholder={audit.action === 'reject' ? "Please explain why this withdrawal is being rejected..." : "Any observations..."} 
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsProcessOpen(false)} className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                                    Cancel
                                </Button>
                                <Button 
                                    className={audit.action === 'approve' || audit.action === 'complete' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"} 
                                    onClick={handleProcess}
                                >
                                    Confirm {audit.action === 'approve' ? 'Approval' : audit.action === 'complete' ? 'Completion' : 'Rejection'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
