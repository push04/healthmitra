'use client';

import React, { useState } from 'react';
import { X, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface EmailECardModalProps {
    isOpen: boolean;
    onClose: () => void;
    cardName: string;
}

export default function EmailECardModal({ isOpen, onClose, cardName }: EmailECardModalProps) {
    const [email, setEmail] = useState('priya@email.com');
    const [altEmail, setAltEmail] = useState('');
    const [sendToRegistered, setSendToRegistered] = useState(true);
    const [sendToAlt, setSendToAlt] = useState(false);
    const [isSending, setIsSending] = useState(false);

    if (!isOpen) return null;

    const handleSend = () => {
        setIsSending(true);
        // Simulate API
        setTimeout(() => {
            setIsSending(false);
            toast.success(`E-Card sent successfully!`, {
                description: `Card sent to ${sendToRegistered ? email : ''} ${sendToRegistered && sendToAlt ? 'and' : ''} ${sendToAlt ? altEmail : ''}`
            });
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Email E-Card</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-sm text-slate-600">Send E-Card to email address:</p>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500">Email Address *</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sendToRegistered}
                                    onChange={(e) => setSendToRegistered(e.target.checked)}
                                    className="rounded text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm text-slate-700">Send card to registered email ({email})</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={sendToAlt}
                                    onChange={(e) => setSendToAlt(e.target.checked)}
                                    className="rounded text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm text-slate-700">Also send to alternate email</span>
                            </label>
                        </div>

                        {sendToAlt && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                <label className="text-xs font-semibold text-slate-500">Alternate Email</label>
                                <input
                                    type="email"
                                    value={altEmail}
                                    onChange={(e) => setAltEmail(e.target.value)}
                                    placeholder="Enter alternate email"
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                            </div>
                        )}
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
                        onClick={handleSend}
                        disabled={isSending || (!sendToRegistered && !sendToAlt)}
                        className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-md shadow-teal-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSending ? 'Sending...' : <>Send Email <Mail size={16} /></>}
                    </button>
                </div>
            </div>
        </div>
    );
}
