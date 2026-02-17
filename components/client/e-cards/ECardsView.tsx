'use client';

import React, { useState } from 'react';
import ECardFlip from '@/components/client/e-cards/ECardFlip';
import GenerateECardWizard from '@/components/client/e-cards/GenerateECardWizard';
import { ECardMember } from '@/types/ecard';
import { CreditCard, Clock, AlertTriangle, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ECardsViewProps {
    initialCards: any[];
    availableMembers: any[];
}

export function ECardsView({ initialCards, availableMembers }: ECardsViewProps) {
    const [cards, setCards] = useState<ECardMember[]>(initialCards.map(c => ({
        id: c.id,
        name: c.member_name || c.name || "Unknown",
        relation: c.relation || "Self",
        dob: c.dob,
        age: c.age,
        gender: c.gender,
        bloodGroup: c.blood_group,
        memberId: c.member_id,
        planId: c.plan_id,
        planName: c.plan_name || "Health Plan",
        validFrom: c.valid_from || new Date().toISOString(),
        validTill: c.valid_till || "2025-12-31",
        policyNo: c.policy_number,
        issuedDate: c.issued_date || new Date().toISOString(),
        emergencyContact: c.emergency_contact || "1800-123-4567",
        coverageAmount: c.coverage_amount,
        status: (c.status as any) || 'pending',
        cardUniqueId: c.card_unique_id || `HM-${c.id.substr(0, 8).toUpperCase()}`,
        planDescription: "Comprehensive health coverage",
        planFeatures: ["Cashless Hospitalization", "24/7 Support"]
    })));
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const handleCardSuccess = () => {
        toast.success('E-Card generated successfully!', {
            description: 'Card has been emailed to you and is now ready for download.'
        });
        // Logic to refresh would happen here
    };

    const activeCount = cards.filter(c => c.status === 'active').length;
    const pendingCount = availableMembers.filter(m => !m.hasCard).length;

    return (
        <div className="space-y-8 pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My E-Cards</h1>
                    <p className="text-slate-500">Download and manage your health insurance cards</p>
                </div>
                <button
                    onClick={() => setIsWizardOpen(true)}
                    className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-teal-200 transition-all hover:-translate-y-0.5"
                >
                    <Plus size={18} /> Generate Card
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Active Cards</p>
                        <p className="text-2xl font-bold text-slate-800">{activeCount}</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Pending</p>
                        <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
                    </div>
                </div>
                {/* ... Expired stats ... */}
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {cards.map(card => (
                    <ECardFlip key={card.id} card={card} />
                ))}
            </div>

            {/* Wizard Modal */}
            <GenerateECardWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onSuccess={handleCardSuccess}
                availableMembers={availableMembers}
            />
        </div>
    );
}
