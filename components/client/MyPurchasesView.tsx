'use client';

import React, { useState } from 'react';
import { ShoppingBag, Calendar, CheckCircle, Eye, Download, Users, Edit, Lock, ChevronRight, AlertCircle, CreditCard, RefreshCw, Plus, Smartphone, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';

interface MyPurchasesViewProps {
    purchases: any[];
}

// Mock member data - MANDATORY 4 MEMBERS for first attempt
const INITIAL_MEMBERS = [
    { id: 'm1', name: '', relation: 'Self', dob: '', gender: '', age: 0, bloodGroup: '', mobile: '', isLocked: false, isMandatory: true },
    { id: 'm2', name: '', relation: 'Spouse', dob: '', gender: '', age: 0, bloodGroup: '', mobile: '', isLocked: false, isMandatory: true },
    { id: 'm3', name: '', relation: 'Child 1', dob: '', gender: '', age: 0, bloodGroup: '', mobile: '', isLocked: false, isMandatory: true },
    { id: 'm4', name: '', relation: 'Child 2', dob: '', gender: '', age: 0, bloodGroup: '', mobile: '', isLocked: false, isMandatory: true },
];

// Mock multiple purchased plans
const MOCK_MULTIPLE_PURCHASES = [
    {
        id: 'HLTH-2024-001',
        plan_name: 'Gold Health Plan',
        status: 'active',
        start_date: '2024-01-15',
        expiry_date: '2025-01-14',
        coverage_amount: 500000,
        members_count: 4,
        isFirstPurchase: true
    },
    {
        id: 'HLTH-2023-045',
        plan_name: 'Silver Health Plan',
        status: 'active',
        start_date: '2023-03-10',
        expiry_date: '2024-03-09',
        coverage_amount: 300000,
        members_count: 2,
        isFirstPurchase: false
    },
    {
        id: 'HLTH-2022-128',
        plan_name: 'Basic Health Plan',
        status: 'expired',
        start_date: '2022-06-05',
        expiry_date: '2023-06-04',
        coverage_amount: 200000,
        members_count: 4,
        isFirstPurchase: false
    }
];

interface MemberFormData {
    name: string;
    dob: string;
    gender: string;
    relation: string;
    bloodGroup: string;
    mobile: string;
}

// Helper function to format date consistently
function formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

// Calculate age from DOB
function calculateAge(dob: string): number {
    if (!dob) return 0;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export function MyPurchasesView({ purchases }: MyPurchasesViewProps) {
    // Use mock data if no purchases provided
    const allPurchases = purchases.length > 0 ? purchases : MOCK_MULTIPLE_PURCHASES;

    const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
    const [isMemberWizardOpen, setIsMemberWizardOpen] = useState(false);
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [editingMember, setEditingMember] = useState<any>(null);
    const [memberForm, setMemberForm] = useState<MemberFormData>({
        name: '',
        dob: '',
        gender: '',
        relation: '',
        bloodGroup: '',
        mobile: ''
    });

    // Check if all 4 mandatory members are filled
    const filledMembersCount = members.filter(m => m.name && m.dob && m.gender && m.bloodGroup && m.mobile).length;
    const allMandatoryFilled = filledMembersCount >= 4;
    const progressPercent = (filledMembersCount / 4) * 100;

    // Get active and expired plans separately
    const activePlans = allPurchases.filter(p => p.status === 'active');
    const expiredPlans = allPurchases.filter(p => p.status === 'expired');

    const handleViewDetails = (purchase: any) => {
        setSelectedPurchase(purchase);
        setIsDetailsOpen(true);
    };

    const handleManageMembers = (purchase: any) => {
        setSelectedPurchase(purchase);
        setIsMemberWizardOpen(true);
    };

    const handleEditMember = (member: any) => {
        if (member.isLocked) {
            toast.error("Member details are locked and cannot be edited after submission.");
            return;
        }
        setEditingMember(member);
        setMemberForm({
            name: member.name,
            dob: member.dob,
            gender: member.gender,
            relation: member.relation,
            bloodGroup: member.bloodGroup || '',
            mobile: member.mobile || ''
        });
        setIsMemberFormOpen(true);
    };

    const handleSaveMember = () => {
        if (!memberForm.name || !memberForm.dob || !memberForm.gender || !memberForm.bloodGroup || !memberForm.mobile) {
            toast.error("Please fill all required fields");
            return;
        }

        // Validate mobile
        if (!/^[6-9]\d{9}$/.test(memberForm.mobile)) {
            toast.error("Invalid mobile number (10 digits, starting with 6-9)");
            return;
        }

        const age = calculateAge(memberForm.dob);

        // Update member and lock it
        setMembers(prev => prev.map(m =>
            m.id === editingMember.id
                ? { ...m, ...memberForm, age, isLocked: true }
                : m
        ));

        toast.success("Member details saved!", {
            description: `${memberForm.name} (${memberForm.relation}) has been added.`
        });
        setIsMemberFormOpen(false);
        setEditingMember(null);
    };

    const handleSaveProgress = () => {
        toast.success("Progress saved!", {
            description: `${filledMembersCount}/4 members completed. You can continue later.`
        });
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Purchased Plans</h1>
                    <p className="text-slate-500 text-sm">View plan details and manage policy holder information</p>
                </div>
                <Badge className="bg-slate-100 text-slate-600">
                    {allPurchases.length} Plan{allPurchases.length !== 1 ? 's' : ''}
                </Badge>
            </div>

            {/* Mandatory 4 Members Warning - Show only if first purchase is incomplete */}
            {!allMandatoryFilled && allPurchases.some(p => p.isFirstPurchase && p.status === 'active') && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-bold text-amber-800 text-lg">Add Family Members (4 Members Mandatory)</h4>
                            <p className="text-sm text-amber-700 mt-1">
                                Complete all 4 member details to activate your plan benefits.
                            </p>

                            {/* Progress Bar */}
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-amber-800">
                                        Progress: {filledMembersCount} of 4 Members Added
                                    </span>
                                    <span className="text-sm font-bold text-amber-600">{Math.round(progressPercent)}%</span>
                                </div>
                                <div className="w-full bg-amber-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Member Cards Preview */}
                            <div className="mt-4 space-y-2">
                                {members.map((member, idx) => (
                                    <div
                                        key={member.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${member.isLocked
                                                ? 'bg-emerald-50 border-emerald-200'
                                                : 'bg-white border-amber-200 hover:border-amber-400 cursor-pointer'
                                            }`}
                                        onClick={() => !member.isLocked && handleEditMember(member)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${member.isLocked ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-600'
                                                }`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800">
                                                    Member {idx + 1} ({member.relation})
                                                </p>
                                                {member.isLocked ? (
                                                    <p className="text-sm text-slate-600">
                                                        {member.name} | Age {member.age} | {member.gender}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-amber-600">Click to add {member.relation.toLowerCase()} details</p>
                                                )}
                                            </div>
                                        </div>
                                        {member.isLocked ? (
                                            <span className="text-emerald-600 text-sm font-semibold flex items-center gap-1">
                                                <CheckCircle size={16} /> Done
                                            </span>
                                        ) : (
                                            <Button size="sm" variant="outline" className="text-amber-600 border-amber-300 hover:bg-amber-50">
                                                <Plus size={14} className="mr-1" /> Add
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                                <p className="text-sm text-amber-800 flex items-center gap-2">
                                    <AlertCircle size={14} />
                                    <strong>⚠️ You must add all 4 members to complete plan activation</strong>
                                </p>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <Button variant="outline" onClick={handleSaveProgress} className="border-amber-300 text-amber-700 hover:bg-amber-100">
                                    Save Progress
                                </Button>
                                <Button
                                    className="bg-amber-600 hover:bg-amber-700 text-white"
                                    onClick={() => {
                                        const nextMember = members.find(m => !m.isLocked);
                                        if (nextMember) handleEditMember(nextMember);
                                    }}
                                >
                                    Continue Adding Members <ChevronRight size={14} className="ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Plans Section */}
            {activePlans.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        Active Plans ({activePlans.length})
                    </h2>

                    {activePlans.map((purchase, index) => (
                        <div
                            key={purchase.id}
                            className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-all ${index === 0 ? 'border-teal-200 ring-1 ring-teal-100' : 'border-slate-200'
                                }`}
                        >
                            <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-600 border border-teal-100">
                                        <CreditCard size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-lg text-slate-800">{purchase.plan_name}</h3>
                                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                                <CheckCircle size={10} className="mr-1" /> Active
                                            </Badge>
                                            {index === 0 && (
                                                <Badge className="bg-teal-100 text-teal-700 border-teal-200">
                                                    ⭐ Current Plan
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-sm text-slate-500 mt-1 font-mono">Plan ID: {purchase.id}</p>

                                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm">
                                            <span className="flex items-center gap-1.5 text-slate-600">
                                                <Calendar size={14} className="text-slate-400" />
                                                Purchased: <strong>{formatDate(purchase.start_date)}</strong>
                                            </span>
                                            <span className="flex items-center gap-1.5 text-slate-600">
                                                <Clock size={14} className="text-slate-400" />
                                                Valid till: <strong>{formatDate(purchase.expiry_date)}</strong>
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm">
                                            <span className="flex items-center gap-1.5 text-slate-600">
                                                <Users size={14} className="text-slate-400" />
                                                Members: <strong>{purchase.members_count || 4}</strong>
                                            </span>
                                            <span className="flex items-center gap-1.5 text-teal-600 font-semibold">
                                                Coverage: ₹{purchase.coverage_amount?.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewDetails(purchase)}
                                        className="text-slate-600"
                                    >
                                        <Eye size={14} className="mr-1" /> View Details
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleManageMembers(purchase)}
                                        className="text-slate-600"
                                    >
                                        <Users size={14} className="mr-1" /> Manage Members
                                    </Button>
                                    <Link href="/e-cards">
                                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                                            <Smartphone size={14} className="mr-1" /> Get E-Cards
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Expired Plans Section */}
            {expiredPlans.length > 0 && (
                <div className="space-y-4 mt-8">
                    <h2 className="text-lg font-semibold text-slate-500 flex items-center gap-2">
                        <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                        Expired Plans ({expiredPlans.length})
                    </h2>

                    {expiredPlans.map((purchase) => (
                        <div
                            key={purchase.id}
                            className="bg-slate-50 rounded-xl border border-slate-200 p-5 opacity-80"
                        >
                            <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="p-3 rounded-xl bg-slate-100 text-slate-400 border border-slate-200">
                                        <CreditCard size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-lg text-slate-600">{purchase.plan_name}</h3>
                                            <Badge className="bg-red-100 text-red-600 border-red-200">
                                                <XCircle size={10} className="mr-1" /> Expired
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-slate-400 mt-1 font-mono">Plan ID: {purchase.id}</p>

                                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm">
                                            <span className="flex items-center gap-1.5 text-slate-500">
                                                <Calendar size={14} className="text-slate-400" />
                                                Purchased: {formatDate(purchase.start_date)}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-red-500">
                                                <XCircle size={14} />
                                                Expired: {formatDate(purchase.expiry_date)}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5">
                                                <Users size={14} className="text-slate-400" />
                                                Members: {purchase.members_count || 4}
                                            </span>
                                            <span>
                                                Coverage: ₹{purchase.coverage_amount?.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons for Expired */}
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleViewDetails(purchase)}
                                        className="text-slate-500"
                                    >
                                        <Eye size={14} className="mr-1" /> View Details
                                    </Button>
                                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                                        <RefreshCw size={14} className="mr-1" /> Renew Plan
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* No Purchases State */}
            {allPurchases.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                    <ShoppingBag className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800">No purchases yet</h3>
                    <p className="text-slate-500 mt-2">You haven't purchased any plans or services.</p>
                    <Button className="mt-6 bg-teal-600 hover:bg-teal-700">
                        Browse Plans <ChevronRight size={14} className="ml-1" />
                    </Button>
                </div>
            )}

            {/* View Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Plan Details</DialogTitle>
                    </DialogHeader>
                    {selectedPurchase && (
                        <div className="space-y-6">
                            <div className={`p-5 rounded-xl text-white ${selectedPurchase.status === 'active'
                                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500'
                                    : 'bg-gradient-to-r from-slate-500 to-slate-600'
                                }`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold">{selectedPurchase.plan_name}</h3>
                                        <p className="text-white/80 text-sm mt-1">Plan ID: {selectedPurchase.id}</p>
                                    </div>
                                    <Badge className={`${selectedPurchase.status === 'active'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-red-500 text-white'
                                        }`}>
                                        {selectedPurchase.status}
                                    </Badge>
                                </div>
                                <p className="text-2xl font-bold mt-4">
                                    ₹{selectedPurchase.coverage_amount?.toLocaleString('en-IN')}
                                    <span className="text-sm font-normal text-white/80 ml-2">Coverage</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase">Start Date</p>
                                    <p className="font-bold text-slate-800">{formatDate(selectedPurchase.start_date)}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase">
                                        {selectedPurchase.status === 'expired' ? 'Expired On' : 'Valid Till'}
                                    </p>
                                    <p className={`font-bold ${selectedPurchase.status === 'expired' ? 'text-red-600' : 'text-slate-800'}`}>
                                        {formatDate(selectedPurchase.expiry_date)}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase">Members</p>
                                    <p className="font-bold text-slate-800">{selectedPurchase.members_count || 4}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase">Status</p>
                                    <p className={`font-bold capitalize ${selectedPurchase.status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {selectedPurchase.status}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg">
                                <h4 className="font-semibold mb-3">Plan Benefits</h4>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Unlimited Doctor Consultations</li>
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Medicine Discounts up to 25%</li>
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Free Diagnostic Tests (up to ₹5,000)</li>
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> Emergency Ambulance Services</li>
                                    <li className="flex items-center gap-2"><CheckCircle size={14} className="text-emerald-500" /> 24x7 Health Support</li>
                                </ul>
                            </div>

                            <div className="flex gap-3">
                                <Link href="/invoices" className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        <Download size={14} className="mr-2" /> Download Invoice
                                    </Button>
                                </Link>
                                {selectedPurchase.status === 'active' ? (
                                    <Link href="/e-cards" className="flex-1">
                                        <Button className="w-full bg-teal-600 hover:bg-teal-700">
                                            Get E-Cards <ChevronRight size={14} className="ml-1" />
                                        </Button>
                                    </Link>
                                ) : (
                                    <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
                                        <RefreshCw size={14} className="mr-2" /> Renew Plan
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Manage Members Modal */}
            <Dialog open={isMemberWizardOpen} onOpenChange={setIsMemberWizardOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Manage Members - {selectedPurchase?.plan_name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">{filledMembersCount}/4 members added</span>
                            <div className="w-32 bg-slate-200 rounded-full h-2">
                                <div
                                    className="bg-teal-500 h-2 rounded-full transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {members.map((member, idx) => (
                                <div
                                    key={member.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${member.isLocked
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : 'bg-white border-slate-200 hover:border-teal-300 cursor-pointer'
                                        }`}
                                    onClick={() => !member.isLocked && handleEditMember(member)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${member.isLocked ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {member.isLocked ? <CheckCircle size={16} /> : idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{member.relation}</p>
                                            <p className="text-sm text-slate-500">
                                                {member.isLocked ? `${member.name} | ${member.gender} | ${member.bloodGroup}` : 'Not added yet'}
                                            </p>
                                        </div>
                                    </div>
                                    {member.isLocked ? (
                                        <Lock size={14} className="text-slate-400" />
                                    ) : (
                                        <ChevronRight size={14} className="text-slate-400" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsMemberWizardOpen(false)} className="flex-1">
                                Close
                            </Button>
                            <Link href="/e-cards" className="flex-1">
                                <Button className="w-full bg-teal-600 hover:bg-teal-700" disabled={!allMandatoryFilled}>
                                    <Smartphone size={14} className="mr-2" /> Generate E-Cards
                                </Button>
                            </Link>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Member Details Form Modal */}
            <Dialog open={isMemberFormOpen} onOpenChange={setIsMemberFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add {editingMember?.relation} Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                            <strong>⚠️ Important:</strong> Once submitted, these details cannot be changed. Please verify before saving.
                        </div>

                        <div className="space-y-2">
                            <Label>Full Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={memberForm.name}
                                onChange={(e) => setMemberForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter full name as per ID"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date of Birth <span className="text-red-500">*</span></Label>
                                <Input
                                    type="date"
                                    value={memberForm.dob}
                                    onChange={(e) => setMemberForm(prev => ({ ...prev, dob: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Gender <span className="text-red-500">*</span></Label>
                                <Select value={memberForm.gender} onValueChange={(val) => setMemberForm(prev => ({ ...prev, gender: val }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Blood Group <span className="text-red-500">*</span></Label>
                                <Select value={memberForm.bloodGroup} onValueChange={(val) => setMemberForm(prev => ({ ...prev, bloodGroup: val }))}>
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

                            <div className="space-y-2">
                                <Label>Mobile <span className="text-red-500">*</span></Label>
                                <Input
                                    type="tel"
                                    value={memberForm.mobile}
                                    onChange={(e) => setMemberForm(prev => ({ ...prev, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                                    placeholder="10-digit mobile"
                                    maxLength={10}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsMemberFormOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleSaveMember} className="flex-1 bg-teal-600 hover:bg-teal-700">
                                <CheckCircle size={14} className="mr-2" /> Save & Lock
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
