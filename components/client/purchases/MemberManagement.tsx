"use client";

import { useState } from "react";
import {
    User, Calendar, Phone, Heart, Activity,
    AlertCircle, Lock, Edit, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Types
interface Member {
    id: string;
    fullName: string;
    dob: string;
    gender: 'Male' | 'Female' | 'Other';
    relation: string;
    mobile?: string;
    bloodGroup?: string;
    height?: string;
    weight?: string;
    conditions?: string;
    nomineeName?: string;
    nomineeRelation?: string;
    eCardGenerated: boolean;
}

interface MemberManagementProps {
    members: Member[];
    onUpdateMembers: (members: Member[]) => void;
}

export function MemberManagement({ members, onUpdateMembers }: MemberManagementProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Member>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleOpenDialog = (member?: Member) => {
        if (member) {
            setEditingMember(member);
            setFormData(member);
        } else {
            setEditingMember(null);
            setFormData({});
        }
        setErrors({});
        setIsDialogOpen(true);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Full Name
        if (!formData.fullName || formData.fullName.length < 3 || !/^[a-zA-Z\s]+$/.test(formData.fullName)) {
            newErrors.fullName = "Name must be at least 3 chars and contain only letters.";
        }

        // DOB & Age
        if (!formData.dob) {
            newErrors.dob = "Date of Birth is required.";
        } else {
            const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();
            if (age < 0 || age > 100) newErrors.dob = "Age must be between 0 and 100 years.";
        }

        // Required Selects
        if (!formData.gender) newErrors.gender = "Gender is required.";
        if (!formData.relation) newErrors.relation = "Relationship is required.";

        // Mobile (Optional but strict)
        if (formData.mobile && !/^[6-9]\d{9}$/.test(formData.mobile)) {
            newErrors.mobile = "Invalid 10-digit Indian number.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validateForm()) return;

        // Simulate Save
        setIsDialogOpen(false);
        // In a real app, updates would propagate up
        console.log("Saved Member:", formData);
    };

    const isLocked = editingMember?.eCardGenerated;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Covered Members ({members.length})</h3>
                <Button onClick={() => handleOpenDialog()} className="gap-2 bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-4 w-4" /> Add Member
                </Button>
            </div>

            {/* Members List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map(member => (
                    <div key={member.id} className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">{member.fullName} ({member.relation})</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span>{member.gender}</span>
                                        <span>•</span>
                                        <span>Age: {2024 - new Date(member.dob).getFullYear()} yrs</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 text-slate-600 border-slate-200"
                                onClick={() => handleOpenDialog(member)}
                            >
                                {member.eCardGenerated && <Lock className="h-3 w-3 text-amber-500" />} Edit
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500">Mobile</p>
                                <p className="font-medium text-slate-700">{member.mobile || 'Not provided'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500">Blood Group</p>
                                <p className="font-medium text-slate-700">{member.bloodGroup || '-'}</p>
                            </div>
                        </div>

                        {member.eCardGenerated && (
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-emerald-600">
                                <CheckCircleIcon className="h-3 w-3" /> E-Card Generated on Jan 15, 2024
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingMember ? 'Edit Family Member' : 'Add Family Member'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Personal Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900 border-b pb-2">Personal Information</h4>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">
                                    Full Name <span className="text-red-500">*</span>
                                    {isLocked && <Lock className="inline h-3 w-3 ml-1 text-amber-500" />}
                                </label>
                                <Input
                                    value={formData.fullName || ''}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    disabled={isLocked}
                                    className={cn(errors.fullName && "border-red-500 ring-red-200")}
                                />
                                {errors.fullName && <ErrorMessage message={errors.fullName} />}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                                        Date of Birth <span className="text-red-500">*</span>
                                        {isLocked && <Lock className="inline h-3 w-3 ml-1 text-amber-500" />}
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.dob || ''}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        disabled={isLocked}
                                        className={cn(errors.dob && "border-red-500 ring-red-200")}
                                    />
                                    {errors.dob && <ErrorMessage message={errors.dob} />}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                                        Gender <span className="text-red-500">*</span>
                                        {isLocked && <Lock className="inline h-3 w-3 ml-1 text-amber-500" />}
                                    </label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(val: any) => setFormData({ ...formData, gender: val })}
                                        disabled={isLocked}
                                    >
                                        <SelectTrigger className={cn(errors.gender && "border-red-500")}>
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && <ErrorMessage message={errors.gender} />}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">
                                        Relationship <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={formData.relation}
                                        onValueChange={(val) => setFormData({ ...formData, relation: val })}
                                        disabled={isLocked && editingMember?.relation === 'Self'} // Only lock Self relation usually
                                    >
                                        <SelectTrigger className={cn(errors.relation && "border-red-500")}>
                                            <SelectValue placeholder="Select Relation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Self">Self</SelectItem>
                                            <SelectItem value="Spouse">Spouse</SelectItem>
                                            <SelectItem value="Father">Father</SelectItem>
                                            <SelectItem value="Mother">Mother</SelectItem>
                                            <SelectItem value="Son">Son</SelectItem>
                                            <SelectItem value="Daughter">Daughter</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.relation && <ErrorMessage message={errors.relation} />}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Mobile Number</label>
                                    <Input
                                        placeholder="+91"
                                        value={formData.mobile || ''}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                        className={cn(errors.mobile && "border-red-500 ring-red-200")}
                                    />
                                    {errors.mobile && <ErrorMessage message={errors.mobile} />}
                                </div>
                            </div>
                        </div>

                        {/* Health Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-900 border-b pb-2">Health Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Blood Group</label>
                                    <Select
                                        value={formData.bloodGroup}
                                        onValueChange={(val) => setFormData({ ...formData, bloodGroup: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Height (cm)</label>
                                    <Input
                                        type="number"
                                        value={formData.height || ''}
                                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1 block">Weight (kg)</label>
                                    <Input
                                        type="number"
                                        value={formData.weight || ''}
                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">Pre-existing Conditions</label>
                                <Input
                                    value={formData.conditions || ''}
                                    onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                                    placeholder="e.g. Diabetes, Hypertension"
                                />
                            </div>
                        </div>

                        {isLocked && (
                            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex gap-2 text-xs text-amber-800">
                                <Lock className="h-4 w-4 shrink-0" />
                                <p>Some fields are locked because an E-Card has been generated for this member. Please contact support for corrections.</p>
                            </div>
                        )}

                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700">Save Member</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ErrorMessage({ message }: { message: string }) {
    return (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" /> {message}
        </p>
    );
}

function CheckCircleIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <path d="m9 11 3 3L22 4" />
        </svg>
    )
}
