'use client';

import { useState, useEffect } from 'react';
import { Page, PageStatus } from '@/types/cms';
import { getPages, upsertPage, deletePage } from '@/app/actions/cms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Eye, FileText, Globe, Search, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

export default function PagesPage() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<Partial<Page>>({});

    const loadData = async () => {
        setLoading(true);
        const res = await getPages();
        if (res.success) setPages(res.data || []);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleSave = async () => {
        if (!editingPage.title || !editingPage.slug) return toast.error("Title and Slug are required");
        await upsertPage(editingPage);
        setIsEditOpen(false);
        setEditingPage({});
        loadData();
        toast.success("Page saved successfully");
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this page?")) {
            await deletePage(id);
            loadData();
            toast.success("Page deleted");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Page Management</h1>
                    <p className="text-slate-500 text-sm">Create and edit website pages.</p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => { setEditingPage({ status: 'draft', seo: { metaTitle: '', metaDescription: '', keywords: [] } }); setIsEditOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Create New Page
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pages.map(page => (
                    <Card key={page.id} className="bg-white border-slate-200 hover:border-teal-500 hover:shadow-md transition-all group shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-teal-50 rounded border border-teal-100">
                                    <FileText className="h-6 w-6 text-teal-600" />
                                </div>
                                <Badge variant={page.status === 'published' ? 'default' : 'secondary'} className={page.status === 'published' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}>
                                    {page.status}
                                </Badge>
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg mb-1">{page.title}</h3>
                            <div className="flex items-center gap-1 text-xs text-slate-500 font-mono mb-4">
                                <Globe className="h-3 w-3" /> /{page.slug}
                            </div>
                            <div className="text-xs text-slate-400 mb-4">Last Updated: {page.lastUpdated}</div>

                            <div className="flex gap-2 pt-4 border-t border-slate-100">
                                <Button className="flex-1 bg-white border-slate-200 hover:bg-slate-50 text-slate-700" variant="outline" size="sm">
                                    <Eye className="mr-2 h-3 w-3" /> Preview
                                </Button>
                                <Button size="icon" variant="secondary" onClick={() => { setEditingPage(page); setIsEditOpen(true); }} className="bg-slate-100 text-slate-600 hover:bg-slate-200"><Edit2 className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" className="text-rose-500 hover:bg-rose-50 hover:text-rose-600" onClick={() => handleDelete(page.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* EDIT MODAL */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
                    <DialogHeader className="p-6 pb-2 border-b border-slate-200">
                        <DialogTitle>{editingPage.id ? 'Edit Page' : 'Create New Page'}</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6">
                        <Tabs defaultValue="content" className="w-full">
                            <TabsList className="bg-slate-50 border border-slate-200 w-full justify-start mb-6 text-slate-500">
                                <TabsTrigger value="content" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Page Content</TabsTrigger>
                                <TabsTrigger value="seo" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">SEO Settings</TabsTrigger>
                                <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Page Settings</TabsTrigger>
                            </TabsList>

                            <TabsContent value="content" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Page Title *</Label>
                                        <Input value={editingPage.title || ''} onChange={e => setEditingPage({ ...editingPage, title: e.target.value })} className="bg-white border-slate-200 text-slate-900" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>URL Slug *</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">/</span>
                                            <Input value={editingPage.slug || ''} onChange={e => setEditingPage({ ...editingPage, slug: e.target.value })} className="pl-6 bg-white border-slate-200 text-slate-900 font-mono text-sm" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Content (Rich Text)</Label>
                                    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                                        <div className="bg-slate-50 border-b border-slate-200 p-2 flex gap-1 text-slate-700">
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-slate-200">B</Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 italic hover:bg-slate-200">I</Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 underline hover:bg-slate-200">U</Button>
                                            <div className="w-px h-4 bg-slate-300 mx-1 self-center" />
                                            <Button variant="ghost" size="sm" className="h-7 w-auto px-2 text-xs hover:bg-slate-200">H1</Button>
                                            <Button variant="ghost" size="sm" className="h-7 w-auto px-2 text-xs hover:bg-slate-200">H2</Button>
                                        </div>
                                        <Textarea
                                            value={editingPage.content || ''}
                                            onChange={e => setEditingPage({ ...editingPage, content: e.target.value })}
                                            className="bg-white border-none rounded-none min-h-[400px] font-mono p-4 focus-visible:ring-0 text-slate-800"
                                            placeholder="Enter HTML content..."
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="seo" className="space-y-4">
                                <Card className="bg-white border-slate-200 shadow-sm">
                                    <CardContent className="p-4 space-y-4">
                                        <div className="space-y-2">
                                            <Label>Meta Title</Label>
                                            <Input value={editingPage.seo?.metaTitle || ''} onChange={e => setEditingPage({ ...editingPage, seo: { ...editingPage.seo!, metaTitle: e.target.value } })} className="bg-white border-slate-200 text-slate-900" />
                                            <p className="text-xs text-slate-500">Recommended length: 50-60 characters</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Meta Description</Label>
                                            <Textarea value={editingPage.seo?.metaDescription || ''} onChange={e => setEditingPage({ ...editingPage, seo: { ...editingPage.seo!, metaDescription: e.target.value } })} className="bg-white border-slate-200 text-slate-900" />
                                            <p className="text-xs text-slate-500">Recommended length: 150-160 characters</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Keywords</Label>
                                            <Input value={editingPage.seo?.keywords?.join(', ') || ''} onChange={e => setEditingPage({ ...editingPage, seo: { ...editingPage.seo!, keywords: e.target.value.split(', ') } })} className="bg-white border-slate-200 text-slate-900" placeholder="comma, separated, tags" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="settings" className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Publish Status</Label>
                                    <Select value={editingPage.status} onValueChange={(v) => setEditingPage({ ...editingPage, status: v as PageStatus })}>
                                        <SelectTrigger className="bg-white border-slate-200 text-slate-900"><SelectValue /></SelectTrigger>
                                        <SelectContent className="bg-white border-slate-200 text-slate-900">
                                            <SelectItem value="draft">Draft (Hidden)</SelectItem>
                                            <SelectItem value="published">Published (Live)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <DialogFooter className="p-6 border-t border-slate-200 bg-slate-50">
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSave}>Save Page</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
