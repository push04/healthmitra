'use client';

import React, { useState } from 'react';
import { ECardMember, ECardFormData } from '@/types/ecard';
import { X, ChevronRight, ChevronLeft, Upload, AlertTriangle, CheckCircle } from 'lucide-react';

interface GenerateECardWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    availableMembers: {
        id: string;
        name: string;
        relation: string;
        age: number;
        hasCard: boolean;
        planName: string;
    }[];
}

export default function GenerateECardWizard({ isOpen, onClose, onSuccess, availableMembers }: GenerateECardWizardProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState<ECardFormData>({
        fullName: '',
        dob: '',
        gender: 'Female', // Default based on mock prompt
        bloodGroup: 'A+',
        mobile: '',
        email: '',
        height: '',
        weight: '',
        conditions: 'None',
        nomineeName: '',
        nomineeRelation: 'Spouse',
        photo: null
    });

    if (!isOpen) return null;

    const handleNext = () => {
        if (step === 1 && !selectedMemberId) return;
        if (step === 2) {
            // Very basic validation could go here
        }
        setStep((prev) => (prev < 3 ? prev + 1 : prev) as 1 | 2 | 3);
    };

    const handleBack = () => {
        setStep((prev) => (prev > 1 ? prev - 1 : prev) as 1 | 2 | 3);
    };

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate API call
        setTimeout(() => {
            setIsGenerating(false);
            onSuccess();
            onClose();
        }, 3000);
    };

    const selectedMember = availableMembers.find(m => m.id === selectedMemberId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Generate E-Card</h2>
                        <p className="text-sm text-slate-500">Step {step} of 3: {step === 1 ? 'Select Member' : step === 2 ? 'Member Information' : 'Preview & Generate'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* STEP 1: SELECT MEMBER */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <p className="text-slate-600">Select member from your active plan:</p>

                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-medium text-slate-700 text-sm">
                                    Gold Health Plan
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {availableMembers.map(member => (
                                        <div
                                            key={member.id}
                                            onClick={() => !member.hasCard && setSelectedMemberId(member.id)}
                                            className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${member.hasCard ? 'opacity-50 cursor-not-allowed bg-slate-50' :
                                                    selectedMemberId === member.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedMemberId === member.id ? 'border-teal-500 bg-teal-500' : 'border-slate-300'
                                                    }`}>
                                                    {selectedMemberId === member.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                                </div>
                                                <div>
                                                    <p className={`font-medium ${member.hasCard ? 'text-slate-500' : 'text-slate-800'}`}>
                                                        {member.name} <span className="text-slate-500 text-sm">({member.relation}) - Age {member.age}</span>
                                                    </p>
                                                    {member.hasCard ? (
                                                        <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                                                            <CheckCircle size={12} /> Card Already Generated
                                                        </p>
                                                    ) : (
                                                        <p className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span> Details Pending
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: FILL DETAILS */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="bg-amber-50 text-amber-800 text-sm p-3 rounded-lg flex items-start gap-2">
                                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                                <p>Important: Details cannot be changed after card generation. Please verify accurately.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Details */}
                                <div className="col-span-1 md:col-span-2">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Personal Details</h3>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">Full Name *</label>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        placeholder={selectedMember?.name}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">Date of Birth *</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">Gender *</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">Blood Group</label>
                                    <select
                                        value={formData.bloodGroup}
                                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">Mobile Number</label>
                                    <input
                                        type="tel"
                                        value={formData.mobile}
                                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                {/* Health Info */}
                                <div className="col-span-1 md:col-span-2 pt-4">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Health Information</h3>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">Height (cm)</label>
                                    <input
                                        type="number"
                                        value={formData.height}
                                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">Weight (kg)</label>
                                    <input
                                        type="number"
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                <div className="col-span-1 md:col-span-2 space-y-1">
                                    <label className="text-xs font-semibold text-slate-500">Pre-existing Conditions</label>
                                    <textarea
                                        value={formData.conditions}
                                        onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                        rows={1}
                                    />
                                </div>

                                {/* Upload Photo */}
                                <div className="col-span-1 md:col-span-2 pt-4">
                                    <label className="block p-6 border-2 border-dashed border-slate-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-colors cursor-pointer text-center">
                                        <Upload className="mx-auto h-8 w-8 text-slate-400" />
                                        <span className="mt-2 block text-sm font-medium text-slate-600">Click to upload photo</span>
                                        <span className="mt-1 block text-xs text-slate-400">Passport size, Max 2MB, JPG/PNG</span>
                                    </label>
                                </div>

                                <div className="col-span-1 md:col-span-2 flex items-center gap-2 pt-2">
                                    <input type="checkbox" id="confirm" className="rounded text-teal-600 focus:ring-teal-500 mt-0.5" />
                                    <label htmlFor="confirm" className="text-sm text-slate-600">I confirm all details are accurate and complete</label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PREVIEW */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-center">
                                <h3 className="font-bold text-teal-800 text-lg mb-1">Preview E-Card</h3>
                                <p className="text-teal-600 text-sm">Review details before generating</p>
                            </div>

                            {/* Mock Preview Card - Simplified Inline Version since we have the component */}
                            <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-sm">HEALTHMITRA</h3>
                                    </div>
                                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">PREVIEW</span>
                                </div>

                                <div className="flex gap-4 mt-4">
                                    <div className="w-14 h-16 bg-white/20 rounded-lg flex items-center justify-center text-xl">👤</div>
                                    <div>
                                        <h4 className="font-bold uppercase">{formData.fullName || selectedMember?.name}</h4>
                                        <p className="text-[10px] opacity-80 mt-1">ID: HM-2024-XXX-XXX</p>
                                        <p className="text-[10px] opacity-80">DOB: {formData.dob || '20/05/1992'}</p>
                                        <p className="text-[10px] opacity-80">Plan: {selectedMember?.planName}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-2">
                                <p className="font-bold text-slate-700">Notice:</p>
                                <ul className="list-disc list-inside text-slate-600 space-y-1">
                                    <li>Member details will be LOCKED after card generation</li>
                                    <li>Card will be valid till plan expiry</li>
                                </ul>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="bg-white p-6 border-t border-slate-100 flex justify-between items-center">
                    {step > 1 ? (
                        <button onClick={handleBack} className="text-slate-500 font-medium hover:text-slate-800 transition-colors flex items-center gap-1">
                            <ChevronLeft size={16} /> Back
                        </button>
                    ) : (
                        <button onClick={onClose} className="text-slate-500 font-medium hover:text-slate-800 transition-colors">
                            Cancel
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={step === 1 && !selectedMemberId}
                            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium shadow-md shadow-teal-200 transition-all flex items-center gap-2"
                        >
                            Next Step <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-md shadow-teal-200 transition-all flex items-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Generating...
                                </>
                            ) : (
                                <>Generate E-Card <CheckCircle size={16} /></>
                            )}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
