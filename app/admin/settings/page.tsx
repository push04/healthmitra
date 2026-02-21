'use client';

import { useState, useEffect } from 'react';
import { getSystemSettings, updateSystemSettings } from '@/app/actions/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import RazorpaySettingsForm from '@/components/admin/settings/RazorpaySettingsForm';
import { Loader2, Save, Settings, CreditCard, Mail, Phone, Globe, Shield, Users, Wallet, AlertCircle } from 'lucide-react';

interface SystemSettings {
    [key: string]: string;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SystemSettings>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    useEffect(() => {
        const load = async () => {
            const res = await getSystemSettings();
            if (res.success && res.data) {
                setSettings(res.data);
            }
            setLoading(false);
        };
        load();
    }, []);

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (keys: string[]) => {
        setSaving(true);
        const toSave: SystemSettings = {};
        keys.forEach(key => {
            toSave[key] = settings[key] || '';
        });

        const res = await updateSystemSettings(toSave);
        if (res.success) {
            toast.success("Settings saved successfully");
        } else {
            toast.error("Failed to save", { description: res.error });
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="p-10 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in max-w-[1200px] mx-auto p-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 rounded-lg">
                    <Settings className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
                    <p className="text-slate-500">Configure all application settings from one place</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-slate-100 border border-slate-200 p-1 flex flex-wrap h-auto">
                    <TabsTrigger value="general" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                        <Settings className="w-4 h-4 mr-2" /> General
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                        <Phone className="w-4 h-4 mr-2" /> Contact & Social
                    </TabsTrigger>
                    <TabsTrigger value="email" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                        <Mail className="w-4 h-4 mr-2" /> Email (SMTP)
                    </TabsTrigger>
                    <TabsTrigger value="payment" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                        <CreditCard className="w-4 h-4 mr-2" /> Payments
                    </TabsTrigger>
                    <TabsTrigger value="plans" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                        <Shield className="w-4 h-4 mr-2" /> Plans Config
                    </TabsTrigger>
                    <TabsTrigger value="wallet" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                        <Wallet className="w-4 h-4 mr-2" /> Wallet
                    </TabsTrigger>
                    <TabsTrigger value="features" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                        <Globe className="w-4 h-4 mr-2" /> Features
                    </TabsTrigger>
                </TabsList>

                {/* GENERAL SETTINGS */}
                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Information</CardTitle>
                            <CardDescription>Basic website configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Site Name</Label>
                                    <Input 
                                        value={settings.site_name || ''} 
                                        onChange={(e) => handleChange('site_name', e.target.value)}
                                        placeholder="HealthMitra"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Site Tagline</Label>
                                    <Input 
                                        value={settings.site_tagline || ''} 
                                        onChange={(e) => handleChange('site_tagline', e.target.value)}
                                        placeholder="Your Trusted Healthcare Partner"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Timezone</Label>
                                    <Input 
                                        value={settings.timezone || 'Asia/Kolkata'} 
                                        onChange={(e) => handleChange('timezone', e.target.value)}
                                        placeholder="Asia/Kolkata"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date Format</Label>
                                    <Input 
                                        value={settings.date_format || 'DD/MM/YYYY'} 
                                        onChange={(e) => handleChange('date_format', e.target.value)}
                                        placeholder="DD/MM/YYYY"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button onClick={() => handleSave(['site_name', 'site_tagline', 'timezone', 'date_format'])} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" /> Save General Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CONTACT SETTINGS */}
                <TabsContent value="contact">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>How customers can reach you</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Support Email</Label>
                                    <Input 
                                        value={settings.support_email || ''} 
                                        onChange={(e) => handleChange('support_email', e.target.value)}
                                        placeholder="support@healthmitra.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Support Phone (Toll Free)</Label>
                                    <Input 
                                        value={settings.support_phone || ''} 
                                        onChange={(e) => handleChange('support_phone', e.target.value)}
                                        placeholder="1800-123-4567"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Emergency Hotline</Label>
                                    <Input 
                                        value={settings.emergency_hotline || ''} 
                                        onChange={(e) => handleChange('emergency_hotline', e.target.value)}
                                        placeholder="102"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>WhatsApp Number</Label>
                                    <Input 
                                        value={settings.whatsapp_number || ''} 
                                        onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                                        placeholder="919876543210"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Address</Label>
                                    <Textarea 
                                        value={settings.contact_address || ''} 
                                        onChange={(e) => handleChange('contact_address', e.target.value)}
                                        placeholder="123 Healthcare Ave, Mumbai, India"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-6 mt-6">
                                <h3 className="font-semibold mb-4">Social Media Links</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Facebook URL</Label>
                                        <Input 
                                            value={settings.facebook_url || ''} 
                                            onChange={(e) => handleChange('facebook_url', e.target.value)}
                                            placeholder="https://facebook.com/healthmitra"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Twitter URL</Label>
                                        <Input 
                                            value={settings.twitter_url || ''} 
                                            onChange={(e) => handleChange('twitter_url', e.target.value)}
                                            placeholder="https://twitter.com/healthmitra"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Instagram URL</Label>
                                        <Input 
                                            value={settings.instagram_url || ''} 
                                            onChange={(e) => handleChange('instagram_url', e.target.value)}
                                            placeholder="https://instagram.com/healthmitra"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>YouTube URL</Label>
                                        <Input 
                                            value={settings.youtube_url || ''} 
                                            onChange={(e) => handleChange('youtube_url', e.target.value)}
                                            placeholder="https://youtube.com/healthmitra"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={() => handleSave([
                                    'support_email', 'support_phone', 'emergency_hotline', 'whatsapp_number', 
                                    'contact_address', 'facebook_url', 'twitter_url', 'instagram_url', 'youtube_url'
                                ])} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" /> Save Contact Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* EMAIL SETTINGS */}
                <TabsContent value="email">
                    <Card>
                        <CardHeader>
                            <CardTitle>SMTP Configuration</CardTitle>
                            <CardDescription>Email server settings for sending emails</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>SMTP Host</Label>
                                    <Input 
                                        value={settings.smtp_host || ''} 
                                        onChange={(e) => handleChange('smtp_host', e.target.value)}
                                        placeholder="smtp.gmail.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>SMTP Port</Label>
                                    <Input 
                                        value={settings.smtp_port || ''} 
                                        onChange={(e) => handleChange('smtp_port', e.target.value)}
                                        placeholder="587"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>SMTP Username</Label>
                                    <Input 
                                        value={settings.smtp_user || ''} 
                                        onChange={(e) => handleChange('smtp_user', e.target.value)}
                                        placeholder="your-email@gmail.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>SMTP Password</Label>
                                    <Input 
                                        type="password"
                                        value={settings.smtp_password || ''} 
                                        onChange={(e) => handleChange('smtp_password', e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>From Name</Label>
                                    <Input 
                                        value={settings.email_from_name || ''} 
                                        onChange={(e) => handleChange('email_from_name', e.target.value)}
                                        placeholder="HealthMitra"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>From Email</Label>
                                    <Input 
                                        value={settings.email_from_address || ''} 
                                        onChange={(e) => handleChange('email_from_address', e.target.value)}
                                        placeholder="noreply@healthmitra.com"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button onClick={() => handleSave([
                                    'smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 
                                    'email_from_name', 'email_from_address'
                                ])} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" /> Save Email Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PAYMENT SETTINGS */}
                <TabsContent value="payment">
                    <RazorpaySettingsForm />
                </TabsContent>

                {/* PLANS CONFIG */}
                <TabsContent value="plans">
                    <Card>
                        <CardHeader>
                            <CardTitle>Plan Configuration</CardTitle>
                            <CardDescription>Configure default values for health plans</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Default Plan Validity (days)</Label>
                                    <Input 
                                        type="number"
                                        value={settings.default_plan_validity || '365'} 
                                        onChange={(e) => handleChange('default_plan_validity', e.target.value)}
                                        placeholder="365"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Referral Bonus Amount (₹)</Label>
                                    <Input 
                                        type="number"
                                        value={settings.referral_bonus || '500'} 
                                        onChange={(e) => handleChange('referral_bonus', e.target.value)}
                                        placeholder="500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Referral Discount (%)</Label>
                                    <Input 
                                        type="number"
                                        value={settings.referral_discount || '10'} 
                                        onChange={(e) => handleChange('referral_discount', e.target.value)}
                                        placeholder="10"
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-6 mt-6">
                                <h3 className="font-semibold mb-4">Family Member Limits</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Basic Plan</Label>
                                        <Input 
                                            type="number"
                                            value={settings.max_family_members_basic || '2'} 
                                            onChange={(e) => handleChange('max_family_members_basic', e.target.value)}
                                            placeholder="2"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Family Plan</Label>
                                        <Input 
                                            type="number"
                                            value={settings.max_family_members_family || '4'} 
                                            onChange={(e) => handleChange('max_family_members_family', e.target.value)}
                                            placeholder="4"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Premium Plan</Label>
                                        <Input 
                                            type="number"
                                            value={settings.max_family_members_premium || '6'} 
                                            onChange={(e) => handleChange('max_family_members_premium', e.target.value)}
                                            placeholder="6"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6 mt-6">
                                <h3 className="font-semibold mb-4">OPD Consultation Limits</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Basic Plan</Label>
                                        <Input 
                                            value={settings.opd_consultation_limit_basic || '12'} 
                                            onChange={(e) => handleChange('opd_consultation_limit_basic', e.target.value)}
                                            placeholder="12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Family Plan</Label>
                                        <Input 
                                            value={settings.opd_consultation_limit_family || '24'} 
                                            onChange={(e) => handleChange('opd_consultation_limit_family', e.target.value)}
                                            placeholder="24"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Premium Plan</Label>
                                        <Input 
                                            value={settings.opd_consultation_limit_premium || 'Unlimited'} 
                                            onChange={(e) => handleChange('opd_consultation_limit_premium', e.target.value)}
                                            placeholder="Unlimited"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-6 mt-6">
                                <h3 className="font-semibold mb-4">Medicine Discounts (%)</h3>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Basic Plan (%)</Label>
                                        <Input 
                                            type="number"
                                            value={settings.medicine_discount_basic || '10'} 
                                            onChange={(e) => handleChange('medicine_discount_basic', e.target.value)}
                                            placeholder="10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Family Plan (%)</Label>
                                        <Input 
                                            type="number"
                                            value={settings.medicine_discount_family || '15'} 
                                            onChange={(e) => handleChange('medicine_discount_family', e.target.value)}
                                            placeholder="15"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Premium Plan (%)</Label>
                                        <Input 
                                            type="number"
                                            value={settings.medicine_discount_premium || '20'} 
                                            onChange={(e) => handleChange('medicine_discount_premium', e.target.value)}
                                            placeholder="20"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={() => handleSave([
                                    'default_plan_validity', 'referral_bonus', 'referral_discount',
                                    'max_family_members_basic', 'max_family_members_family', 'max_family_members_premium',
                                    'opd_consultation_limit_basic', 'opd_consultation_limit_family', 'opd_consultation_limit_premium',
                                    'medicine_discount_basic', 'medicine_discount_family', 'medicine_discount_premium'
                                ])} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" /> Save Plan Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* WALLET SETTINGS */}
                <TabsContent value="wallet">
                    <Card>
                        <CardHeader>
                            <CardTitle>Wallet Configuration</CardTitle>
                            <CardDescription>Configure wallet and withdrawal settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Minimum Withdrawal (₹)</Label>
                                    <Input 
                                        type="number"
                                        value={settings.min_withdrawal_amount || '500'} 
                                        onChange={(e) => handleChange('min_withdrawal_amount', e.target.value)}
                                        placeholder="500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Maximum Withdrawal (₹)</Label>
                                    <Input 
                                        type="number"
                                        value={settings.max_withdrawal_amount || '50000'} 
                                        onChange={(e) => handleChange('max_withdrawal_amount', e.target.value)}
                                        placeholder="50000"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button onClick={() => handleSave(['min_withdrawal_amount', 'max_withdrawal_amount'])} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" /> Save Wallet Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FEATURES SETTINGS */}
                <TabsContent value="features">
                    <Card>
                        <CardHeader>
                            <CardTitle>Feature Toggles</CardTitle>
                            <CardDescription>Enable or disable various features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-slate-600" />
                                    <div>
                                        <p className="font-medium">User Registration</p>
                                        <p className="text-sm text-slate-500">Allow new users to register</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={settings.enable_registration === 'true'}
                                    onCheckedChange={(checked) => handleChange('enable_registration', checked ? 'true' : 'false')}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Globe className="h-5 w-5 text-slate-600" />
                                    <div>
                                        <p className="font-medium">Referral System</p>
                                        <p className="text-sm text-slate-500">Enable referral program</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={settings.enable_referral === 'true'}
                                    onCheckedChange={(checked) => handleChange('enable_referral', checked ? 'true' : 'false')}
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="h-5 w-5 text-slate-600" />
                                    <div>
                                        <p className="font-medium">Maintenance Mode</p>
                                        <p className="text-sm text-slate-500">Put website in maintenance mode</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={settings.maintenance_mode === 'true'}
                                    onCheckedChange={(checked) => handleChange('maintenance_mode', checked ? 'true' : 'false')}
                                />
                            </div>

                            {settings.maintenance_mode === 'true' && (
                                <div className="space-y-2">
                                    <Label>Maintenance Message</Label>
                                    <Textarea 
                                        value={settings.maintenance_message || ''} 
                                        onChange={(e) => handleChange('maintenance_message', e.target.value)}
                                        placeholder="We are under maintenance..."
                                        rows={3}
                                    />
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <Button onClick={() => handleSave([
                                    'enable_registration', 'enable_referral', 'maintenance_mode', 'maintenance_message'
                                ])} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Save className="mr-2 h-4 w-4" /> Save Features
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
