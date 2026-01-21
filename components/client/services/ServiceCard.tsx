"use client";

import { Button } from "@/components/ui/button";
import { LucideIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ServiceCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    colorClass: string;
    link: string;
}

export function ServiceCard({ title, description, icon: Icon, colorClass, link }: ServiceCardProps) {
    return (
        <Link href={link} className="block group">
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-teal-200 cursor-pointer text-left h-full">
                <div className={cn("mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg", colorClass)}>
                    <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-teal-700">{title}</h3>
                <p className="mb-6 text-sm text-slate-500">{description}</p>

                <div className="flex items-center text-sm font-medium text-teal-600 group-hover:underline">
                    Book Now <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}
