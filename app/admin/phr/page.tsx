'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Search, Loader2, FileText, User, Shield, Upload, Eye
} from 'lucide-react';
import { PatientMember } from '@/app/lib/mock/phr-data';
import { getPatients } from '@/app/actions/phr';
import Link from 'next/link';

export default function AdminPHRPage() {
    const [patients, setPatients] = useState<PatientMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const res = await getPatients(search || undefined);
            if (res.success && res.data) setPatients(res.data);
            setLoading(false);
        };
        const timeout = setTimeout(fetch, 300);
        return () => clearTimeout(timeout);
    }, [search]);

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        Personal Health Records
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">View and manage patient health records across all members.</p>
                </div>
                <Link href="/admin/phr/vendor">
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                        <Upload className="mr-2 h-4 w-4" /> Vendor Portal
                    </Button>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name, email, phone, or ABHA ID..."
                        className="pl-9 bg-white border-slate-200 text-slate-900"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Patient Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                    </div>
                ) : patients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <User className="h-10 w-10 opacity-20 mb-2" />
                        <p>No patients found.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 border-slate-200">
                                <TableHead className="text-slate-600 font-semibold">Patient</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Relation</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Age / Gender</TableHead>
                                <TableHead className="text-slate-600 font-semibold">ABHA ID</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Plan</TableHead>
                                <TableHead className="text-slate-600 font-semibold text-center">Records</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Last Updated</TableHead>
                                <TableHead className="text-slate-600 font-semibold text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients.map(patient => (
                                <TableRow key={patient.id} className="border-slate-100 hover:bg-slate-50/50">
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-800">{patient.name}</p>
                                            <p className="text-xs text-slate-400">{patient.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">{patient.relation}</TableCell>
                                    <TableCell className="text-sm text-slate-600">{patient.age}y / {patient.gender}</TableCell>
                                    <TableCell>
                                        {patient.abhaId ? (
                                            <div className="flex items-center gap-1 text-xs">
                                                <Shield className="h-3 w-3 text-teal-500" />
                                                <span className="text-teal-700 font-mono">{patient.abhaId}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Not linked</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {patient.planName ? (
                                            <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">{patient.planName}</Badge>
                                        ) : (
                                            <span className="text-xs text-slate-400">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <FileText className="h-3 w-3 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-700">{patient.recordCount}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500">{patient.lastUpdated}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/phr/${patient.id}`}>
                                            <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 text-xs">
                                                <Eye className="h-3.5 w-3.5 mr-1" /> View Records
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
