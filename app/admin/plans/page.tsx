'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Loader2, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { Plan, PlanCategory } from '@/types/plans';
import { getPlans, copyPlan, getCategories } from '@/app/actions/plans';
import PlanCard from '@/components/admin/plans/PlanCard';
import { toast } from 'sonner';

export default function PlansListingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [categories, setCategories] = useState<PlanCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        const loadCats = async () => {
            const res = await getCategories();
            if (res.success && res.data) setCategories(res.data);
        };
        loadCats();
    }, []);

    useEffect(() => {
        const fetchToLoad = async () => {
            setLoading(true);
            try {
                const res = await getPlans({
                    query: search,
                    status: statusFilter,
                    type: typeFilter,
                    categoryId: categoryFilter
                });
                if (res.success && res.data) {
                    setPlans(res.data);
                }
            } catch {
                toast.error("Failed to fetch plans");
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(fetchToLoad, 300);
        return () => clearTimeout(timeout);
    }, [search, statusFilter, typeFilter, categoryFilter, refreshKey]);

    const handleEdit = (id: string) => {
        window.location.href = `/admin/plans/${id}/edit`;
    };

    const handleDelete = (id: string) => {
        toast.message("Deleting plan", { description: "This is a mock action" });
    };

    const handleToggle = (id: string) => {
        toast.success("Plan status toggled (Mock)");
    };

    const handleViewAudit = (id: string) => {
        toast.info("Opening Audit Log mock...");
    };


    const handleCopy = async (id: string) => {
        const res = await copyPlan(id);
        if (res.success) {
            setRefreshKey(prev => prev + 1);
            toast.success("Plan copied successfully", {
                description: res.message
            });
        } else {
            toast.error("Failed to copy plan", { description: res.error });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in py-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                        Health Plans Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Manage and organize all your B2B and B2C health plans.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/plans/categories">
                        <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                            <LayoutGrid className="mr-2 h-4 w-4" /> Categories
                        </Button>
                    </Link>
                    <Link href="/admin/plans/new">
                        <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Create New Plan
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search plans by name or ID..."
                        className="pl-9 bg-white border-slate-200 text-slate-900 focus:border-teal-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex w-full md:w-auto gap-2 overflow-x-auto pb-2 md:pb-0">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] bg-white border-slate-200 text-slate-700">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-700">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-[140px] bg-white border-slate-200 text-slate-700">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-700">
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="B2C">B2C (Public)</SelectItem>
                            <SelectItem value="B2B">B2B (Private)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[160px] bg-white border-slate-200 text-slate-700">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 text-slate-700">
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grid Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                        <span className="ml-2 text-zinc-500">Loading plans...</span>
                    </div>
                ) : plans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                        <Filter className="h-12 w-12 mb-4 opacity-20" />
                        <p>No plans found matching your filters.</p>
                        <Button variant="link" onClick={() => { setSearch(''); setStatusFilter('all'); setTypeFilter('all'); setCategoryFilter('all'); }}>
                            Clear all filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {plans.map(plan => (
                            <PlanCard
                                key={plan.id}
                                plan={plan}
                                categories={categories}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onToggleStatus={handleToggle}
                                onViewAudit={handleViewAudit}
                                onCopy={handleCopy}
                            />
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
