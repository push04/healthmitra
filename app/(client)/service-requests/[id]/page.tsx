import React from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { RequestTimeline } from "@/components/client/requests/RequestTimeline";

// MOCK DATA
const MOCK_REQUEST = {
    id: "sr-001",
    type: "medical_consultation",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    details: {
        doctorName: "Dr. Demo Physician",
        specialization: "General Medicine",
        preferredDate: "2024-02-01",
        preferredTime: "10:00 AM",
        memberName: "Test User",
        symptoms: "General health checkup and consultation"
    },
    timeline: [
        { status: 'submitted', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), completed: true, label: 'Request Submitted' },
        { status: 'under_review', timestamp: '', completed: false, label: 'Under Review' },
        { status: 'completed', timestamp: '', completed: false, label: 'Completed' }
    ]
};

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Always use mock data
    const request = MOCK_REQUEST;
    const details = request.details;

    return (
        <div className="container mx-auto max-w-5xl py-6 animate-in fade-in-50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/service-requests">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Request Details</h1>
                        <p className="text-slate-500">Track and manage your service request</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <Badge className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-100 uppercase">{request.type?.replace('_', ' ')}</Badge>
                                <h2 className="text-xl font-bold text-slate-900">{id.slice(0, 8).toUpperCase()}</h2>
                            </div>
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 uppercase">
                                {request.status}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <h3 className="font-semibold text-slate-700 mb-2">Service Details</h3>
                                <div className="space-y-2 text-slate-600">
                                    <p><span className="text-slate-400">Request Date:</span> <br />{new Date(request.createdAt).toLocaleString()}</p>
                                    <p><span className="text-slate-400">Doctor/Provider:</span> <br />{details.doctorName}</p>
                                    <p><span className="text-slate-400">Specialization:</span> <br />{details.specialization}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-700 mb-2">Scheduling</h3>
                                <div className="space-y-2 text-slate-600">
                                    <p><span className="text-slate-400">Date & Time:</span> <br />
                                        <span className="font-medium text-teal-700 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {details.preferredDate} {details.preferredTime}
                                        </span>
                                    </p>
                                    <p><span className="text-slate-400">Member:</span> <br />{details.memberName}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h3 className="font-semibold text-slate-700 mb-2">Symptoms / Reason</h3>
                            <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm">
                                {details.symptoms}
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Status */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-6">Status Timeline</h3>
                        <RequestTimeline
                            steps={request.timeline.map((step: any, idx: number) => ({
                                id: `step-${idx}`,
                                label: step.label,
                                status: step.completed ? 'completed' : (idx === 0 ? 'current' : 'pending'),
                                date: step.timestamp ? new Date(step.timestamp).toLocaleDateString() : undefined
                            }))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
