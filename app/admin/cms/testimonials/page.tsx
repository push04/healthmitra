'use client';

import { useState, useEffect } from 'react';
import { Testimonial } from '@/types/cms';
import { getTestimonials, upsertTestimonial, deleteTestimonial, toggleTestimonialFeatured } from '@/app/actions/cms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, Trash2, Star, Upload, MapPin, Calendar, User, Quote } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<Testimonial>>({});

    const loadData = async () => {
        setLoading(true);
        const res = await getTestimonials();
        if (res.success) setTestimonials(res.data || []);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleSave = async () => {
        if (!editingItem.customerName || !editingItem.text) return toast.error("Required fields missing");
        await upsertTestimonial(editingItem);
        setIsEditOpen(false);
        setEditingItem({});
        loadData();
        toast.success("Testimonial saved");
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this testimonial?")) {
            await deleteTestimonial(id);
            loadData();
            toast.success("Testimonial deleted");
        }
    };

    const handleToggleFeatured = async (id: string) => {
        await toggleTestimonialFeatured(id);
        loadData();
        toast.success("Updated featured status");
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Customer Testimonials</h1>
                    <p className="text-zinc-500 text-sm">Manage reviews and featured stories.</p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => { setEditingItem({ rating: 5, isFeatured: false, status: 'active', date: new Date().toISOString().split('T')[0] }); setIsEditOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Testimonial
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((item) => (
                    <Card key={item.id} className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all flex flex-col">
                        <CardContent className="p-6 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-zinc-700">
                                        <AvatarImage src={item.customerPhoto} />
                                        <AvatarFallback className="bg-teal-900/30 text-teal-400">{item.customerName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold text-white">{item.customerName}</div>
                                        <div className="flex text-amber-400 text-xs">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-3 w-3 ${i < item.rating ? 'fill-current' : 'text-zinc-700'}`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {item.isFeatured && <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Featured</Badge>}
                                </div>
                            </div>

                            <div className="flex-1 relative pl-6 mb-4">
                                <Quote className="absolute left-0 top-0 h-4 w-4 text-zinc-600" />
                                <p className="text-zinc-300 text-sm italic">{item.text}</p>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4 pt-4 border-t border-zinc-800">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location}</span>
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {item.date}</span>
                            </div>

                            <div className="flex justify-between items-center bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={item.isFeatured ? "text-amber-500" : "text-zinc-500"}
                                    onClick={() => handleToggleFeatured(item.id)}
                                >
                                    <Star className={`mr-2 h-3 w-3 ${item.isFeatured ? "fill-current" : ""}`} />
                                    {item.isFeatured ? 'Featured' : 'Feature'}
                                </Button>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white" onClick={() => { setEditingItem(item); setIsEditOpen(true); }}><Edit2 className="h-3 w-3" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:bg-red-900/20" onClick={() => handleDelete(item.id)}><Trash2 className="h-3 w-3" /></Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* EDIT MODAL */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
                    <DialogHeader><DialogTitle>{editingItem.id ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Customer Name *</Label>
                            <Input value={editingItem.customerName || ''} onChange={e => setEditingItem(prev => ({ ...prev, customerName: e.target.value }))} className="bg-zinc-950 border-zinc-800" />
                        </div>
                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <Label>Location</Label>
                                <Input value={editingItem.location || ''} onChange={e => setEditingItem(prev => ({ ...prev, location: e.target.value }))} className="bg-zinc-950 border-zinc-800" placeholder="City, State" />
                            </div>
                            <div className="space-y-2 w-32">
                                <Label>Date</Label>
                                <Input type="date" value={editingItem.date || ''} onChange={e => setEditingItem(prev => ({ ...prev, date: e.target.value }))} className="bg-zinc-950 border-zinc-800" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Rating</Label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <Button
                                        key={star}
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 h-auto hover:bg-transparent"
                                        onClick={() => setEditingItem(prev => ({ ...prev, rating: star }))}
                                    >
                                        <Star className={`h-6 w-6 ${(editingItem.rating || 0) >= star ? 'text-amber-400 fill-current' : 'text-zinc-600'}`} />
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Testimonial Text *</Label>
                            <Textarea value={editingItem.text || ''} onChange={e => setEditingItem(prev => ({ ...prev, text: e.target.value }))} className="bg-zinc-950 border-zinc-800" rows={4} maxLength={500} />
                            <div className="text-right text-xs text-zinc-500">{(editingItem.text || '').length}/500</div>
                        </div>

                        <div className="flex items-center space-x-2 py-2">
                            <Switch
                                id="featured"
                                checked={editingItem.isFeatured}
                                onCheckedChange={(c) => setEditingItem(prev => ({ ...prev, isFeatured: c }))}
                                className="data-[state=checked]:bg-teal-600"
                            />
                            <Label htmlFor="featured">Feature on Homepage</Label>
                        </div>

                        <div className="flex items-center space-x-2 py-2">
                            <Switch
                                id="verified"
                                checked={editingItem.isVerified}
                                onCheckedChange={(c) => setEditingItem(prev => ({ ...prev, isVerified: c }))}
                                className="data-[state=checked]:bg-teal-600"
                            />
                            <Label htmlFor="verified">Verified Purchase</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
