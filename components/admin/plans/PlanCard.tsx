'use client';

import { Plan, MOCK_CATEGORIES } from '@/app/lib/mock/plans-data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Power, History, Copy, FileText, ImageIcon } from 'lucide-react';

const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

interface PlanCardProps {
    plan: Plan;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string) => void;
    onViewAudit: (id: string) => void;
    onCopy: (id: string) => void;
}

export default function PlanCard({ plan, onEdit, onDelete, onToggleStatus, onViewAudit, onCopy }: PlanCardProps) {
    const statusColor =
        plan.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
            plan.status === 'inactive' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                'bg-amber-50 text-amber-600 border-amber-200';

    const categoryNames = plan.categoryIds
        .map(id => MOCK_CATEGORIES.find(c => c.id === id)?.name)
        .filter(Boolean);

    return (
        <Card className="bg-white border-slate-200 flex flex-col h-full hover:border-teal-500 hover:shadow-md transition-all duration-300 group">
            {/* Plan Image Header */}
            {plan.planImage && (
                <div className="h-32 bg-gradient-to-br from-teal-50 to-cyan-50 border-b border-slate-100 flex items-center justify-center overflow-hidden rounded-t-lg">
                    <div className="flex items-center gap-2 text-teal-400">
                        <ImageIcon className="h-8 w-8" />
                        <span className="text-xs font-medium">Plan Image</span>
                    </div>
                </div>
            )}

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={`${statusColor} capitalize`}>
                        {plan.status}
                    </Badge>
                    <div className="flex gap-1">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 hover:bg-slate-200">
                            {plan.type}
                        </Badge>
                        {plan.brochurePdf && (
                            <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">
                                <FileText className="h-3 w-3 mr-1" />PDF
                            </Badge>
                        )}
                    </div>
                </div>
                <CardTitle className="text-xl font-bold text-slate-800 truncate" title={plan.name}>
                    {plan.name}
                </CardTitle>
                <div className="text-xs text-slate-500 font-mono">
                    {plan.id}
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-teal-600">
                        {formatMoney(plan.totalPrice)}
                    </span>
                    <span className="text-sm text-slate-500">/ {plan.validityType}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-slate-500">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase">Validity</span>
                        <span>
                            {plan.validityValue} {plan.validityType}(s)
                            {plan.extraValidity ? <span className="text-teal-500 text-xs ml-1">+{plan.extraValidity}mo</span> : null}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-400 uppercase">Members</span>
                        <span>{plan.memberCountMax} Max</span>
                    </div>
                </div>

                {/* Category Tags */}
                {categoryNames.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {categoryNames.map((name, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                {name}
                            </span>
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="italic">{plan.services?.length || 0} services</span>
                    {plan.planDetails && plan.planDetails.length > 0 && (
                        <span>{plan.planDetails.length} Q&A</span>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-2 border-t border-slate-100 grid grid-cols-5 gap-1 p-2">
                <Button variant="ghost" size="icon" className="w-full text-slate-400 hover:text-slate-900 hover:bg-slate-50" onClick={() => onEdit(plan.id)} title="Edit">
                    <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-full text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => onCopy(plan.id)} title="Copy Plan">
                    <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-full text-slate-400 hover:text-slate-900 hover:bg-slate-50" onClick={() => onViewAudit(plan.id)} title="Audit Log">
                    <History className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-full text-slate-400 hover:text-teal-600 hover:bg-teal-50" onClick={() => onToggleStatus(plan.id)} title="Toggle Status">
                    <Power className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-full text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => onDelete(plan.id)} title="Delete">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}
