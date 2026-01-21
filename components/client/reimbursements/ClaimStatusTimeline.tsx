import React from 'react';
import { Check, Clock, X, Circle } from 'lucide-react';

interface TimelineItem {
    status: string;
    date: string;
    isCompleted: boolean;
}

export default function ClaimStatusTimeline({ timeline }: { timeline: TimelineItem[] }) {
    return (
        <div className="relative">
            {timeline.map((item, index) => {
                let Icon = Circle;
                let colorClass = 'text-slate-300 bg-slate-100 border-slate-200';

                if (item.status === 'Rejected') {
                    Icon = X;
                    colorClass = 'text-white bg-red-500 border-red-500';
                } else if (item.isCompleted) {
                    Icon = Check;
                    colorClass = 'text-white bg-emerald-500 border-emerald-500';
                } else if (item.date === 'Pending') {
                    Icon = Circle;
                    // use default
                } else {
                    Icon = Clock; // Current active step usually
                    colorClass = 'text-white bg-amber-500 border-amber-500';
                }

                const isLast = index === timeline.length - 1;

                return (
                    <div key={index} className="flex gap-4 pb-8 relative last:pb-0">
                        {/* Line */}
                        {!isLast && (
                            <div className={`absolute top-8 left-[15px] w-0.5 h-[calc(100%-32px)] ${item.isCompleted ? 'bg-emerald-200' : 'bg-slate-100'}`}></div>
                        )}

                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 flex-shrink-0 ${colorClass}`}>
                            <Icon size={14} strokeWidth={3} />
                        </div>

                        {/* Content */}
                        <div>
                            <p className={`font-semibold text-sm ${item.isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>{item.status}</p>
                            {item.isCompleted && (
                                <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                                    ✓ Done <span className="text-slate-400 font-normal ml-1">{item.date}</span>
                                </p>
                            )}
                            {!item.isCompleted && item.date !== 'Pending' && (
                                <p className="text-xs text-amber-600 font-medium mt-0.5">
                                    In Progress
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
