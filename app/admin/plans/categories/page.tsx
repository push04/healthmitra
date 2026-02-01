'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Pencil, Trash2, Plus, GripVertical } from 'lucide-react';
import { PlanCategory, MOCK_CATEGORIES } from '@/app/lib/mock/plans-data';
import { getCategories, upsertCategory } from '@/app/actions/plans';
import { toast } from 'sonner';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<PlanCategory[]>([]);
    const [open, setOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Partial<PlanCategory> | null>(null);

    // Fetch categories
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

        // Optimistic update for demo
        if (editingCategory.id) {
            setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...editingCategory } as PlanCategory : c));
            toast.success("Category updated");
        } else {
            const newCat = { ...editingCategory, id: `new_${Date.now()}`, displayOrder: categories.length + 1 } as PlanCategory;
            setCategories(prev => [...prev, newCat]);
            toast.success("Category created");
        }
        setOpen(false);
        setEditingCategory(null);
    };

    const handleDelete = (id: string) => {
        toast.message("Mock delete category", { description: "Cannot delete via mock API yet" });
    };

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Category Management</h1>
                    <p className="text-zinc-400 text-sm mt-1">Organize plan categories and their display order.</p>
                </div>
                <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditingCategory(null); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setEditingCategory({ status: 'active' })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                        <DialogHeader>
                            <DialogTitle>{editingCategory?.id ? 'Edit Category' : 'Create Category'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Category Name *</Label>
                                <Input
                                    value={editingCategory?.name || ''}
                                    onChange={e => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g. Dental Care"
                                    className="bg-zinc-950 border-zinc-800"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editingCategory?.description || ''}
                                    onChange={e => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Short description..."
                                    className="bg-zinc-950 border-zinc-800"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg">
                                <Label>Status</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-500">{editingCategory?.status === 'active' ? 'Active' : 'Inactive'}</span>
                                    <Switch
                                        checked={editingCategory?.status === 'active'}
                                        onCheckedChange={(checked) => setEditingCategory(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Save Changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-950/50">
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Category Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((cat) => (
                                <TableRow key={cat.id} className="border-zinc-800 hover:bg-zinc-900/50">
                                    <TableCell>
                                        <GripVertical className="h-4 w-4 text-zinc-600 cursor-move" />
                                    </TableCell>
                                    <TableCell className="font-medium text-white">{cat.name}</TableCell>
                                    <TableCell className="text-zinc-400 text-sm max-w-md truncate">{cat.description}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cat.status === 'active' ? 'text-green-500 border-green-900 bg-green-900/10' : 'text-zinc-500 border-zinc-800'}>
                                            {cat.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => { setEditingCategory(cat); setOpen(true); }}>
                                                <Pencil className="h-4 w-4 text-zinc-400 hover:text-white" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)}>
                                                <Trash2 className="h-4 w-4 text-zinc-500 hover:text-red-400" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
