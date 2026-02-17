'use client';

import { useState, useEffect } from 'react';
import { Hotspot, HotspotType, HotspotPosition } from '@/types/cms';
import { getHotspots, upsertHotspot, deleteHotspot } from '@/app/actions/cms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Zap, Calendar, ExternalLink, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const TYPE_ICONS = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle
};

const TYPE_COLORS = {
    info: 'bg-blue-900/20 text-blue-400 border-blue-900/30',
    success: 'bg-green-900/20 text-green-400 border-green-900/30',
    warning: 'bg-amber-900/20 text-amber-400 border-amber-900/30',
    error: 'bg-red-900/20 text-red-400 border-red-900/30'
};

export default function HotspotsPage() {
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Partial<Hotspot>>({});

    const loadData = async () => {
        setLoading(true);
        const res = await getHotspots();
        if (res.success) setHotspots(res.data || []);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const handleSave = async () => {
        if (!editingItem.title || !editingItem.message) return toast.error("Required fields missing");
        await upsertHotspot(editingItem);
        setIsEditOpen(false);
        setEditingItem({});
        loadData();
        toast.success("Hotspot saved");
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this hotspot?")) {
            await deleteHotspot(id);
            loadData();
            toast.success("Hotspot deleted");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Hotspots & Banners</h1>
                    <p className="text-zinc-500 text-sm">Manage announcements and alerts.</p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => { setEditingItem({ type: 'info', position: 'top-banner', status: 'active', priority: 1, validity: { start: new Date().toISOString().split('T')[0], alwaysActive: true } }); setIsEditOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Create Hotspot
                </Button>
            </div>

            <div className="space-y-4">
                {hotspots.map(spot => {
                    const Icon = TYPE_ICONS[spot.type];
                    return (
                        <Card key={spot.id} className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-4 flex items-start gap-4">
                                <div className={`p-3 rounded-lg border ${TYPE_COLORS[spot.type]}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{spot.title}</h3>
                                            <p className="text-zinc-400 text-sm mt-1">{spot.message}</p>
                                        </div>
                                        <Badge variant="outline" className="border-zinc-700 text-zinc-400">{spot.position}</Badge>
                                    </div>

                                    <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
                                        <span className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded border border-zinc-800"><Calendar className="h-3 w-3" /> {spot.validity.alwaysActive ? 'Always Active' : `${spot.validity.start} - ${spot.validity.end}`}</span>
                                        {spot.link && <span className="flex items-center gap-1 text-teal-400"><ExternalLink className="h-3 w-3" /> {spot.link.buttonText} ({spot.link.url})</span>}
                                        <Badge variant={spot.status === 'active' ? 'secondary' : 'destructive'} className="ml-auto">{spot.status}</Badge>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingItem(spot); setIsEditOpen(true); }}><Edit2 className="h-4 w-4 text-zinc-400" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(spot.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* EDIT MODAL */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
                    <DialogHeader><DialogTitle>{editingItem.id ? 'Edit Hotspot' : 'Create Hotspot'}</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>Title *</Label>
                            <Input value={editingItem.title || ''} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} className="bg-zinc-950 border-zinc-800" />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Message *</Label>
                            <Textarea value={editingItem.message || ''} onChange={e => setEditingItem({ ...editingItem, message: e.target.value })} className="bg-zinc-950 border-zinc-800" />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={editingItem.type} onValueChange={(v) => setEditingItem({ ...editingItem, type: v as HotspotType })}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="info">Info (Blue)</SelectItem>
                                    <SelectItem value="success">Success (Green)</SelectItem>
                                    <SelectItem value="warning">Warning (Yellow)</SelectItem>
                                    <SelectItem value="error">Error/Alert (Red)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Position</Label>
                            <Select value={editingItem.position} onValueChange={(v) => setEditingItem({ ...editingItem, position: v as HotspotPosition })}>
                                <SelectTrigger className="bg-zinc-950 border-zinc-800"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectItem value="top-banner">Top Banner</SelectItem>
                                    <SelectItem value="homepage-only">Homepage Only</SelectItem>
                                    <SelectItem value="popup">Popup Modal</SelectItem>
                                    <SelectItem value="bottom-notification">Bottom Notification</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-2 p-4 bg-zinc-950 rounded-lg border border-zinc-800 space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Link (Optional)</Label>
                            </div>
                            <div className="flex gap-2">
                                <Input placeholder="URL" value={editingItem.link?.url || ''} onChange={e => setEditingItem({ ...editingItem, link: { ...editingItem.link!, url: e.target.value } })} className="bg-zinc-900 border-zinc-800" />
                                <Input placeholder="Button Text" value={editingItem.link?.buttonText || ''} onChange={e => setEditingItem({ ...editingItem, link: { ...editingItem.link!, buttonText: e.target.value } })} className="bg-zinc-900 border-zinc-800" />
                            </div>
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label>Validity</Label>
                            <div className="flex gap-4 items-center">
                                <Input type="date" value={editingItem.validity?.start || ''} onChange={e => setEditingItem({ ...editingItem, validity: { ...editingItem.validity!, start: e.target.value } })} className="bg-zinc-950 border-zinc-800" />
                                <span className="text-zinc-500">to</span>
                                <Input type="date" value={editingItem.validity?.end || ''} onChange={e => setEditingItem({ ...editingItem, validity: { ...editingItem.validity!, end: e.target.value } })} className="bg-zinc-950 border-zinc-800" disabled={editingItem.validity?.alwaysActive} />
                                <div className="flex items-center space-x-2">
                                    <Switch checked={editingItem.validity?.alwaysActive} onCheckedChange={(c) => setEditingItem({ ...editingItem, validity: { ...editingItem.validity!, alwaysActive: c } })} />
                                    <Label>Always Active</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSave}>Save Hotspot</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
