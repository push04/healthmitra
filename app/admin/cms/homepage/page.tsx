'use client';

import { useState, useEffect } from 'react';
import { HomepageSection } from '@/types/cms';
import { getHomepageSections, reorderHomepageSections, updateSectionConfig } from '@/app/actions/cms';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GripVertical, ArrowUp, ArrowDown, Settings, Image } from 'lucide-react';
import { toast } from 'sonner';

export default function HomepagePage() {
    const [sections, setSections] = useState<HomepageSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [configOpen, setConfigOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<HomepageSection | null>(null);

    const loadData = async () => {
        setLoading(true);
        const res = await getHomepageSections();
        if (res.success) setSections(res.data || []);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const moveSection = async (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        if (direction === 'up' && index > 0) {
            [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
        } else if (direction === 'down' && index < newSections.length - 1) {
            [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        }
        setSections(newSections);
        await reorderHomepageSections(newSections.map(s => s.id));
    };

    const handleSaveConfig = async () => {
        if (!activeSection) return;
        await updateSectionConfig(activeSection.id, activeSection.config);
        setConfigOpen(false);
        setActiveSection(null);
        loadData();
        toast.success("Section settings updated");
    };

    return (
        <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Homepage Sections</h1>
                    <p className="text-slate-500 text-sm">Control the layout and content of the homepage.</p>
                </div>
            </div>

            <div className="space-y-4">
                {sections.map((section, index) => (
                    <Card key={section.id} className="bg-white border-slate-200 shadow-sm transition-all hover:border-slate-300">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="cursor-move text-slate-400"><GripVertical className="h-5 w-5" /></div>
                            <div className="h-10 w-10 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-slate-500 font-bold">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 text-lg">{section.name}</h3>
                                <p className="text-xs text-slate-500 font-mono">ID: {section.key}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <Switch checked={section.isActive} />
                                    <span className="text-sm text-slate-500">{section.isActive ? 'Active' : 'Hidden'}</span>
                                </div>
                                <div className="h-6 w-px bg-slate-200" />
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => moveSection(index, 'up')} disabled={index === 0}><ArrowUp className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                                </div>
                                <Button variant="secondary" size="sm" onClick={() => { setActiveSection(section); setConfigOpen(true); }} className="bg-slate-100 text-slate-900 hover:bg-slate-200">
                                    <Settings className="mr-2 h-4 w-4" /> Config
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* CONFIG MODAL */}
            <Dialog open={configOpen} onOpenChange={setConfigOpen}>
                <DialogContent className="bg-white border-slate-200 text-slate-900 sm:max-w-lg">
                    <DialogHeader><DialogTitle>Configure: {activeSection?.name}</DialogTitle></DialogHeader>

                    {activeSection?.key === 'hero' ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Heading</Label>
                                <Input value={activeSection.config.heading || ''} onChange={e => setActiveSection({ ...activeSection, config: { ...activeSection.config, heading: e.target.value } })} className="bg-white border-slate-200 text-slate-900" />
                            </div>
                            <div className="space-y-2">
                                <Label>Subheading</Label>
                                <Input value={activeSection.config.subheading || ''} onChange={e => setActiveSection({ ...activeSection, config: { ...activeSection.config, subheading: e.target.value } })} className="bg-white border-slate-200 text-slate-900" />
                            </div>
                            <div className="p-4 bg-slate-50 rounded border border-slate-200 flex items-center justify-center flex-col gap-2 border-dashed">
                                <Image className="h-8 w-8 text-slate-400" />
                                <span className="text-sm text-slate-500">Upload Background Image</span>
                                <Button size="sm" variant="outline" className="border-slate-300 text-slate-600">Choose File</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-slate-500">
                            No additional configuration available for this section.
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setConfigOpen(false)}>Cancel</Button>
                        <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSaveConfig}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
