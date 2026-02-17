'use client';

import { useState, useEffect } from 'react';
import { getSystemSettings, updateSystemSettings } from '@/app/actions/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import RazorpaySettingsForm from '@/components/admin/settings/RazorpaySettingsForm';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            const res = await getSystemSettings();
            if (res.success && res.data) {
                // Merge with defaults to ensure controlled inputs
                setSettings({
                    site_name: res.data.site_name || '',
                    support_email: res.data.support_email || '',
                    smtp_host: res.data.smtp_host || '',
                    smtp_port: res.data.smtp_port || '',
                    smtp_user: res.data.smtp_user || '',
                    ...res.data
                });
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveGeneral = async () => {
        setSaving(true);
        // Extract only general keys
        const toSave = {
            site_name: settings.site_name,
            support_email: settings.support_email,
            smtp_host: settings.smtp_host,
            smtp_port: settings.smtp_port,
            smtp_user: settings.smtp_user
        };

        const res = await updateSystemSettings(toSave);
        if (res.success) {
            toast.success("General settings saved");
        } else {
            toast.error("Failed to save", { description: res.error });
        }
        setSaving(false);
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in max-w-[1000px] mx-auto p-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">System Settings</h1>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-slate-100 border border-slate-200 text-slate-500">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="payment">Payment Gateways</TabsTrigger>
                    {/* Add more tabs as needed */}
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Basic configuration for the application.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Site Name</Label>
                                <Input value={settings.site_name} onChange={e => handleChange('site_name', e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Support Email</Label>
                                <Input value={settings.support_email} onChange={e => handleChange('support_email', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button onClick={handleSaveGeneral} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save General Settings
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="payment">
                    <RazorpaySettingsForm />
                </TabsContent>

            </Tabs>
        </div>
    );
}
