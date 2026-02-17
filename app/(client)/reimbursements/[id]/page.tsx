import React from 'react';
import ClaimStatusTimeline from '@/components/client/reimbursements/ClaimStatusTimeline';
import { ChevronLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import DownloadDocsButton from "@/components/client/reimbursements/DownloadDocsButton";

const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
        case 'processing': return 'bg-amber-100 text-amber-800 border-amber-200';
        default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
}

export default async function ClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: claim } = await supabase.from('reimbursement_claims')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (!claim) notFound();

    // Transform to match UI expectation if needed or use directly
    // Mock timeline for now as backend might not support it yet
    const timeline = [
        { status: 'Claim Submitted', date: new Date(claim.created_at).toLocaleDateString('en-IN'), isCompleted: true },
        { status: 'Under Review', date: claim.status !== 'pending' ? 'Completed' : 'Pending', isCompleted: claim.status !== 'pending' },
        { status: 'Decision Pending', date: ['approved', 'rejected'].includes(claim.status) ? 'Completed' : 'Pending', isCompleted: ['approved', 'rejected'].includes(claim.status) }
    ];

    const documents = claim.documents || [];

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div>
                <Link href="/reimbursements" className="flex items-center gap-1 text-slate-500 hover:text-slate-800 mb-4 transition-colors">
                    <ChevronLeft size={18} /> Back to Claims
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">Claim Details</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-xl font-bold text-teal-600">Rx</span>
                            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">{claim.type?.replace('_', ' ') || 'Medical Reimbursement'}</h2>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${getStatusStyle(claim.status)}`}>
                                {claim.status}
                            </span>
                        </div>
                        <div className="text-sm text-slate-500 flex gap-4">
                            <span>ID: <span className="font-mono text-slate-700">{id.slice(0, 8)}</span></span>
                            <span className="hidden md:inline">|</span>
                            <span>Submitted: {new Date(claim.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Claim Status</h3>
                            <ClaimStatusTimeline timeline={timeline} />
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">Claim Details</h3>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                <div>
                                    <p className="text-slate-500 text-xs">Patient Name</p>
                                    <p className="font-semibold text-slate-800">{claim.patient_name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Date of Treatment</p>
                                    <p className="font-semibold text-slate-800">{new Date(claim.treatment_date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Hospital/Provider</p>
                                    <p className="font-semibold text-slate-800">{claim.hospital_name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Claimed Amount</p>
                                    <p className="font-semibold text-slate-800">₹{claim.amount?.toLocaleString()}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-slate-500 text-xs">Diagnosis</p>
                                    <p className="font-semibold text-slate-800">{claim.diagnosis}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Uploaded Documents ({documents.length})</h3>
                            <div className="space-y-3">
                                {documents.map((doc: any, idx: number) => (
                                    <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                                                <FileText size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">{doc.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DownloadDocsButton count={documents.length} />
                    </div>
                </div>
            </div>
        </div>
    );
}
