"use client";

import { useState } from "react";
import {
    TestTube, Pill, Ambulance, Stethoscope,
    UserPlus, Activity, Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ServiceCard } from "@/components/client/services/ServiceCard";

export default function ServiceRequestsPage() {
    const [searchQuery, setSearchQuery] = useState("");

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
        }
    ];

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
                    <p className="text-slate-500">Book healthcare services for you and your family</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-slate-200 focus:ring-teal-500 focus:border-teal-500"
                    />
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map(service => (
                    <ServiceCard
                        key={service.id}
                        {...service}
                        link={service.link}
                    />
                ))}
            </div>
        </div>
    );
}
