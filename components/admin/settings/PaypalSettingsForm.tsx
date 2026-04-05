'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff, Save, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getPayPalSettings, updatePayPalSettings, testPayPalConnection } from '@/app/actions/settings';

export default function PaypalSettingsForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    const [enabled, setEnabled] = useState(false);
    const [sandbox, setSandbox] = useState(true);
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getPayPalSettings();
                if (res.success && res.data) {
                    setEnabled(res.data.paypal_enabled === 'true');
                    setSandbox(res.data.paypal_sandbox !== 'false');
                    setClientId(res.data.paypal_client_id || '');
                }
            } catch {
                toast.error('Failed to load PayPal settings');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (enabled && !clientId.trim()) {
            toast.error('Client ID is required when PayPal is enabled');
            return;
        }
        setSaving(true);
        setTestResult(null);
        try {
            const secretToSave = clientSecret.includes('***') || !clientSecret ? null : clientSecret;
            const res = await updatePayPalSettings({ clientId, clientSecret: secretToSave, enabled, sandbox });
            if (res.success) {
                toast.success('PayPal settings saved');
                setClientSecret('');
            } else {
                toast.error(res.error || 'Save failed');
            }
        } catch {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const res = await testPayPalConnection();
            if (res.success) {
                setTestResult({ success: true, message: 'Connection successful! PayPal is working.' });
                toast.success('PayPal test passed');
            } else {
                setTestResult({ success: false, message: res.error || 'Connection failed' });
                toast.error('PayPal test failed');
            }
        } catch {
            setTestResult({ success: false, message: 'Connection test failed' });
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-8 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#003087]/10 rounded-lg">
                            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.217a.641.641 0 0 1 .632-.544h7.051c2.547 0 4.326.593 5.29 1.763.922 1.114.93 2.567.024 4.319-.055.107-.112.213-.171.317C16.52 11.22 14.5 12.5 11.5 12.5H9.258a.641.641 0 0 0-.632.541l-.836 5.312-.714 2.984z" fill="#003087"/>
                                <path d="M19.746 6.5c.07.457.07.94-.007 1.455-.883 5.538-4.762 7.545-9.464 7.545H8.2L7.05 21.337h4.606a.641.641 0 0 0 .633-.541l.026-.135.512-3.247.033-.178a.641.641 0 0 1 .632-.542h.398c3.586 0 6.395-1.458 7.212-5.674.343-1.763.165-3.232-.556-4.27z" fill="#009cde"/>
                            </svg>
                        </div>
                        <div>
                            <CardTitle className="text-xl">PayPal Configuration</CardTitle>
                            <CardDescription>Configure PayPal to accept payments</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg">
                        <Label htmlFor="paypal-toggle" className="text-sm font-medium">Enable</Label>
                        <Switch
                            id="paypal-toggle"
                            checked={enabled}
                            onCheckedChange={setEnabled}
                            className="data-[state=checked]:bg-teal-600"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Status Banner */}
                    <div className={`p-4 rounded-lg border ${enabled ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-center gap-3">
                            {enabled ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-slate-400" />}
                            <div>
                                <p className={`font-medium ${enabled ? 'text-emerald-800' : 'text-slate-600'}`}>
                                    {enabled ? 'PayPal is Active' : 'PayPal is Disabled'}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {enabled ? 'Payments are being accepted via PayPal' : 'Toggle above to enable PayPal payments'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {enabled && (
                        <>
                            {/* Sandbox toggle */}
                            <div className={`p-3 rounded-lg border flex items-center justify-between ${sandbox ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                                <div className="flex items-center gap-2">
                                    {sandbox ? (
                                        <><AlertTriangle className="h-4 w-4 text-amber-600" /><span className="text-sm text-amber-800 font-medium">Sandbox Mode (Testing)</span></>
                                    ) : (
                                        <><CheckCircle className="h-4 w-4 text-blue-600" /><span className="text-sm text-blue-800 font-medium">Live Mode (Production)</span></>
                                    )}
                                </div>
                                <Switch checked={!sandbox} onCheckedChange={(v) => setSandbox(!v)} className="data-[state=checked]:bg-blue-600" />
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="paypalClientId">Client ID</Label>
                                    <Input
                                        id="paypalClientId"
                                        placeholder="AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxX"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                        className="font-mono bg-slate-50 border-slate-200"
                                    />
                                    <p className="text-xs text-slate-500">PayPal Developer Dashboard → My Apps &amp; Credentials</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="paypalSecret">Client Secret</Label>
                                    <div className="relative">
                                        <Input
                                            id="paypalSecret"
                                            type={showSecret ? 'text' : 'password'}
                                            placeholder={clientSecret ? '••••••••••••' : 'Enter Client Secret'}
                                            value={clientSecret}
                                            onChange={(e) => setClientSecret(e.target.value)}
                                            className="font-mono bg-slate-50 border-slate-200 pr-10"
                                        />
                                        <button type="button" onClick={() => setShowSecret(!showSecret)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                <Button type="button" variant="outline" onClick={handleTest} disabled={testing || !clientId}
                                    className="border-slate-200">
                                    {testing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Testing...</> : 'Test Connection'}
                                </Button>
                                {testResult && (
                                    <span className={`text-sm ${testResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {testResult.message}
                                    </span>
                                )}
                            </div>
                        </>
                    )}

                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white min-w-[140px]">
                            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Settings</>}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
