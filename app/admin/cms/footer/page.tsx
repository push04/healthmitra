'use client';

import { useState, useEffect } from 'react';
import { FooterSection, MOCK_FOOTER } from '@/app/lib/mock/cms-data';
import { getFooter, updateFooter } from '@/app/actions/cms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Save, Loader2, Plus, Trash2, Link as LinkIcon, Facebook, Twitter, Instagram, Linkedin, Youtube, Building, Info, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function FooterPage() {
    const [footer, setFooter] = useState<FooterSection | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            const res = await getFooter();
            if (res.success && res.data) setFooter(res.data);
            setLoading(false);
        };
        load();
    }, []);

    const handleSave = async () => {
        if (!footer) return;
        setSaving(true);
        await updateFooter(footer);
        setSaving(false);
        toast.success("Footer settings updated");
    };

    const updateField = (key: keyof FooterSection, value: any) => {
        if (!footer) return;
        setFooter({ ...footer, [key]: value });
    };

    const updateSocial = (key: string, value: string) => {
        if (!footer) return;
        setFooter({ ...footer, socialLinks: { ...footer.socialLinks, [key]: value } });
    };

    if (loading || !footer) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Footer Content</h1>
                    <p className="text-slate-500 text-sm">Customize site-wide footer information.</p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </div>

            <Tabs defaultValue="company" className="w-full">
                <TabsList className="bg-slate-100 border border-slate-200">
                    <TabsTrigger value="company">Company Info</TabsTrigger>
                    <TabsTrigger value="contact">Contact Details</TabsTrigger>
                    <TabsTrigger value="social">Social Media</TabsTrigger>
                    <TabsTrigger value="links">Quick Links</TabsTrigger>
                </TabsList>

                <TabsContent value="company" className="mt-6 space-y-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Building className="h-5 w-5 text-teal-600" /> General Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Company Name</Label>
                                <Input value={footer.companyName} onChange={e => updateField('companyName', e.target.value)} className="bg-white border-slate-200 text-slate-900" />
                            </div>
                            <div className="space-y-2">
                                <Label>About Text (Footer Blurb)</Label>
                                <Textarea value={footer.aboutText} onChange={e => updateField('aboutText', e.target.value)} className="bg-white border-slate-200 text-slate-900" rows={4} />
                            </div>
                            <div className="space-y-2">
                                <Label>Privacy Policy URL</Label>
                                <Input value={footer.legalLinks.privacyPolicy} onChange={e => setFooter({ ...footer, legalLinks: { ...footer.legalLinks, privacyPolicy: e.target.value } })} className="bg-white border-slate-200 text-slate-900" />
                            </div>
                            <div className="space-y-2">
                                <Label>Terms & Conditions URL</Label>
                                <Input value={footer.legalLinks.termsConditions} onChange={e => setFooter({ ...footer, legalLinks: { ...footer.legalLinks, termsConditions: e.target.value } })} className="bg-white border-slate-200 text-slate-900" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contact" className="mt-6 space-y-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="h-5 w-5 text-teal-600" /> Contact Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input value={footer.phone} onChange={e => updateField('phone', e.target.value)} className="bg-white border-slate-200 text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input value={footer.email} onChange={e => updateField('email', e.target.value)} className="bg-white border-slate-200 text-slate-900" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Physical Address</Label>
                                <Textarea value={footer.address} onChange={e => updateField('address', e.target.value)} className="bg-white border-slate-200 text-slate-900" />
                            </div>
                            <div className="space-y-2">
                                <Label>Working Hours</Label>
                                <Input value={footer.workingHours} onChange={e => updateField('workingHours', e.target.value)} className="bg-white border-slate-200 text-slate-900" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="social" className="mt-6 space-y-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader><CardTitle>Social Media Links</CardTitle><CardDescription>Leave empty to hide icon from footer.</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Facebook className="text-blue-600 h-5 w-5" />
                                <Input placeholder="Facebook URL" value={footer.socialLinks.facebook || ''} onChange={e => updateSocial('facebook', e.target.value)} className="bg-white border-slate-200 text-slate-900" />
                            </div>
                            <div className="flex items-center gap-3">
                                <Instagram className="text-pink-600 h-5 w-5" />
                                <Input placeholder="Instagram URL" value={footer.socialLinks.instagram || ''} onChange={e => updateSocial('instagram', e.target.value)} className="bg-white border-slate-200 text-slate-900" />
                            </div>
                            <div className="flex items-center gap-3">
                                <Twitter className="text-sky-500 h-5 w-5" />
                                <Input placeholder="Twitter URL" value={footer.socialLinks.twitter || ''} onChange={e => updateSocial('twitter', e.target.value)} className="bg-white border-slate-200 text-slate-900" />
                            </div>
                            <div className="flex items-center gap-3">
                                <Linkedin className="text-blue-700 h-5 w-5" />
                                <Input placeholder="LinkedIn URL" value={footer.socialLinks.linkedin || ''} onChange={e => updateSocial('linkedin', e.target.value)} className="bg-white border-slate-200 text-slate-900" />
                            </div>
                            <div className="flex items-center gap-3">
                                <Youtube className="text-red-600 h-5 w-5" />
                                <Input placeholder="YouTube URL" value={footer.socialLinks.youtube || ''} onChange={e => updateSocial('youtube', e.target.value)} className="bg-white border-slate-200 text-slate-900" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="links" className="mt-6 space-y-6">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle>Quick Links</CardTitle>
                            <Button variant="outline" size="sm" onClick={() => setFooter(prev => prev ? ({ ...prev, quickLinks: [...prev.quickLinks, { id: Date.now().toString(), text: 'New Link', url: '/', openInNewTab: false }] }) : null)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Link
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {footer.quickLinks.map((link, idx) => (
                                <div key={link.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded border border-slate-200">
                                    <div className="bg-slate-200 text-slate-600 w-6 h-6 flex items-center justify-center rounded text-xs">{idx + 1}</div>
                                    <Input
                                        value={link.text}
                                        onChange={e => {
                                            const newLinks = [...footer.quickLinks];
                                            newLinks[idx].text = e.target.value;
                                            setFooter({ ...footer, quickLinks: newLinks });
                                        }}
                                        className="bg-white border-slate-200 text-slate-900 flex-1"
                                        placeholder="Link Text"
                                    />
                                    <Input
                                        value={link.url}
                                        onChange={e => {
                                            const newLinks = [...footer.quickLinks];
                                            newLinks[idx].url = e.target.value;
                                            setFooter({ ...footer, quickLinks: newLinks });
                                        }}
                                        className="bg-white border-slate-200 text-slate-900 flex-1 font-mono text-xs"
                                        placeholder="URL"
                                    />
                                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-500 hover:bg-red-50" onClick={() => {
                                        const newLinks = footer.quickLinks.filter((_, i) => i !== idx);
                                        setFooter({ ...footer, quickLinks: newLinks });
                                    }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
