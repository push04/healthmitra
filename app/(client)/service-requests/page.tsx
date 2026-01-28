"use client";

import { useState, useEffect } from "react";
import {
    TestTube, Pill, Ambulance, Stethoscope,
    UserPlus, Activity, Search, Gift, MessageSquare, AlertTriangle, User
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCard } from "@/components/client/services/ServiceCard";
import Link from "next/link";
import { ServiceRequestFilters, FilterState } from "@/components/client/requests/ServiceRequestFilters";
import { LatestRequestPopup } from "@/components/client/requests/LatestRequestPopup";

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

// MOCK RAISED REQUESTS WITH MORE DATA
const MOCK_REQUESTS = [
    {
        id: "REQ-2025-0120-001",
        type: "medicine",
        title: "Medicine Order",
        description: "Monthly blood pressure medicines - Amlodipine, Losartan",
        status: "approved",
        previousStatus: "pending",
        member: "self",
        doctorName: "Dr. Sharma",
        hospitalName: "City Hospital",
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        teamReply: "Order has been approved and dispatched. Expected delivery: Tomorrow.",
        isNew: true
    },
    {
        id: "REQ-2025-0119-002",
        type: "diagnostic",
        title: "Blood Test - CBC",
        description: "Complete blood count test for general checkup",
        status: "completed",
        previousStatus: "in_progress",
        member: "spouse",
        doctorName: null,
        hospitalName: "HealthMitra Labs",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        teamReply: "Test completed. Report uploaded to your PHR section.",
        isNew: true
    },
    {
        id: "REQ-2025-0118-003",
        type: "medical_consultation",
        title: "Doctor Appointment",
        description: "General physician consultation for fever symptoms",
        status: "pending",
        previousStatus: null,
        member: "self",
        doctorName: "Dr. Priyanka",
        hospitalName: "HealthMitra Clinic",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        teamReply: null,
        isNew: false
    },
    {
        id: "REQ-2025-0115-004",
        type: "voucher",
        title: "Voucher Redemption",
        description: "₹500 voucher for medicine purchase",
        status: "cleared",
        previousStatus: "approved",
        member: "self",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        teamReply: "Voucher redeemed successfully. Amount credited to wallet.",
        isNew: false
    },
    {
        id: "REQ-2025-0117-005",
        type: "nursing",
        title: "Nursing Visit",
        description: "Wound dressing for post-surgery care",
        status: "rejected",
        previousStatus: "under_review",
        member: "father",
        doctorName: null,
        hospitalName: null,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        teamReply: "Rejected: This service is not covered under your current plan. Please upgrade to Gold plan.",
        isNew: true
    },
    {
        id: "REQ-2025-0110-006",
        type: "ambulance",
        title: "Ambulance Booking",
        description: "Non-emergency hospital transfer",
        status: "bill_rejected",
        previousStatus: "completed",
        member: "mother",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        teamReply: "Bill rejected: Uploaded bill does not match the service dates. Please resubmit.",
        isNew: false
    }
];

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        pending: "bg-amber-100 text-amber-700 border-amber-200",
        approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
        completed: "bg-blue-100 text-blue-700 border-blue-200",
        rejected: "bg-red-100 text-red-700 border-red-200",
        cleared: "bg-purple-100 text-purple-700 border-purple-200",
        bill_rejected: "bg-rose-100 text-rose-700 border-rose-200",
        in_progress: "bg-indigo-100 text-indigo-700 border-indigo-200",
        under_review: "bg-cyan-100 text-cyan-700 border-cyan-200",
        cancelled: "bg-slate-100 text-slate-700 border-slate-200"
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase border ${colors[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
            {status.replace('_', ' ')}
        </span>
    );
}

function MemberBadge({ member }: { member: string }) {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
            <User className="h-3 w-3" />
            {member.charAt(0).toUpperCase() + member.slice(1)}
        </span>
    );
}

const DEFAULT_FILTERS: FilterState = {
    search: '',
    type: 'all',
    status: 'all',
    member: 'all',
    dateRange: 'all',
};

