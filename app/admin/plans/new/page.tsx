'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Save, CheckCircle, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Plan, PlanService, MOCK_CATEGORIES } from '@/app/lib/mock/plans-data';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';

// Mock empty plan
const INITIAL_PLAN: Partial<Plan> = {
    name: '',
    type: 'B2C',
    description: '',
    basePrice: 0,
    gstPercent: 18,
    totalPrice: 0,
    status: 'draft',
    validityType: 'year',
    validityValue: 1,
    memberCountMin: 1,
    memberCountMax: 4,
    categoryIds: [],
    services: [],
    showOnWebsite: false,
    isFeatured: false
};

export default function CreatePlanWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [plan, setPlan] = useState<Partial<Plan>>(INITIAL_PLAN);

    // --- HANDLERS ---
    const updatePlan = (updates: Partial<Plan>) => {
        setPlan(prev => {
            const updated = { ...prev, ...updates };
            // Auto calc total price if base price changes
            if (updates.basePrice !== undefined || updates.gstPercent !== undefined) {
                const base = updates.basePrice ?? prev.basePrice ?? 0;
                const gst = updates.gstPercent ?? prev.gstPercent ?? 18;
                updated.totalPrice = base + (base * (gst / 100));
            }
            return updated;
        });
    };

    const handleServiceAdd = () => {
        const newService: PlanService = {
            id: `srv_${Date.now()}`,
            name: '',
            categoryId: MOCK_CATEGORIES[0]?.id,
            description: '',
            status: 'enabled',
            displayOrder: (plan.services?.length || 0) + 1
        };
        updatePlan({ services: [...(plan.services || []), newService] });
    };

    const updateService = (id: string, updates: Partial<PlanService>) => {
        updatePlan({
            services: plan.services?.map(s => s.id === id ? { ...s, ...updates } : s)
        });
    };

    const removeService = (id: string) => {
        updatePlan({ services: plan.services?.filter(s => s.id !== id) });
    };

    const handleNext = () => {
        if (currentStep < 5) setCurrentStep(c => c + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(c => c - 1);
    };

    const handlePublish = () => {
        console.log("PUBLISHING PLAN:", plan);
        toast.success("Plan Published Successfully", {
            description: "The plan is now live on the website."
        });
        // Redirect logic would go here
    };

    return (
        <div className="max-w-5xl mx-auto py-8 animate-in fade-in space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Plan</h1>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className={currentStep >= 1 ? "text-teal-600 font-medium" : ""}>1. Basic Details</span>
                        <span className="text-slate-300">/</span>
                        <span className={currentStep >= 2 ? "text-teal-600 font-medium" : ""}>2. Services</span>
                        <span className="text-slate-300">/</span>
                        <span className={currentStep >= 3 ? "text-teal-600 font-medium" : ""}>3. Validity</span>
                        <span className="text-slate-300">/</span>
                        <span className={currentStep >= 4 ? "text-teal-600 font-medium" : ""}>4. Visibility</span>
                        <span className="text-slate-300">/</span>
                        <span className={currentStep >= 5 ? "text-teal-600 font-medium" : ""}>5. Review</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/plans">
                        <Button variant="ghost" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">Cancel</Button>
                    </Link>
                    {currentStep === 5 ? (
                        <Button onClick={handlePublish} className="bg-teal-600 hover:bg-teal-700 text-white">
                            <Save className="mr-2 h-4 w-4" /> Save & Publish
                        </Button>
                    ) : (
                        <Button onClick={handleNext} className="bg-slate-900 text-white hover:bg-slate-800">
                            Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm min-h-[500px]">
                <CardContent className="p-8">
                    {/* STEP 1: BASIC DETAILS */}
                    {currentStep === 1 && (
                        <div className="space-y-6 slide-in-from-right-4 duration-500 animate-in fade-in">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Plan Name *</Label>
                                    <Input value={plan.name} onChange={e => updatePlan({ name: e.target.value })} placeholder="e.g. Gold Health Plan" className="bg-white border-slate-200 text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Plan Type *</Label>
                                    <RadioGroup
                                        value={plan.type}
                                        onValueChange={(v) => updatePlan({ type: v as any })}
                                        className="flex gap-4 p-2 bg-slate-50 border border-slate-200 rounded-md"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="B2C" id="b2c" />
                                            <Label htmlFor="b2c">B2C (Public)</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="B2B" id="b2b" />
                                            <Label htmlFor="b2b">B2B (Private)</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={plan.description} onChange={e => updatePlan({ description: e.target.value })} placeholder="Detailed plan description..." className="bg-white border-slate-200 text-slate-900 h-32" />
                            </div>

                            <div className="grid grid-cols-3 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="space-y-2">
                                    <Label>Base Price (₹) *</Label>
                                    <Input type="number" value={plan.basePrice} onChange={e => updatePlan({ basePrice: parseFloat(e.target.value) })} className="bg-white border-slate-200 text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label>GST (%)</Label>
                                    <Input type="number" value={plan.gstPercent} onChange={e => updatePlan({ gstPercent: parseFloat(e.target.value) })} className="bg-white border-slate-200 text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-teal-600">Total Price (Auto)</Label>
                                    <div className="h-10 px-3 py-2 bg-teal-50 border border-teal-200 rounded-md text-teal-600 font-bold">
                                        ₹ {plan.totalPrice?.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: SERVICES */}
                    {currentStep === 2 && (
                        <div className="space-y-6 slide-in-from-right-4 duration-500 animate-in fade-in">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-slate-800">Included Services</h3>
                                <Button onClick={handleServiceAdd} variant="outline" size="sm" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                                    <Plus className="mr-2 h-4 w-4" /> Add Service
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {plan.services?.length === 0 && (
                                    <div className="text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500">
                                        No services added yet. Click &quot;Add Service&quot; to begin.
                                    </div>
                                )}
                                {plan.services?.map((service, index) => (
                                    <div key={service.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 relative group hover:bg-white hover:shadow-sm transition-all">
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500"><ChevronUp className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-500"><ChevronDown className="h-4 w-4" /></Button>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => removeService(service.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-1 flex items-center justify-center">
                                                <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-sm font-bold border border-slate-300">
                                                    {index + 1}
                                                </div>
                                            </div>
                                            <div className="col-span-11 grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-slate-500">Service Name</Label>
                                                    <Input value={service.name} onChange={e => updateService(service.id, { name: e.target.value })} placeholder="Service Name" className="bg-white border-slate-200 text-slate-900 h-8" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-slate-500">Category</Label>
                                                    <Select value={service.categoryId} onValueChange={v => updateService(service.id, { categoryId: v })}>
                                                        <SelectTrigger className="bg-white border-slate-200 text-slate-900 h-8">
                                                            <SelectValue placeholder="Select" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white text-slate-900 border-slate-200">
                                                            {MOCK_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="col-span-2 space-y-1">
                                                    <Label className="text-xs text-slate-500">Description</Label>
                                                    <Input value={service.description} onChange={e => updateService(service.id, { description: e.target.value })} placeholder="Details..." className="bg-white border-slate-200 text-slate-900 h-8" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-slate-500">Limit Description</Label>
                                                    <Input value={service.limit_description} onChange={e => updateService(service.id, { limit_description: e.target.value })} placeholder="e.g. 2 per year" className="bg-white border-slate-200 text-slate-900 h-8" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-slate-500">Status</Label>
                                                    <Select value={service.status} onValueChange={v => updateService(service.id, { status: v as any })}>
                                                        <SelectTrigger className="bg-white border-slate-200 text-slate-900 h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white text-slate-900 border-slate-200">
                                                            <SelectItem value="enabled">Enabled</SelectItem>
                                                            <SelectItem value="disabled">Disabled</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: VALIDITY */}
                    {currentStep === 3 && (
                        <div className="space-y-6 slide-in-from-right-4 duration-500 animate-in fade-in max-w-2xl mx-auto">
                            <div className="space-y-4 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                                <h3 className="tex-lg font-medium text-slate-800">Plan Duration</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Validity Type</Label>
                                        <Select value={plan.validityType} onValueChange={v => updatePlan({ validityType: v as any })}>
                                            <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white text-slate-900 border-slate-200">
                                                <SelectItem value="year">Year(s)</SelectItem>
                                                <SelectItem value="month">Month(s)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Value</Label>
                                        <Input type="number" value={plan.validityValue} onChange={e => updatePlan({ validityValue: parseInt(e.target.value) })} className="bg-white border-slate-200 text-slate-900" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                                <h3 className="tex-lg font-medium text-slate-800">Member Limits</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Min Members</Label>
                                        <Input type="number" value={plan.memberCountMin} onChange={e => updatePlan({ memberCountMin: parseInt(e.target.value) })} className="bg-white border-slate-200 text-slate-900" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Max Members</Label>
                                        <Input type="number" value={plan.memberCountMax} onChange={e => updatePlan({ memberCountMax: parseInt(e.target.value) })} className="bg-white border-slate-200 text-slate-900" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: VISIBILITY */}
                    {currentStep === 4 && (
                        <div className="space-y-6 slide-in-from-right-4 duration-500 animate-in fade-in max-w-2xl mx-auto">
                            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <div>
                                    <Label className="text-base text-slate-800">Show on Website</Label>
                                    <p className="text-sm text-slate-500">Make this plan visible to public users.</p>
                                </div>
                                <Switch checked={plan.showOnWebsite} onCheckedChange={c => updatePlan({ showOnWebsite: c })} />
                            </div>

                            {plan.showOnWebsite && (
                                <div className="space-y-4 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                                    <div className="space-y-2">
                                        <Label>URL Slug</Label>
                                        <div className="flex bg-white border border-slate-200 rounded-md overflow-hidden">
                                            <div className="px-3 py-2 bg-slate-100 text-slate-500 text-sm border-r border-slate-200">healthmitra.com/plans/</div>
                                            <Input className="border-0 bg-transparent focus-visible:ring-0 text-slate-900" placeholder="gold-plan-2025" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                <div>
                                    <Label className="text-base text-slate-800">Featured Plan</Label>
                                    <p className="text-sm text-slate-500">Display this plan on the homepage hero section.</p>
                                </div>
                                <Switch checked={plan.isFeatured} onCheckedChange={c => updatePlan({ isFeatured: c })} />
                            </div>
                        </div>
                    )}

                    {/* STEP 5: REVIEW */}
                    {currentStep === 5 && (
                        <div className="space-y-8 slide-in-from-right-4 duration-500 animate-in fade-in">
                            <div className="bg-gradient-to-br from-white to-slate-50 border border-teal-100 rounded-2xl p-8 text-center space-y-4 shadow-sm">
                                <div className="mx-auto h-16 w-16 bg-teal-50 rounded-full flex items-center justify-center mb-4 border border-teal-100">
                                    <CheckCircle className="h-8 w-8 text-teal-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">{plan.name}</h2>
                                <p className="text-slate-500 max-w-md mx-auto">{plan.description}</p>

                                <div className="flex justify-center gap-8 py-6 border-t border-b border-slate-200">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-teal-600">₹{plan.totalPrice?.toFixed(0)}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider">Total Price</div>
                                    </div>
                                    <div className="w-px bg-slate-200 h-12"></div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-slate-800">{plan.services?.length}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider">Services</div>
                                    </div>
                                    <div className="w-px bg-slate-200 h-12"></div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-slate-800">{plan.memberCountMax}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider">Max Members</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Footer Navigation */}
            <div className="flex justify-between mt-8">
                <Button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    variant="outline"
                    className="border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </div>
        </div>
    );
}
