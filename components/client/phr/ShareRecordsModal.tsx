'use client';

import React, { useState } from 'react';
import { X, Share2, Stethoscope, Calendar, Check, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ShareRecordsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ShareRecordsModal({ isOpen, onClose }: ShareRecordsModalProps) {
    const [recipient, setRecipient] = useState('');
    const [duration, setDuration] = useState('24h');
    const [isSharing, setIsSharing] = useState(false);

    // Mock existing documents selection
    const [selectedDocs, setSelectedDocs] = useState(['d1', 'd2']);

    if (!isOpen) return null;

    const handleShare = () => {
        if (!recipient) {
            toast.error('Please enter a recipient ID');
            return;
        }

        setIsSharing(true);
        setTimeout(() => {
            setIsSharing(false);
            toast.success('Records Shared Successfully', {
                description: `Access granted to ${recipient} for ${duration === 'custom' ? 'specified period' : duration}.`
            });
            onClose();
            setRecipient('');
        }, 1500);
    };

    const DOCS = [
        { id: 'd1', name: 'Blood Report - Jan 15, 2025' },
        { id: 'd2', name: 'ECG Report - Jan 10, 2025' },
        { id: 'd3', name: 'Prescription - Jan 18, 2025' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Share Health Records</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex items-start gap-3">
                            <div className="bg-sky-100 text-sky-600 p-2 rounded-lg"><Share2 size={18} /></div>
                            <div>
                                <h4 className="font-bold text-sky-900 text-sm">Secure Sharing via ABDM</h4>
                                <p className="text-xs text-sky-800 mt-1">You can revoke access at any time. Sharing is consent-based and tracked.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500">Doctor's ABDM ID or Hospital ID *</label>
                            <div className="relative">
                                <Stethoscope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    placeholder="e.g. dr.sharma@abdm"
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500">Select Documents to Share</label>
                            <div className="space-y-2 border border-slate-100 rounded-xl p-2 max-h-40 overflow-y-auto">
                                {DOCS.map(doc => (
                                    <label key={doc.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedDocs.includes(doc.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedDocs([...selectedDocs, doc.id]);
                                                else setSelectedDocs(selectedDocs.filter(id => id !== doc.id));
                                            }}
                                            className="rounded text-teal-600 focus:ring-teal-500"
                                        />
                                        <span className="text-sm text-slate-700">{doc.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500">Access Duration</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {['24h', '7 days', '30 days', 'Custom'].map((d) => (
                                    <button
                                        key={d}
                                        onClick={() => setDuration(d)}
                                        className={`px-2 py-2 text-xs font-bold rounded-lg border transition-all ${duration === d ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                            }`}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleShare}
                        disabled={isSharing || !recipient}
                        className="px-6 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSharing ? 'Sharing...' : 'Share Records'}
                    </button>
                </div>
            </div>
        </div>
    );
}
