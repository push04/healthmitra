'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadDocumentModal({ isOpen, onClose }: UploadModalProps) {
    const [isUploading, setIsUploading] = useState(false);

    if (!isOpen) return null;

    const handleUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            toast.success('Documents Uploaded Successfully', {
                description: '2 files saved to "Prescriptions" folder.'
            });
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800">Upload Health Document</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500">Select Category *</label>
                            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                                <option>Prescriptions</option>
                                <option>Bills</option>
                                <option>Test Reports</option>
                                <option>General Records</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500">Document Date *</label>
                            <input type="date" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Select Member</label>
                        <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                            <option>Rajesh Kumar (Self)</option>
                            <option>Priya Kumar</option>
                        </select>
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 hover:bg-slate-50 transition-colors text-center cursor-pointer">
                        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Upload size={20} />
                        </div>
                        <p className="text-sm text-slate-600 font-medium">Drag & drop files here or click to browse</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB each</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500">Tags (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. cardiologist, chest pain"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
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
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="px-6 py-2 text-sm font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200 flex items-center gap-2"
                    >
                        {isUploading ? 'Uploading...' : 'Upload Documents'}
                    </button>
                </div>
            </div>
        </div>
    );
}
