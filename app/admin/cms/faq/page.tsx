'use client';

import { useState, useEffect } from 'react';
import { FAQ, FAQCategory } from '@/types/cms';
import { getFAQs, upsertFAQ, deleteFAQ, reorderFAQs } from '@/app/actions/cms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';

export default function FAQPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<Partial<FAQ>>({});

    const loadData = async () => {
        setLoading(true);
        const res = await getFAQs();
        if (res.success) setFaqs(res.data || []);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleSave = async () => {
        if (!editingFAQ.question || !editingFAQ.answer) return toast.error("Required fields missing");
        await upsertFAQ(editingFAQ);
        setIsEditOpen(false);
        setEditingFAQ({});
        loadData();
        toast.success("FAQ saved");
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this FAQ?")) {
            await deleteFAQ(id);
            loadData();
            toast.success("FAQ deleted");
        }
    };

    const moveFAQ = async (index: number, direction: 'up' | 'down') => {
        const newFaqs = [...faqs];
        if (direction === 'up' && index > 0) {
            [newFaqs[index], newFaqs[index - 1]] = [newFaqs[index - 1], newFaqs[index]];
        } else if (direction === 'down' && index < newFaqs.length - 1) {
            [newFaqs[index], newFaqs[index + 1]] = [newFaqs[index + 1], newFaqs[index]];
        }
        setFaqs(newFaqs); // Optimistic
        await reorderFAQs(newFaqs.map(f => f.id));
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">FAQ Management</h1>
                    <p className="text-slate-500 text-sm">Manage frequently asked questions.</p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => { setEditingFAQ({ status: 'active', order: faqs.length + 1 }); setIsEditOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add FAQ
                </Button>
            </div>

            <div className="space-y-3">
                {faqs.map((faq, index) => (
                    <Card key={faq.id} className="bg-white border-slate-200 hover:border-teal-500 hover:shadow-md transition-all group shadow-sm">
                        <CardContent className="p-4 flex items-start gap-4">
                            <div className="mt-1 text-slate-400 cursor-move hover:text-slate-600"><GripVertical className="h-5 w-5" /></div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] border-slate-200 text-slate-500 uppercase tracking-wider bg-slate-50">{faq.category}</Badge>
                                    {faq.status === 'inactive' && <Badge variant="destructive" className="text-[10px]">Inactive</Badge>}
                                </div>
                                <h3 className="font-medium text-slate-900 text-lg">{faq.question}</h3>
                                <div className="text-slate-500 text-sm line-clamp-2" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                            </div>

                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:bg-slate-100" onClick={() => moveFAQ(index, 'up')} disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:bg-slate-100" onClick={() => moveFAQ(index, 'down')} disabled={index === faqs.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                                </div>
                                <div className="flex gap-1 mt-2">
                                    <Button variant="secondary" size="icon" className="h-7 w-7 bg-slate-100 hover:bg-slate-200 text-slate-600" onClick={() => { setEditingFAQ(faq); setIsEditOpen(true); }}><Edit2 className="h-3 w-3" /></Button>
                                    <Button variant="destructive" size="icon" className="h-7 w-7 bg-rose-50 text-rose-500 hover:bg-rose-100" onClick={() => handleDelete(faq.id)}><Trash2 className="h-3 w-3" /></Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* EDIT MODAL */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-2xl">
                    <DialogHeader><DialogTitle>{editingFAQ.id ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Question</Label>
                            <Input value={editingFAQ.question || ''} onChange={e => setEditingFAQ({ ...editingFAQ, question: e.target.value })} className="bg-white border-slate-200 text-slate-900" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={editingFAQ.category} onValueChange={(v) => setEditingFAQ({ ...editingFAQ, category: v as FAQCategory })}>
                                    <SelectTrigger className="bg-white border-slate-200 text-slate-900"><SelectValue placeholder="Select Category" /></SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                                        {['General', 'Plans & Coverage', 'E-Cards', 'Reimbursements', 'Wallet & Payments'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={editingFAQ.status} onValueChange={(v) => setEditingFAQ({ ...editingFAQ, status: v as any })}>
                                    <SelectTrigger className="bg-white border-slate-200 text-slate-900"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Answer (Rich Text Support)</Label>
                            <Textarea rows={6} value={editingFAQ.answer || ''} onChange={e => setEditingFAQ({ ...editingFAQ, answer: e.target.value })} className="bg-white border-slate-200 font-mono text-sm text-slate-900" placeholder="<p>Enter answer here...</p>" />
                            <div className="flex gap-2 text-xs text-slate-500">
                                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 text-slate-600 border-slate-200" onClick={() => setEditingFAQ(prev => ({ ...prev, answer: (prev.answer || '') + '<strong></strong>' }))}>Bold</Button>
                                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 text-slate-600 border-slate-200" onClick={() => setEditingFAQ(prev => ({ ...prev, answer: (prev.answer || '') + '<em></em>' }))}>Italic</Button>
                                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 text-slate-600 border-slate-200" onClick={() => setEditingFAQ(prev => ({ ...prev, answer: (prev.answer || '') + '<ul><li></li></ul>' }))}>List</Button>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSave}>Save FAQ</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
