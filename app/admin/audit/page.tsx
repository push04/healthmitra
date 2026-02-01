'use client';

import { useState, useEffect } from 'react';
import { getAuditLogs } from '@/app/actions/settings';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function AuditPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        getAuditLogs().then(res => {
            if (res.success) setLogs(res.data || []);
        });
    }, []);

    const filteredLogs = logs.filter(l => l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6 animate-in fade-in max-w-[1200px] mx-auto p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">Audit Trail</h1>
                    <p className="text-slate-500 text-sm mt-1">Track all administrative actions.</p>
                </div>
                <div className="relative w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Search user, action..." className="pl-9 bg-white border-slate-200 text-slate-900" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-100 hover:bg-transparent">
                            <TableHead className="text-slate-500">Timestamp</TableHead>
                            <TableHead className="text-slate-500">User</TableHead>
                            <TableHead className="text-slate-500">Action</TableHead>
                            <TableHead className="text-slate-500">Module</TableHead>
                            <TableHead className="text-slate-500">Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLogs.map(log => (
                            <TableRow key={log.id} className="border-slate-100 hover:bg-slate-50 text-slate-700">
                                <TableCell className="text-slate-500 text-xs">{log.timestamp}</TableCell>
                                <TableCell className="font-medium text-slate-900">{log.user}</TableCell>
                                <TableCell>{log.action}</TableCell>
                                <TableCell><span className="px-2 py-1 rounded bg-slate-100 text-xs text-slate-600 font-medium">{log.module}</span></TableCell>
                                <TableCell className="text-slate-500">{log.details}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}
