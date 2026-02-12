'use client';

import { useState, useEffect, use } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowLeft, Loader2, FileText, User, Shield, Download, Eye,
    ClipboardList, Syringe, Building2, Activity, Folder, Receipt
} from 'lucide-react';
import { PHRRecord, PatientMember, PHR_CATEGORIES } from '@/app/lib/mock/phr-data';
import { getPatientPHR } from '@/app/actions/phr';
import Link from 'next/link';
import { toast } from 'sonner';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
    Prescriptions: <ClipboardList className="h-4 w-4" />,
    Bills: <Receipt className="h-4 w-4" />,
    'Test Reports': <Activity className="h-4 w-4" />,
    'General Records': <Folder className="h-4 w-4" />,
    'Discharge Summaries': <Building2 className="h-4 w-4" />,
    'Vaccination Records': <Syringe className="h-4 w-4" />,
};

const ADDED_BY_STYLES: Record<string, string> = {
    self: 'bg-sky-50 text-sky-700 border-sky-200',
    vendor: 'bg-orange-50 text-orange-700 border-orange-200',
    admin: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function PatientPHRDetailPage({ params }: { params: Promise<{ memberId: string }> }) {
    const { memberId } = use(params);
    const [patient, setPatient] = useState<PatientMember | null>(null);
    const [records, setRecords] = useState<PHRRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const res = await getPatientPHR(memberId);
            if (res.success && res.data) {
                setPatient(res.data.patient);
                setRecords(res.data.records);
            }
            setLoading(false);
        };
        fetchData();
    }, [memberId]);

    const filtered = selectedCategory === 'All' ? records : records.filter(r => r.category === selectedCategory);
    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    if (loading) {
        return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-teal-500" /></div>;
    }

    if (!patient) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-500">
                <User className="h-12 w-12 mb-4 text-slate-300" />
                <p>Patient not found.</p>
                <Link href="/admin/phr"><Button variant="link" className="mt-2">Back</Button></Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in py-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link href="/admin/phr">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900">{patient.name}&apos;s Health Records</h1>
                    <p className="text-sm text-slate-500">{patient.relation} • {patient.age}y • {patient.gender}</p>
                </div>
                {patient.abhaId && (
                    <Badge className="bg-teal-50 text-teal-700 border-teal-200 border">
                        <Shield className="h-3 w-3 mr-1" /> ABHA: {patient.abhaId}
                    </Badge>
                )}
            </div>

            {/* Patient Info Card */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><p className="text-xs text-slate-400 uppercase tracking-wider">Email</p><p className="text-sm text-slate-700 mt-0.5">{patient.email}</p></div>
                        <div><p className="text-xs text-slate-400 uppercase tracking-wider">Phone</p><p className="text-sm text-slate-700 mt-0.5">{patient.phone}</p></div>
                        <div><p className="text-xs text-slate-400 uppercase tracking-wider">Plan</p><p className="text-sm text-slate-700 mt-0.5">{patient.planName || '—'}</p></div>
                        <div><p className="text-xs text-slate-400 uppercase tracking-wider">Total Records</p><p className="text-sm text-slate-700 mt-0.5 font-bold">{records.length}</p></div>
                    </div>
                </CardContent>
            </Card>

            {/* Category Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                    variant={selectedCategory === 'All' ? 'default' : 'outline'}
                    size="sm"
                    className={selectedCategory === 'All' ? 'bg-teal-600 text-white' : 'border-slate-200 text-slate-600'}
                    onClick={() => setSelectedCategory('All')}
                >
                    All ({records.length})
                </Button>
                {PHR_CATEGORIES.map(cat => {
                    const count = records.filter(r => r.category === cat).length;
                    return (
                        <Button
                            key={cat}
                            variant={selectedCategory === cat ? 'default' : 'outline'}
                            size="sm"
                            className={selectedCategory === cat ? 'bg-teal-600 text-white' : 'border-slate-200 text-slate-600'}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {CATEGORY_ICONS[cat]}
                            <span className="ml-1">{cat} ({count})</span>
                        </Button>
                    );
                })}
            </div>

            {/* Records Grid */}
            {filtered.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                    <FileText className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p>No records found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(record => (
                        <Card key={record.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                            <CardContent className="pt-4 pb-4 px-4 flex items-start gap-3">
                                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 text-slate-500">
                                    {record.fileType === 'pdf' ? <FileText className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-800 truncate">{record.fileName}</p>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200">{record.category}</Badge>
                                        <Badge variant="outline" className={`text-[10px] border ${ADDED_BY_STYLES[record.addedBy]}`}>
                                            {record.addedBy === 'vendor' ? `Vendor: ${record.vendorName}` : record.addedBy}
                                        </Badge>
                                        <span className="text-[10px] text-slate-400">{record.fileSize}</span>
                                    </div>
                                    {record.tags && record.tags.length > 0 && (
                                        <div className="flex gap-1 mt-1.5">
                                            {record.tags.map(tag => (
                                                <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-[10px] text-slate-400 mt-1.5">{formatDate(record.uploadedAt)}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-teal-600" onClick={() => toast.success(`Downloading ${record.fileName}...`, { description: 'Secure download started.' })}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
