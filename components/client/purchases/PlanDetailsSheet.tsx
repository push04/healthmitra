"use client";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { PurchasedPlan } from "@/types/dashboard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    ShieldCheck, Calendar, FileText, Download,
    CreditCard, ExternalLink, Clock, CheckCircle,
    AlertTriangle, ShoppingBag, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberManagement } from "./MemberManagement";

interface PlanDetailsSheetProps {
    plan: PurchasedPlan | null;
    isOpen: boolean;
    onClose: () => void;
    documents?: { name: string; date: string; size: string }[];
    claims?: { id: string; type: string; amount: number; date: string; status: string }[];
    members?: any[];
}

export function PlanDetailsSheet({ plan, isOpen, onClose, documents = [], claims = [], members = [] }: PlanDetailsSheetProps) {
    if (!plan) return null;

    const isExpired = plan.status === 'expired';
    // Calculate days based on plan validity (default 365 days if not available)
    const totalDays = plan.daysRemaining > 0 ? plan.daysRemaining + (plan.daysRemaining < 365 ? 365 - plan.daysRemaining : 0) : 365;
    const daysElapsed = Math.max(0, totalDays - plan.daysRemaining);
    const elapsedPercent = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-4xl overflow-y-auto sm:rounded-l-xl p-0">

                {/* Header Fixed */}
                <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                            <ShieldCheck className="h-7 w-7" />
                        </div>
                        <div>
                            <SheetTitle className="text-xl font-bold text-slate-900">{plan.name}</SheetTitle>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <span>Plan ID: {plan.policyNumber}</span>
                                {plan.status === 'active' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 h-5">Active</Badge>}
                                {plan.status === 'expired' && <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 h-5">Expired</Badge>}
                            </div>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                        <Download className="h-4 w-4" /> Download PDF
                    </Button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full justify-start border-b border-slate-200 rounded-none bg-transparent p-0 mb-6 h-auto">
                            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-teal-600 px-4 py-3">Overview</TabsTrigger>
                            <TabsTrigger value="coverage" className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-teal-600 px-4 py-3">Coverage</TabsTrigger>
                            <TabsTrigger value="members" className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-teal-600 px-4 py-3">Members</TabsTrigger>
                            <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-teal-600 px-4 py-3">Documents</TabsTrigger>
                            <TabsTrigger value="claims" className="rounded-none border-b-2 border-transparent data-[state=active]:border-teal-600 data-[state=active]:bg-transparent data-[state=active]:text-teal-600 px-4 py-3">Claims</TabsTrigger>
                        </TabsList>

                        {/* OVERVIEW TAB */}
                        <TabsContent value="overview" className="space-y-8 animate-in fade-in-50 duration-300">

                            {/* Purchase Info */}
                            <section className="space-y-4">
                                <h3 className="font-semibold text-slate-900">Purchase Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl bg-slate-50 p-5 border border-slate-100">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Purchase Date</span>
                                            <span className="text-sm font-medium text-slate-900">{new Date(plan.purchaseDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Transaction ID</span>
                                            <span className="text-sm font-medium text-slate-900">TXN-20240115-ABC123</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3 md:border-l md:border-slate-200 md:pl-4">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Amount Paid</span>
                                            <span className="text-sm font-bold text-slate-900">₹ 12,500</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-500">Payment Mode</span>
                                            <span className="text-sm font-medium text-slate-900">UPI</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Validity Period */}
                            <section className="space-y-4">
                                <h3 className="font-semibold text-slate-900">Validity Period</h3>
                                <div className="rounded-xl border border-slate-200 p-5">
                                    <div className="flex justify-between mb-2 text-sm">
                                        <div>
                                            <p className="text-slate-500 mb-1">Start Date</p>
                                            <p className="font-medium text-slate-900">{new Date(plan.validFrom).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-500 mb-1">End Date</p>
                                            <p className="font-medium text-slate-900">{new Date(plan.validUntil).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    {!isExpired && (
                                        <div className="mt-6">
                                            <div className="flex justify-between text-xs mb-2">
                                                <span className="text-slate-500">{daysElapsed} days elapsed</span>
                                                <span className="text-emerald-600 font-medium">{plan.daysRemaining} days remaining ({Math.round((plan.daysRemaining / totalDays) * 100)}%)</span>
                                            </div>
                                            <Progress value={elapsedPercent} className="h-2.5 bg-slate-100" />
                                        </div>
                                    )}
                                </div>
                            </section>
                        </TabsContent>

                        {/* COVERAGE TAB */}
                        <TabsContent value="coverage" className="space-y-8 animate-in fade-in-50 duration-300">
                            <section>
                                <h3 className="font-semibold text-slate-900 mb-4">Coverage Limits</h3>
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Service Type</th>
                                                <th className="px-4 py-3 font-medium">Limit</th>
                                                <th className="px-4 py-3 font-medium">Used</th>
                                                <th className="px-4 py-3 font-medium text-right">Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            <tr>
                                                <td className="px-4 py-3 text-slate-700">OPD Consultation</td>
                                                <td className="px-4 py-3 text-slate-900 font-medium">₹ 25,000</td>
                                                <td className="px-4 py-3 text-slate-500">₹ 4,200</td>
                                                <td className="px-4 py-3 text-right text-emerald-600 font-medium">₹ 20,800</td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 text-slate-700">Hospitalization</td>
                                                <td className="px-4 py-3 text-slate-900 font-medium">₹ 5,00,000</td>
                                                <td className="px-4 py-3 text-slate-500">₹ 0</td>
                                                <td className="px-4 py-3 text-right text-emerald-600 font-medium">₹ 5,00,000</td>
                                            </tr>
                                            {/* Mocking row for visual check */}
                                            <tr>
                                                <td className="px-4 py-3 text-slate-700">Ambulance</td>
                                                <td className="px-4 py-3 text-slate-900 font-medium">₹ 5,000</td>
                                                <td className="px-4 py-3 text-slate-500">₹ 0</td>
                                                <td className="px-4 py-3 text-right text-emerald-600 font-medium">₹ 5,000</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section>
                                <h3 className="font-semibold text-slate-900 mb-4">Included Services</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {plan.benefits.map(b => (
                                        <div key={b.id} className="flex items-center gap-2 p-3 rounded-lg bg-teal-50/50 border border-teal-100">
                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            <span className="text-sm text-slate-700">{b.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </TabsContent>

                        {/* MEMBERS TAB */}
                        <TabsContent value="members" className="animate-in fade-in-50 duration-300">
                            <MemberManagement
                                members={members}
                                onUpdateMembers={() => { }}
                            />
                        </TabsContent>

                        {/* DOCUMENTS TAB */}
                        <TabsContent value="documents" className="animate-in fade-in-50 duration-300">
                            <h3 className="font-semibold text-slate-900 mb-4">Policy Documents</h3>
                            <div className="space-y-3">
                                {documents.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">No documents available</div>
                                ) : documents.map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{doc.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span>Uploaded: {doc.date}</span>
                                                    <span>•</span>
                                                    <span>{doc.size}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-teal-600">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* CLAIMS TAB */}
                        <TabsContent value="claims" className="animate-in fade-in-50 duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-900">Claims History</h3>
                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Total: {claims.length}</span>
                            </div>
                            <div className="space-y-3">
                                {claims.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400">No claims yet</div>
                                ) : claims.map(claim => (
                                    <div key={claim.id} className="p-4 rounded-xl border border-slate-200 bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-slate-900">{claim.type}</p>
                                                <p className="text-xs text-slate-500">Claim #{claim.id} • {claim.date}</p>
                                            </div>
                                            <Badge className={
                                                claim.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200' :
                                                    claim.status === 'Pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200' : ''
                                            }>{claim.status}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                                            <span className="font-medium text-slate-900">₹ {claim.amount.toLocaleString('en-US')}</span>
                                            <Button variant="link" size="sm" className="h-auto p-0 text-teal-600">View Details →</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                    </Tabs>
                </div>

            </SheetContent>
        </Sheet>
    );
}
