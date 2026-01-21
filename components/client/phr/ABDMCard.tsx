'use client';

import React, { useState } from 'react';
import { ShieldCheck, Share2, Download, ExternalLink } from 'lucide-react';
import CreateABDMModal from './CreateABDMModal';
import FetchRecordsModal from './FetchRecordsModal';
import ShareRecordsModal from './ShareRecordsModal';

export default function ABDMCard() {
    const [isCreated, setIsCreated] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showFetchModal, setShowFetchModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);

    return (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-6 relative overflow-hidden">

            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full -mr-16 -mt-16 blur-xl"></div>

            {!isCreated ? (
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-6 bg-gradient-to-r from-orange-500 to-green-500 rounded flex items-center justify-center text-white text-[10px] font-bold">ABDM</div>
                            <h3 className="font-bold text-slate-800">Ayushman Bharat Digital Mission</h3>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 max-w-lg">
                            Create your government-issued Health ID to access and share health records digitally with doctors and hospitals nationwide.
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-orange-100">✓ Secure & Private</span>
                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-orange-100">✓ Govt Issued</span>
                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-orange-100">✓ Easy Sharing</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[160px]">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-orange-200 transition-all"
                        >
                            Create ABHA ID
                        </button>
                        <button className="bg-white border border-orange-200 text-orange-700 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-50 transition-all">
                            Link Existing ID
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-6 bg-gradient-to-r from-orange-500 to-green-500 rounded flex items-center justify-center text-white text-[10px] font-bold">ABDM</div>
                            <h3 className="font-bold text-slate-800">rajesh.kumar@abdm</h3>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">Active</span>
                        </div>
                        <p className="text-xs text-slate-500">Created: Jan 15, 2024</p>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-1.5 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
                            <ExternalLink size={16} /> View Records
                        </button>
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center gap-1.5 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
                        >
                            <Share2 size={16} /> Share
                        </button>
                        <button
                            onClick={() => setShowFetchModal(true)}
                            className="flex items-center gap-1.5 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm"
                        >
                            <Download size={16} /> Fetch New
                        </button>
                    </div>
                </div>
            )}

            <CreateABDMModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => setIsCreated(true)}
            />

            <FetchRecordsModal
                isOpen={showFetchModal}
                onClose={() => setShowFetchModal(false)}
            />

            <ShareRecordsModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
            />
        </div>
    );
}
