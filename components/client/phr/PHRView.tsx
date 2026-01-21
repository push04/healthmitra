'use client';

import React, { useState } from 'react';
import { Upload, Search, Filter, Folder, FileText, MoreVertical, Eye } from 'lucide-react';
import ABDMCard from '@/components/client/phr/ABDMCard';
import UploadDocumentModal from '@/components/client/phr/UploadDocumentModal';

interface PHRViewProps {
    documents: any[];
}

export function PHRView({ documents }: PHRViewProps) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Aggregate folders from documents
    const categories = Array.from(new Set(documents.map(d => d.category || 'Uncategorized')));
    const folders = categories.map(cat => ({
        name: cat,
        count: documents.filter(d => (d.category || 'Uncategorized') === cat).length
    }));

    // Add "All" folder if not exists logic, or just prepend
    const allFolders = [{ name: 'All', count: documents.length }, ...folders];

    const filteredDocs = selectedCategory === 'All'
        ? documents
        : documents.filter(d => (d.category || 'Uncategorized') === selectedCategory);

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Personal Health Records</h1>
                    <p className="text-slate-500 text-sm">Organize and access your health documents anytime</p>
                </div>
                <button
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-teal-200 hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                    <Upload size={18} /> Upload Document
                </button>
            </div>

            <ABDMCard />

            {/* Folders */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {allFolders.map((folder) => (
                    <button
                        key={folder.name}
                        onClick={() => setSelectedCategory(folder.name)}
                        className={`p-4 rounded-xl border text-left transition-all ${selectedCategory === folder.name
                            ? 'bg-teal-50 border-teal-200 ring-1 ring-teal-200'
                            : 'bg-white border-slate-200 hover:border-teal-200 hover:bg-slate-50'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${selectedCategory === folder.name ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>
                            <Folder size={18} />
                        </div>
                        <p className={`font-semibold text-sm truncate ${selectedCategory === folder.name ? 'text-teal-900' : 'text-slate-700'}`}>{folder.name}</p>
                        <p className="text-xs text-slate-400">{folder.count} files</p>
                    </button>
                ))}
            </div>

            {/* Document List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">{selectedCategory === 'All' ? 'Recent Documents' : selectedCategory}</h3>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {filteredDocs.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            No documents found
                        </div>
                    ) : (
                        filteredDocs.map((doc) => (
                            <div key={doc.id} className="group relative bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all hover:border-teal-200">
                                <div className="flex items-start gap-3">
                                    <div className="p-3 bg-red-50 text-red-500 rounded-lg">
                                        <FileText size={24} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-semibold text-slate-800 text-sm truncate pr-6">{doc.name || doc.file_name}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{new Date(doc.uploaded_at || doc.created_at).toLocaleDateString()}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">{doc.category || 'Doc'}</span>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-slate-600">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 p-2 bg-slate-50 border-t border-slate-100 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button className="flex-1 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1">
                                        <Eye size={12} /> View
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <UploadDocumentModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
            />
        </div>
    );
}
