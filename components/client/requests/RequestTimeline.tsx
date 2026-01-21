"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
    id: string;
    label: string;
    status: 'completed' | 'current' | 'pending';
    date?: string;
}

interface RequestTimelineProps {
    steps: TimelineStep[];
}

export function RequestTimeline({ steps }: RequestTimelineProps) {
    return (
        <div className="relative pl-4 border-l-2 border-slate-100 space-y-8 ml-2">
            {steps.map((step, index) => (
                <div key={step.id} className="relative">
                    {/* Dot */}
                    <div
                        className={cn(
                            "absolute -left-[21px] top-0 h-4 w-4 rounded-full border-2 bg-white transition-colors",
                            step.status === 'completed' ? "border-emerald-500 bg-emerald-500" :
                                step.status === 'current' ? "border-amber-500 bg-amber-50" :
                                    "border-slate-300"
                        )}
                    >
                        {step.status === 'completed' && <CheckCircle2 className="h-full w-full text-white" />}
                        {step.status === 'current' && <div className="h-2 w-2 bg-amber-500 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div>
                            <p className={cn(
                                "text-sm font-medium",
                                step.status === 'completed' ? "text-slate-900" :
                                    step.status === 'current' ? "text-amber-700 font-bold" :
                                        "text-slate-400"
                            )}>
                                {step.label}
                            </p>
                            {step.status === 'current' && (
                                <span className="inline-flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                                    <Clock className="h-3 w-3 mr-1" /> In Progress
                                </span>
                            )}
                        </div>
                        {step.date && (
                            <span className="text-xs text-slate-500 font-mono mt-1 sm:mt-0 bg-slate-50 px-2 py-1 rounded">
                                {step.date}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
