'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, Plus, GripVertical, ArrowLeft, AlertTriangle } from 'lucide-react';
import { PlanCategory } from '@/types/plans';
import { getCategories, upsertCategory, deleteCategory } from '@/app/actions/plans';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<PlanCategory[]>([]);
    const [open, setOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingCategory, setEditingCategory] = useState<Partial<PlanCategory> | null>(null);

    useEffect(() => {
        const load = async () => {
            const res = await getCategories();
            if (res.success && res.data) {
                setCategories(res.data);
            }
        };
        load();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCategory) return;

        await upsertCategory(editingCategory);

        if (editingCategory.id) {
            setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...editingCategory } as PlanCategory : c));
            toast.success("Category updated");
        } else {
            const newCat = { ...editingCategory, id: `cat_${Date.now()}`, displayOrder: categories.length + 1 } as PlanCategory;
            setCategories(prev => [...prev, newCat]);
            toast.success("Category created");
        }
        setOpen(false);
        setEditingCategory(null);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingId) return;
        const res = await deleteCategory(deletingId);
        if (res.success) {
            setCategories(prev => prev.filter(c => c.id !== deletingId));
            toast.success("Category deleted");
        }
        setDeleteDialogOpen(false);
        setDeletingId(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link href="/admin/plans">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                            Category Management
                        </h1>
                    </div>
                    <p className="text-slate-500 text-sm mt-1 ml-11">Organize plan categories and their display order.</p>
                </div>
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingCategory(null); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setEditingCategory({ status: 'active' })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white border-slate-200 text-slate-900">
                        <DialogHeader>
                            <DialogTitle className="text-slate-900">{editingCategory?.id ? 'Edit Category' : 'Create Category'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Category Name *</Label>
                                <Input
                                    value={editingCategory?.name || ''}
                                    onChange={e => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. Elder Care"
                                    className="bg-white border-slate-200 text-slate-900 focus:border-teal-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Description</Label>
                                <Textarea
                                    value={editingCategory?.description || ''}
                                    onChange={e => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Short description..."
                                    className="bg-white border-slate-200 text-slate-900 focus:border-teal-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Icon Name</Label>
                                <Input
                                    value={editingCategory?.icon || ''}
                                    onChange={e => setEditingCategory(prev => ({ ...prev, icon: e.target.value }))}
                                    placeholder="e.g. heart-handshake, stethoscope"
                                    className="bg-white border-slate-200 text-slate-900 focus:border-teal-500"
                                />
                                <p className="text-xs text-slate-400">Use Lucide icon names (lowercase with hyphens)</p>
                            </div>
                            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                                <Label className="text-slate-700">Status</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">{editingCategory?.status === 'active' ? 'Active' : 'Inactive'}</span>
                                    <Switch
                                        checked={editingCategory?.status === 'active'}
                                        onCheckedChange={(checked) => setEditingCategory(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditingCategory(null); }} className="border-slate-200 text-slate-600">Cancel</Button>
                                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
            <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow className="border-slate-200 hover:bg-transparent">
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead className="text-slate-600 font-semibold">Category Name</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Icon</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Description</TableHead>
                                <TableHead className="text-slate-600 font-semibold">Status</TableHead>
                                <TableHead className="text-right text-slate-600 font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((cat) => (
                                <TableRow key={cat.id} className="border-slate-100 hover:bg-slate-50/50">
                                    <TableCell>
                                        <GripVertical className="h-4 w-4 text-slate-300 cursor-move" />
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-800">{cat.name}</TableCell>
                                    <TableCell className="text-sm text-slate-500 font-mono">{cat.icon || '—'}</TableCell>
                                    <TableCell className="text-slate-500 text-sm max-w-md truncate">{cat.description}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cat.status === 'active' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-slate-500 border-slate-200 bg-slate-50'}>
                                            {cat.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => { setEditingCategory(cat); setOpen(true); }} className="text-slate-400 hover:text-teal-600 hover:bg-teal-50">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => { setDeletingId(cat.id); setDeleteDialogOpen(true); }} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-900">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            Delete Category
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-slate-500">
                        Are you sure you want to delete this category? Plans linked to this category will not be affected, but the category association will be removed.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-slate-200 text-slate-600">Cancel</Button>
                        <Button onClick={handleDeleteConfirm} className="bg-rose-600 hover:bg-rose-700 text-white">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
