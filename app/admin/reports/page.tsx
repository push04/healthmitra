'use client';

import { useState } from 'react';
import { generateReportAction } from '@/app/actions/analytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileDown, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
    const [reportType, setReportType] = useState('sales');
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        await generateReportAction(reportType, { from: '2023-01-01', to: '2023-12-31' }); // Mock
        setGenerating(false);
        toast.success("Report generated and downloaded");
    };

    return (
        <div className="space-y-6 animate-in fade-in max-w-[1200px] mx-auto p-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Reports Center</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* GENERATOR */}
                <Card className="col-span-2 bg-white border-slate-200 shadow-sm">
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                            <div className="bg-purple-100 p-3 rounded-full"><FileDown className="h-6 w-6 text-purple-600" /></div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-800">Generate Report</h2>
                                <p className="text-slate-500">Export system data to Excel/CSV.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Report Type</Label>
                                <Select value={reportType} onValueChange={setReportType}>
                                    <SelectTrigger className="bg-white border-slate-200 text-slate-900"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                                        <SelectItem value="sales">Plan Sales Report</SelectItem>
                                        <SelectItem value="revenue">Revenue Report</SelectItem>
                                        <SelectItem value="coupons">Coupon Usage Report</SelectItem>
                                        <SelectItem value="customers">Customer List Report</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Format</Label>
                                <Select defaultValue="excel">
                                    <SelectTrigger className="bg-white border-slate-200 text-slate-900"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                                        <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                                        <SelectItem value="csv">CSV</SelectItem>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>From Date</Label>
                                <Input type="date" className="bg-white border-slate-200 text-slate-900 accent-purple-600" />
                            </div>
                            <div className="space-y-2">
                                <Label>To Date</Label>
                                <Input type="date" className="bg-white border-slate-200 text-slate-900 accent-purple-600" />
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <Label>Incldue Columns</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Customer Name', 'Plan Details', 'Payment Info', 'Date & Time', 'Transaction ID', 'Status'].map(c => (
                                    <div key={c} className="flex items-center space-x-2">
                                        <Checkbox id={c} defaultChecked />
                                        <label htmlFor={c} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{c}</label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={handleGenerate} disabled={generating}>
                            {generating ? 'Generating...' : 'Download Report'}
                        </Button>
                    </CardContent>
                </Card>

                {/* SCHEDULED REPORTS */}
                <div className="space-y-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-slate-800 mb-4">Scheduled Reports</h3>
                            <div className="space-y-4">
                                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                                    <div className="font-medium text-slate-900">Monthly Sales</div>
                                    <div className="text-xs text-slate-500">Runs monthly on 1st • Excel</div>
                                </div>
                                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                                    <div className="font-medium text-slate-900">Weekly Claims</div>
                                    <div className="text-xs text-slate-500">Runs weekly on Mon • PDF</div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full mt-4 border-slate-200 text-slate-700 hover:bg-slate-50">Manage Schedules</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
