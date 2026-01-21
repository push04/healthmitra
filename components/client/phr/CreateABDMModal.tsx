'use client';

import React, { useState, useEffect } from 'react';
import { X, Smartphone, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CreateABDMModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateABDMModal({ isOpen, onClose, onSuccess }: CreateABDMModalProps) {
    const [step, setStep] = useState(1);
    const [mobile, setMobile] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setMobile('');
            setOtp(['', '', '', '', '', '']);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSendOtp = () => {
        if (!mobile || mobile.length < 10) {
            toast.error('Please enter a valid mobile number');
            return;
        }
        setIsSendingOtp(true);
        setTimeout(() => {
            setIsSendingOtp(false);
            setStep(2);
            toast.info('OTP Sent', { description: 'Please check your mobile for verification code.' });
        }, 1500);
    };

    const handleVerify = () => {
        if (otp.join('').length !== 6) {
            toast.error('Please enter valid 6-digit OTP');
            return;
        }
        setIsVerifying(true);
        setTimeout(() => {
            setIsVerifying(false);
            toast.success('ABDM ID Created Successfully', {
                description: 'Your new Health ID is rajesh.kumar@abdm'
            });
            onSuccess();
            onClose();
        }, 2000);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Create ABDM Health ID</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Smartphone size={32} />
                                </div>
                                <h4 className="font-bold text-slate-800">Verify Mobile Number</h4>
                                <p className="text-sm text-slate-500">We'll send a verification code to your number</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500">Mobile Number *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">+91</span>
                                    <input
                                        type="tel"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:font-normal"
                                        placeholder="9876543210"
                                        maxLength={10}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle size={32} />
                                </div>
                                <h4 className="font-bold text-slate-800">Enter Verification Code</h4>
                                <p className="text-sm text-slate-500">Enter the 6-digit code sent to +91 {mobile}</p>
                            </div>

                            <div className="flex gap-2 justify-center">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        id={`otp-${idx}`}
                                        type="text"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        className="w-10 h-12 text-center text-xl font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50"
                                        maxLength={1}
                                    />
                                ))}
                            </div>

                            <div className="text-center">
                                <button onClick={() => setStep(1)} className="text-xs text-orange-600 font-medium hover:underline">Change Mobile Number</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                    {step === 1 ? (
                        <button
                            onClick={handleSendOtp}
                            disabled={isSendingOtp || mobile.length < 10}
                            className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-200 hover:bg-orange-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSendingOtp ? <Loader2 size={16} className="animate-spin" /> : <>Send OTP <ArrowRight size={16} /></>}
                        </button>
                    ) : (
                        <button
                            onClick={handleVerify}
                            disabled={isVerifying || otp.join('').length < 6}
                            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold text-sm shadow-md shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isVerifying ? <Loader2 size={16} className="animate-spin" /> : 'Verify & Continue'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
