'use client';

import React, { useState } from 'react';
import { ShoppingBag, Calendar, CheckCircle, Eye, Download, Users, Edit, Lock, ChevronRight } from 'lucide-react';
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

// Mock member data for purchased plan
const MOCK_MEMBERS = [
    { id: 'm1', name: 'Demo User', relation: 'Self', dob: '1990-01-15', gender: 'Male', isLocked: true },
    { id: 'm2', name: 'Spouse User', relation: 'Spouse', dob: '1992-05-20', gender: 'Female', isLocked: true },
    { id: 'm3', name: '', relation: 'Child', dob: '', gender: '', isLocked: false },
    { id: 'm4', name: '', relation: 'Parent', dob: '', gender: '', isLocked: false },
];

interface MemberFormData {
    name: string;
    dob: string;
    gender: string;
    relation: string;
}

// Helper function to format date consistently (avoids hydration errors)
function formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

export function MyPurchasesView({ purchases }: MyPurchasesViewProps) {
    const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
    const [members, setMembers] = useState(MOCK_MEMBERS);
    const [editingMember, setEditingMember] = useState<any>(null);
    const [memberForm, setMemberForm] = useState<MemberFormData>({
        name: '',
        dob: '',
        gender: '',
        relation: ''
    });

    const handleViewDetails = (purchase: any) => {
        setSelectedPurchase(purchase);
        setIsDetailsOpen(true);
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
            relation: member.relation
        });
        setIsMemberFormOpen(true);
    };

    const handleSaveMember = () => {
        if (!memberForm.name || !memberForm.dob || !memberForm.gender) {
            toast.error("Please fill all required fields");
            return;
        }

        // Update member and lock it
        setMembers(prev => prev.map(m =>
            m.id === editingMember.id
                ? { ...m, ...memberForm, isLocked: true }
                : m
        ));

        toast.success("Member details saved and locked!", {
            description: "Details cannot be changed after submission."
        });
        setIsMemberFormOpen(false);
        setEditingMember(null);
    };

    return (
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">My Purchases</h1>
                <p className="text-slate-500 text-sm">View plan details and manage policy holder information</p>
            </div>

            <div className="space-y-4">
                {purchases.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                        <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No purchases yet</h3>
                        <p className="text-slate-500">You haven't purchased any plans or services.</p>
                    </div>
                ) : (
                    purchases.map((purchase) => (
                        <div key={purchase.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
                                        <ShoppingBag size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800">{purchase.plan_name || 'Health Plan'}</h3>
                                            <Badge variant={purchase.status === 'active' ? 'default' : 'secondary'} className={purchase.status === 'active' ? 'bg-emerald-100 text-emerald-700' : ''}>
                                                {purchase.status}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} />
                                                Start: {new Date(purchase.start_date).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <CheckCircle size={14} />
                                                Expires: {new Date(purchase.expiry_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-teal-600 mt-2">
                                            Coverage: ₹{purchase.coverage_amount?.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDetails(purchase)}
                                            className="flex-1 md:flex-none"
                                        >
                                            <Eye size={14} className="mr-1" /> View Details
                                        </Button>
                                        <Link href="/invoices">
                                            <Button variant="outline" size="sm">
                                                <Download size={14} className="mr-1" /> Invoice
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Member Summary */}
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                                        <Users size={16} /> Policy Holder Details
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    {members.map(member => (
                                        <div
                                            key={member.id}
                                            className={`p-3 rounded-lg border ${member.isLocked
                                                ? 'bg-slate-50 border-slate-200'
                                                : 'bg-amber-50 border-amber-200 cursor-pointer hover:border-amber-300'
                                                }`}
                                            onClick={() => !member.isLocked && handleEditMember(member)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide">{member.relation}</p>
                                                    <p className="font-medium text-slate-800">
                                                        {member.name || <span className="text-amber-600">Click to fill</span>}
                                                    </p>
                                                    {member.dob && (
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            DOB: {formatDate(member.dob)}
                                                        </p>
                                                    )}
                                                </div>
                                                {member.isLocked ? (
                                                    <Lock size={14} className="text-slate-400" />
                                                ) : (
                                                    <Edit size={14} className="text-amber-600" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* View Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Plan Details</DialogTitle>
                    </DialogHeader>
                    {selectedPurchase && (
                        <div className="space-y-6">
                            <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white">
                                <h3 className="text-xl font-bold">{selectedPurchase.plan_name}</h3>
                                <p className="text-teal-100">Coverage: ₹{selectedPurchase.coverage_amount?.toLocaleString('en-IN')}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase">Status</p>
                                    <p className="font-bold text-emerald-600 capitalize">{selectedPurchase.status}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase">Plan ID</p>
                                    <p className="font-mono text-sm">{selectedPurchase.id}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase">Start Date</p>
                                    <p className="font-medium">{new Date(selectedPurchase.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase">Expiry Date</p>
                                    <p className="font-medium">{new Date(selectedPurchase.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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
                                <Link href="/e-cards" className="flex-1">
                                    <Button className="w-full bg-teal-600 hover:bg-teal-700">
                                        Download E-Card <ChevronRight size={14} className="ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Member Details Form Modal */}
            <Dialog open={isMemberFormOpen} onOpenChange={setIsMemberFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Fill Member Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                            <strong>Important:</strong> Once submitted, these details cannot be changed. Please verify before saving.
                        </div>

                        <div className="space-y-2">
                            <Label>Relation</Label>
                            <Input value={editingMember?.relation || ''} disabled className="bg-slate-50" />
                        </div>

                        <div className="space-y-2">
                            <Label>Full Name *</Label>
                            <Input
                                value={memberForm.name}
                                onChange={(e) => setMemberForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter full name as per ID"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Date of Birth *</Label>
                            <Input
                                type="date"
                                value={memberForm.dob}
                                onChange={(e) => setMemberForm(prev => ({ ...prev, dob: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Gender *</Label>
                            <Select value={memberForm.gender} onValueChange={(val) => setMemberForm(prev => ({ ...prev, gender: val }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsMemberFormOpen(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button onClick={handleSaveMember} className="flex-1 bg-teal-600 hover:bg-teal-700">
                                <Lock size={14} className="mr-2" /> Save & Lock
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
