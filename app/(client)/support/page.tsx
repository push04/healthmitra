'use client';

import React from 'react';
import { Phone, Mail, MessageCircle, HelpCircle } from 'lucide-react';

export default function SupportPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800">How can we help you?</h1>
                <p className="text-slate-500 mt-2">Our support team is always available to assist you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone size={28} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">Call Us</h3>
                    <p className="text-slate-500 text-sm mb-4">Available 24/7 for emergencies</p>
                    <a href="tel:+9118001234567" className="text-teal-600 font-bold hover:underline">+91 1800 123 4567</a>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail size={28} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">Email Us</h3>
                    <p className="text-slate-500 text-sm mb-4">We usually reply within 24 hours</p>
                    <a href="mailto:support@healthmitra.com" className="text-blue-600 font-bold hover:underline">support@healthmitra.com</a>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={28} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">Chat Support</h3>
                    <p className="text-slate-500 text-sm mb-4">Instant answers to your queries</p>
                    <button className="text-emerald-600 font-bold hover:underline">Start Live Chat</button>
                </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <h3 className="font-bold text-slate-800 text-xl mb-6 flex items-center gap-2">
                    <HelpCircle className="text-teal-600" />
                    Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <h4 className="font-semibold text-slate-800 mb-2">How do I download my E-Card?</h4>
                        <p className="text-slate-600 text-sm">Go to the E-Cards section in the dashboard and click on the 'Download' button next to the member's name.</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <h4 className="font-semibold text-slate-800 mb-2">How to track my reimbursement claim?</h4>
                        <p className="text-slate-600 text-sm">Navigate to 'Reimbursements' to see real-time status updates on all your submitted claims.</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <h4 className="font-semibold text-slate-800 mb-2">Can I add family members to my plan?</h4>
                        <p className="text-slate-600 text-sm">Yes, depending on your plan limit. Go to Profile or contact support to request adding a member.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
