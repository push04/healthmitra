'use client';

import React, { useState } from 'react';
import { ECardMember } from '@/types/ecard';
import { Download, Share2, Wallet, RefreshCw, Smartphone, Mail } from 'lucide-react';
import EmailECardModal from './EmailECardModal';

interface ECardFlipProps {
    card: ECardMember;
}

export default function ECardFlip({ card }: ECardFlipProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

    // If card is pending, show pending state
    if (card.status === 'pending') {
        return (
            <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <div className="p-8 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-3xl">
                        ⏳
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">CARD GENERATION PENDING</h3>
                        <p className="text-slate-500 mt-2 text-sm max-w-xs mx-auto">
                            Please complete member details to generate your E-Card
                        </p>
                    </div>

                    <div className="w-full bg-slate-50 p-4 rounded-xl mt-4 border border-slate-100">
                        <div className="text-sm text-left">
                            <p><span className="text-slate-500">Member:</span> <span className="font-semibold text-slate-700">{card.name} ({card.relation})</span></p>
                            <p><span className="text-slate-500">Plan:</span> <span className="font-semibold text-slate-700">{card.planName}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full perspective-1000 group">
            {/* Container for flip effect */}
            <div
                className={`relative w-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                style={{ minHeight: '320px' }}
            >

                {/* FRONT SIDE */}
                <div className="absolute w-full h-full backface-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl shadow-2xl p-6 text-white flex flex-col justify-between relative overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>

                        {/* Header */}
                        <div className="flex justify-between items-start z-10">
                            <div>
                                <h3 className="font-bold text-lg tracking-wider">HEALTHMITRA</h3>
                                <p className="text-xs text-teal-100 opacity-90">Your Health, Our Priority</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold px-2 py-1 bg-white/20 rounded backdrop-blur-sm border border-white/10 uppercase">
                                    {card.planName.split(' ')[0]} PLAN
                                </span>
                                <span className="text-xs font-bold bg-green-500 text-white px-2 py-1 rounded shadow-sm">
                                    Active
                                </span>
                            </div>
                        </div>

                        {/* Member Details */}
                        <div className="flex gap-4 mt-6 z-10">
                            <div className="w-16 h-20 bg-white/20 rounded-lg flex-shrink-0 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                                {card.photoUrl ? (
                                    <img src={card.photoUrl} alt={card.name} className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <span className="text-2xl">👤</span>
                                )}
                            </div>
                            <div className="flex-1 space-y-1">
                                <h4 className="font-bold text-lg uppercase tracking-wide">{card.name}</h4>
                                <p className="text-xs text-teal-100">Member ID: <span className="font-mono">{card.memberId}</span></p>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-teal-50 mt-2">
                                    <p>DOB: {card.dob}</p>
                                    <p>Age: {card.age}</p>
                                    <p>Gender: {card.gender}</p>
                                    <p>Relation: {card.relation}</p>
                                    <p>Blood Group: {card.bloodGroup}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="mt-auto pt-4 border-t border-white/20 flex justify-between items-end z-10">
                            <div className="text-xs space-y-1 text-teal-50">
                                <p>Plan: <span className="font-semibold text-white">{card.planName}</span></p>
                                <p>Valid Till: <span className="font-semibold text-white">{card.validTill}</span></p>
                                <p>Emergency: <span className="font-bold text-white">{card.emergencyContact}</span></p>
                            </div>
                            <div className="bg-white p-1 rounded">
                                {/* QR Code Placeholder */}
                                <div className="w-12 h-12 bg-slate-900 pattern-dots"></div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons (Outside Card) */}
                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <button className="flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors">
                            <Download size={14} /> PDF
                        </button>
                        <button className="flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors">
                            <Smartphone size={14} /> Image
                        </button>
                        <button
                            onClick={() => setIsFlipped(true)}
                            className="flex items-center justify-center gap-1.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium rounded-lg transition-colors border border-teal-200"
                        >
                            <RefreshCw size={14} /> Flip
                        </button>
                        <button className="flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors col-span-1">
                            <Wallet size={14} /> Wallet
                        </button>
                        <button className="flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors col-span-2">
                            <Mail size={14} /> Email Card
                        </button>
                    </div>
                </div>

                {/* BACK SIDE */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180">
                    <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 flex flex-col relative overflow-hidden text-slate-800">

                        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                            <h3 className="font-bold text-lg text-slate-800">COVERAGE DETAILS</h3>
                            <button
                                onClick={() => setIsFlipped(false)}
                                className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
                            >
                                <RefreshCw size={12} /> Flip Back
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-teal-50 p-3 rounded-lg border border-teal-100">
                                <p className="text-xs text-teal-600 font-medium uppercase">Total Coverage Amount</p>
                                <p className="text-xl font-bold text-teal-800">₹{(card.coverageAmount || 500000).toLocaleString('en-US')}</p>
                            </div>

                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex gap-2 items-start">
                                    <span className="text-green-500 mt-0.5">✓</span> Cashless hospitalization at 1000+ hospitals
                                </li>
                                <li className="flex gap-2 items-start">
                                    <span className="text-green-500 mt-0.5">✓</span> 24/7 medical assistance
                                </li>
                                <li className="flex gap-2 items-start">
                                    <span className="text-green-500 mt-0.5">✓</span> Free annual health checkup
                                </li>
                                <li className="flex gap-2 items-start">
                                    <span className="text-green-500 mt-0.5">✓</span> Ambulance service included
                                </li>
                            </ul>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">For claims & queries:</p>
                                <div className="space-y-1 text-sm font-medium text-slate-700">
                                    <p className="flex items-center gap-2">Email: support@healthmitra.com</p>
                                    <p className="flex items-center gap-2">Emergency: {card.emergencyContact}</p>
                                </div>
                            </div>

                            <div className="absolute bottom-4 left-6 text-xs text-slate-400">
                                <p>Policy No: {card.policyNo}</p>
                                <p>Issued: {card.issuedDate}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* 3D Transform Utilities (Inline for simplicity if tailwind plugin missing but assuming standard setup + custom classes) */}
            <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

            <EmailECardModal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                cardName={card.name}
            />
        </div>
    );
}
