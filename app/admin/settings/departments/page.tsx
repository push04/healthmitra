'use client';

import { useState, useEffect } from 'react';
import { MOCK_DEPARTMENTS, Department } from '@/app/lib/mock/departments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [open, setOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Partial<Department> | null>(null);

    useEffect(() => {
        // Simulate fetch
        setDepartments(MOCK_DEPARTMENTS);
    }, []);

    const handleSave = () => {
        if (!editingDept?.name) return;

        if (editingDept.id) {
            setDepartments(prev => prev.map(d => d.id === editingDept.id ? { ...d, ...editingDept } as Department : d));
            toast.success("Department updated");
        } else {
            const newDept = {
                ...editingDept,
                id: `dept_${Date.now()}`,
                employeeCount: 0,
                status: 'active',
                designations: []
            } as Department;
            setDepartments(prev => [...prev, newDept]);
            toast.success("Department created");
        }
        setOpen(false);
        setEditingDept(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                        Department Management
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">Configure organizational structure and designations.</p>
                </div>
                <Button onClick={() => { setEditingDept({}); setOpen(true); }} className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Department
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => (
                    <Card key={dept.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-bold text-white">{dept.name}</CardTitle>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={() => { setEditingDept(dept); setOpen(true); }}>
                                    <Edit2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-zinc-400 mb-4 h-10 line-clamp-2">
                                {dept.description || "No description provided."}
                            </div>

                            <div className="flex items-center text-sm text-zinc-500 mb-4">
                                <Users className="mr-2 h-4 w-4" />
                                {dept.employeeCount} Employees
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs font-semibold text-zinc-600 uppercase">Designations</div>
                                <div className="flex flex-wrap gap-1">
                                    {dept.designations.map(des => (
                                        <div key={des.id} className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300">
                                            {des.name}
                                        </div>
                                    ))}
                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-teal-500 hover:text-teal-400 hover:bg-teal-900/10">
                                        + Add
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>{editingDept?.id ? 'Edit Department' : 'Create Department'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Department Name</Label>
                            <Input
                                value={editingDept?.name || ''}
                                onChange={e => setEditingDept(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-zinc-950 border-zinc-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={editingDept?.description || ''}
                                onChange={e => setEditingDept(prev => ({ ...prev, description: e.target.value }))}
                                className="bg-zinc-950 border-zinc-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Department Head (Employee)</Label>
                            <Input
                                value={editingDept?.head || ''}
                                onChange={e => setEditingDept(prev => ({ ...prev, head: e.target.value }))}
                                placeholder="Search employee..."
                                className="bg-zinc-950 border-zinc-800"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
