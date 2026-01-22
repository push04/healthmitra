"use client";

import { useState } from "react";
import {
    TestTube, Pill, Ambulance, Stethoscope,
    UserPlus, Activity, Search, Gift, MessageSquare, AlertTriangle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCard } from "@/components/client/services/ServiceCard";
import Link from "next/link";

// SERVICE TYPES
const SERVICES = [
    {
        id: 'diagnostic',
        title: 'Diagnostic Tests',
        description: 'Book blood tests, full body checkups, and radiology services at home or center.',
        icon: TestTube,
        colorClass: 'text-purple-600 bg-purple-50',
        link: '/service-requests/new?type=diagnostic'
    },
    {
        id: 'medicine',
        title: 'Order Medicines',
        description: 'Upload prescription and get medicines delivered to your doorstep.',
        icon: Pill,
        colorClass: 'text-emerald-600 bg-emerald-50',
        link: '/service-requests/new?type=medicine'
    },
    {
        id: 'ambulance',
        title: 'Ambulance',
        description: 'Book emergency or non-emergency ambulance services instantly.',
        icon: Ambulance,
        colorClass: 'text-red-600 bg-red-50',
        link: '/service-requests/new?type=ambulance'
    },
    {
        id: 'doctor',
        title: 'Doctor Appointment',
        description: 'Consult with top specialists online or visit a nearby clinic.',
        icon: Stethoscope,
        colorClass: 'text-blue-600 bg-blue-50',
        link: '/service-requests/new?type=medical_consultation'
    },
    {
        id: 'caretaker',
        title: 'Caretaker Services',
        description: 'Professional nursing and caretaker support for home recovery.',
        icon: UserPlus,
        colorClass: 'text-orange-600 bg-orange-50',
        link: '/service-requests/new?type=caretaker'
    },
    {
        id: 'nursing',
        title: 'Nursing Procedures',
        description: 'Injection, wound dressing, and other nursing procedures at home.',
        icon: Activity,
        colorClass: 'text-cyan-600 bg-cyan-50',
        link: '/service-requests/new?type=nursing'
    },
    {
        id: 'voucher',
        title: 'Redeem Voucher',
        description: 'Redeem your available vouchers for services, medicines, or tests.',
        icon: Gift,
        colorClass: 'text-pink-600 bg-pink-50',
        link: '/service-requests/new?type=voucher'
    },
    {
        id: 'general',
        title: 'General Request',
        description: 'Submit any general inquiry or request to our support team.',
        icon: MessageSquare,
        colorClass: 'text-slate-600 bg-slate-50',
        link: '/service-requests/new?type=general'
    },
    {
        id: 'emergency',
        title: 'Emergency Service',
        description: '24x7 emergency support for critical health situations.',
        icon: AlertTriangle,
        colorClass: 'text-rose-600 bg-rose-50',
        link: '/service-requests/new?type=emergency'
    }
];

// MOCK RAISED REQUESTS
const MOCK_REQUESTS = [
    {
        id: "sr-001",
        type: "medicine",
        title: "Medicine Order",
        description: "Monthly blood pressure medicines - Amlodipine, Losartan",
        status: "approved",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        teamReply: "Order has been approved and dispatched. Expected delivery: Tomorrow."
    },
    {
        id: "sr-002",
        type: "diagnostic",
        title: "Blood Test - CBC",
        description: "Complete blood count test for general checkup",
        status: "completed",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        teamReply: "Test completed. Report uploaded to your PHR section."
    },
    {
        id: "sr-003",
        type: "medical_consultation",
        title: "Doctor Appointment",
        description: "General physician consultation for fever symptoms",
        status: "pending",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        teamReply: null
    },
    {
        id: "sr-004",
        type: "voucher",
        title: "Voucher Redemption",
        description: "₹500 voucher for medicine purchase",
        status: "cleared",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        teamReply: "Voucher redeemed successfully. Amount credited to wallet."
    },
    {
        id: "sr-005",
        type: "nursing",
        title: "Nursing Visit",
        description: "Wound dressing for post-surgery care",
        status: "rejected",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        teamReply: "Rejected: This service is not covered under your current plan. Please upgrade to Gold plan."
    },
    {
        id: "sr-006",
        type: "ambulance",
        title: "Ambulance Booking",
        description: "Non-emergency hospital transfer",
        status: "bill_rejected",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        teamReply: "Bill rejected: Uploaded bill does not match the service dates. Please resubmit."
    }
];

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        pending: "bg-amber-100 text-amber-700",
        approved: "bg-emerald-100 text-emerald-700",
        completed: "bg-blue-100 text-blue-700",
        rejected: "bg-red-100 text-red-700",
        cleared: "bg-purple-100 text-purple-700",
        bill_rejected: "bg-rose-100 text-rose-700"
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
            {status.replace('_', ' ')}
        </span>
    );
}

export default function ServiceRequestsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("book");

    const filteredServices = SERVICES.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto max-w-7xl animate-in fade-in-50 duration-500">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Service Requests</h1>
                    <p className="text-slate-500">Book healthcare services and track your requests</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-slate-200 focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>
            </div>

            {/* Tabs: Book Services / My Requests */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="book" className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Book Services
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        My Requests ({MOCK_REQUESTS.length})
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Book Services */}
                <TabsContent value="book" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredServices.map(service => (
                            <ServiceCard
                                key={service.id}
                                {...service}
                                link={service.link}
                            />
                        ))}
                    </div>
                </TabsContent>

                {/* Tab 2: My Requests */}
                <TabsContent value="requests" className="space-y-4">
                    {MOCK_REQUESTS.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            No requests found. Book a service to get started.
                        </div>
                    ) : (
                        MOCK_REQUESTS.map(req => (
                            <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-slate-800">{req.title}</h3>
                                            <StatusBadge status={req.status} />
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2">{req.description}</p>
                                        <p className="text-xs text-slate-400">
                                            Submitted: {new Date(req.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>

                                        {/* Team Reply */}
                                        {req.teamReply && (
                                            <div className={`mt-4 p-3 rounded-lg text-sm ${req.status === 'rejected' || req.status === 'bill_rejected'
                                                    ? 'bg-red-50 border border-red-100 text-red-700'
                                                    : 'bg-teal-50 border border-teal-100 text-teal-800'
                                                }`}>
                                                <span className="font-semibold">Team Reply: </span>
                                                {req.teamReply}
                                            </div>
                                        )}

                                        {!req.teamReply && req.status === 'pending' && (
                                            <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-sm">
                                                <span className="font-semibold">Status: </span>
                                                Awaiting team response. We will update you soon.
                                            </div>
                                        )}
                                    </div>
                                    <Link
                                        href={`/service-requests/${req.id}`}
                                        className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline whitespace-nowrap"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
