'use client';

import { useState, useEffect } from 'react';
import { getSystemSettings, updateSystemSettings } from '@/app/actions/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSystemSettings().then(res => {
            if (res.success) setSettings(res.data);
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        await updateSystemSettings(settings);
        toast.success("Settings saved successfully");
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 animate-in fade-in max-w-[1000px] mx-auto p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">System Settings</h1>
                <Button className="bg-slate-900 text-white hover:bg-slate-800" onClick={handleSave}>Save Changes</Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-slate-100 border border-slate-200 text-slate-500">
                    <TabsTrigger value="general" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">General</TabsTrigger>
                    <TabsTrigger value="email" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Email</TabsTrigger>
                    <TabsTrigger value="payment" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Payment</TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader><CardTitle className="text-slate-900">Company Information</CardTitle><CardDescription className="text-slate-500">Public facing details</CardDescription></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Company Name</Label><Input value={settings.general.companyName} onChange={e => setSettings({ ...settings, general: { ...settings.general, companyName: e.target.value } })} className="bg-white border-slate-200 text-slate-900" /></div>
                                <div className="space-y-2"><Label>Support Email</Label><Input value={settings.general.supportEmail} onChange={e => setSettings({ ...settings, general: { ...settings.general, supportEmail: e.target.value } })} className="bg-white border-slate-200 text-slate-900" /></div>
                                <div className="space-y-2"><Label>Currency</Label><Input value={settings.general.currency} disabled className="bg-slate-50 border-slate-200 text-slate-500" /></div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="email">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader><CardTitle className="text-slate-900">SMTP Configuration</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>SMTP Host</Label><Input value={settings.email.smtpHost} className="bg-white border-slate-200 text-slate-900" /></div>
                                <div className="space-y-2"><Label>Port</Label><Input value={settings.email.smtpPort} className="bg-white border-slate-200 text-slate-900" /></div>
                                <div className="space-y-2"><Label>From Email</Label><Input value={settings.email.fromEmail} className="bg-white border-slate-200 text-slate-900" /></div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="payment">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader><CardTitle className="text-slate-900">Payment Gateway</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2"><Label>Razorpay Key ID</Label><Input value={settings.payment.razorpayKey} className="bg-white border-slate-200 text-slate-900" type="password" /></div>
                            <div className="flex items-center space-x-2">
                                <Switch checked={settings.payment.mode === 'test'} />
                                <Label>Test Mode</Label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card className="bg-white border-slate-200 shadow-sm">
                        <CardHeader><CardTitle className="text-slate-900">Security Policies</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2"><Label>Min Password Length</Label><Input type="number" value={settings.security.passwordMinLength} className="bg-white border-slate-200 text-slate-900" /></div>
                            <div className="flex items-center space-x-2">
                                <Switch checked={settings.security.mfaEnabled} />
                                <Label>Enforce MFA for Admins</Label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