export default function ServiceRequestsPage() {
    const [activeTab, setActiveTab] = useState("book");
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [showPopup, setShowPopup] = useState(false);
    const [dismissedUpdates, setDismissedUpdates] = useState<string[]>([]);

    // Get new updates for popup
    const newUpdates = MOCK_REQUESTS.filter(req =>
        req.isNew &&
        req.previousStatus &&
        !dismissedUpdates.includes(req.id)
    ).map(req => ({
        id: req.id,
        title: req.title,
        requestId: req.id,
        previousStatus: req.previousStatus || '',
        newStatus: req.status,
        updatedAt: req.updatedAt,
        adminComment: req.teamReply || undefined
    }));

    // Show popup when landing on page and there are new updates
    useEffect(() => {
        if (newUpdates.length > 0 && activeTab === 'requests') {
            const hasShownPopup = sessionStorage.getItem('shownRequestPopup');
            if (!hasShownPopup) {
                setShowPopup(true);
                sessionStorage.setItem('shownRequestPopup', 'true');
            }
        }
    }, [activeTab, newUpdates.length]);

    // Apply filters
    const filteredRequests = MOCK_REQUESTS.filter(req => {
        // Search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const matchSearch =
                req.id.toLowerCase().includes(searchLower) ||
                req.title.toLowerCase().includes(searchLower) ||
                req.description.toLowerCase().includes(searchLower) ||
                (req.doctorName && req.doctorName.toLowerCase().includes(searchLower)) ||
                (req.hospitalName && req.hospitalName.toLowerCase().includes(searchLower));
            if (!matchSearch) return false;
        }

        // Type filter
        if (filters.type !== 'all' && req.type !== filters.type) return false;

        // Status filter
        if (filters.status !== 'all' && req.status !== filters.status) return false;

        // Member filter
        if (filters.member !== 'all' && req.member !== filters.member) return false;

        // Date filter
        if (filters.dateRange !== 'all') {
            const reqDate = new Date(req.createdAt);
            const now = new Date();

            switch (filters.dateRange) {
                case 'today':
                    if (reqDate.toDateString() !== now.toDateString()) return false;
                    break;
                case '7days':
                    if (now.getTime() - reqDate.getTime() > 7 * 24 * 60 * 60 * 1000) return false;
                    break;
                case '30days':
                    if (now.getTime() - reqDate.getTime() > 30 * 24 * 60 * 60 * 1000) return false;
                    break;
                case '3months':
                    if (now.getTime() - reqDate.getTime() > 90 * 24 * 60 * 60 * 1000) return false;
                    break;
                case 'custom':
                    if (filters.customStart && reqDate < new Date(filters.customStart)) return false;
                    if (filters.customEnd && reqDate > new Date(filters.customEnd)) return false;
                    break;
            }
        }

        return true;
    });

    const filteredServices = filters.search
        ? SERVICES.filter(s =>
            s.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            s.description.toLowerCase().includes(filters.search.toLowerCase())
        )
        : SERVICES;

    const handleDismissUpdates = (ids: string[]) => {
        setDismissedUpdates(prev => [...prev, ...ids]);
    };

    return (
        <div className="container mx-auto max-w-7xl animate-in fade-in-50 duration-500">
            {/* Latest Request Popup */}
            {showPopup && newUpdates.length > 0 && (
                <LatestRequestPopup
                    updates={newUpdates}
                    onClose={() => setShowPopup(false)}
                    onDismiss={handleDismissUpdates}
                />
            )}

            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Service Requests</h1>
                    <p className="text-slate-500">Book healthcare services and track your requests</p>
                </div>

                {/* New Updates Badge */}
                {newUpdates.length > 0 && (
                    <button
                        onClick={() => setShowPopup(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-teal-200 hover:shadow-xl transition-all animate-pulse"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        {newUpdates.length} New Update{newUpdates.length > 1 ? 's' : ''}
                    </button>
                )}
            </div>

            {/* Tabs: Book Services / My Requests */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="book" className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Book Services
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm relative">
                        My Requests ({MOCK_REQUESTS.length})
                        {newUpdates.length > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {newUpdates.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Book Services */}
                <TabsContent value="book" className="space-y-6">
                    {/* Simple Search for Book Tab */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            placeholder="Search services..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

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
                    {/* Advanced Filters */}
                    <ServiceRequestFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        onReset={() => setFilters(DEFAULT_FILTERS)}
                    />

                    {/* Results Count */}
                    <div className="text-sm text-slate-500 mb-4">
                        Showing {filteredRequests.length} of {MOCK_REQUESTS.length} requests
                    </div>

                    {filteredRequests.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                            <div className="text-6xl mb-4">📋</div>
                            <p className="text-slate-600 font-medium">No requests found</p>
                            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or book a new service</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredRequests.map(req => (
                                <div key={req.id} className={`bg-white rounded-xl border ${req.isNew ? 'border-teal-200 ring-1 ring-teal-100' : 'border-slate-200'} p-5 shadow-sm hover:shadow-md transition-all`}>
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <h3 className="font-bold text-slate-800">{req.title}</h3>
                                                <StatusBadge status={req.status} />
                                                <MemberBadge member={req.member} />
                                                {req.isNew && (
                                                    <span className="px-2 py-0.5 bg-teal-500 text-white rounded-full text-xs font-bold animate-pulse">
                                                        NEW
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mb-2">
                                                ID: <span className="font-mono">{req.id}</span>
                                            </p>
                                            <p className="text-sm text-slate-600 mb-2">{req.description}</p>

                                            {req.doctorName && (
                                                <p className="text-xs text-slate-500">
                                                    Doctor: <span className="text-slate-700">{req.doctorName}</span>
                                                </p>
                                            )}
                                            {req.hospitalName && (
                                                <p className="text-xs text-slate-500">
                                                    Hospital/Lab: <span className="text-slate-700">{req.hospitalName}</span>
                                                </p>
                                            )}

                                            <p className="text-xs text-slate-400 mt-2">
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
                                            className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:underline whitespace-nowrap flex-shrink-0"
                                        >
                                            View Details →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
