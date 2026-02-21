'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff, Save, Loader2, CreditCard, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getPaymentSettings, updatePaymentSettings, getRazorpayStatus } from '@/app/actions/settings';

export default function RazorpaySettingsForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [enabled, setEnabled] = useState(false);
    const [keyId, setKeyId] = useState('');
    const [keySecret, setKeySecret] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');
    const [testMode, setTestMode] = useState(true);

    // UI State
    const [showSecret, setShowSecret] = useState(false);
    const [showWebhook, setShowWebhook] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            setLoading(true);
            try {
                const res = await getPaymentSettings();
                if (res.success && res.data) {
                    setEnabled(res.data.razorpay_enabled === 'true');
                    setKeyId(res.data.razorpay_key_id || '');
                    setWebhookSecret(res.data.razorpay_webhook_secret || '');
                    
                    // Check if in test mode (key starts with rzp_test)
                    if (res.data.razorpay_key_id?.startsWith('rzp_test')) {
                        setTestMode(true);
                    } else if (res.data.razorpay_key_id?.startsWith('rzp_live')) {
                        setTestMode(false);
                    }
                }
            } catch (error) {
                console.error("Load error", error);
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setTestResult(null);

        try {
            // Validate
        if (enabled && !keyId.trim()) {
                toast.error("Key ID is required when Razorpay is enabled");
                setSaving(false);
                return;
            }

            // Validate key format
            if (enabled && !keyId.startsWith('rzp_')) {
                toast.error("Key ID must start with 'rzp_'");
                setSaving(false);
                return;
            }

            const secretToSave = keySecret.includes('***') || !keySecret ? null : keySecret;
            const webhookToSave = webhookSecret.includes('***') || !webhookSecret ? null : webhookSecret;

            const res = await updatePaymentSettings({
                keyId,
                keySecret: secretToSave,
                webhookSecret: webhookToSave,
                enabled: enabled
            });

            if (res.success) {
                toast.success("Settings Saved", { description: "Razorpay configuration updated successfully." });
                setKeySecret(''); // Clear after save
            } else {
                toast.error("Save Failed", { description: res.error });
            }
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    const testConnection = async () => {
        if (!enabled || !keyId) {
            toast.error("Enable Razorpay and add Key ID first");
            return;
        }

        setTesting(true);
        setTestResult(null);

        try {
            const res = await getRazorpayStatus();
            if (res.success) {
                setTestResult({ success: true, message: "Connection successful! Razorpay is working." });
                toast.success("Test successful");
            } else {
                setTestResult({ success: false, message: res.error || "Connection failed" });
                toast.error("Test failed");
            }
        } catch (error) {
            setTestResult({ success: false, message: "Connection test failed" });
            toast.error("Test failed");
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
                        <div className="p-2 bg-[#3399cc]/10 rounded-lg">
                            <CreditCard className="h-6 w-6 text-[#3399cc]" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Razorpay Configuration</CardTitle>
                            <CardDescription>Configure Razorpay to accept payments</CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg">
                        <Label htmlFor="razorpay-toggle" className="text-sm font-medium">Enable</Label>
                        <Switch
                            id="razorpay-toggle"
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
                    <div className={`p-4 rounded-lg border ${
                        enabled 
                            ? 'bg-emerald-50 border-emerald-200' 
                            : 'bg-slate-50 border-slate-200'
                    }`}>
                        <div className="flex items-center gap-3">
                            {enabled ? (
                                <CheckCircle className="h-5 w-5 text-emerald-600" />
                            ) : (
                                <XCircle className="h-5 w-5 text-slate-400" />
                            )}
                            <div>
                                <p className={`font-medium ${enabled ? 'text-emerald-800' : 'text-slate-600'}`}>
                                    {enabled ? 'Razorpay is Active' : 'Razorpay is Disabled'}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {enabled 
                                        ? 'Payments are currently being accepted'
                                        : 'Toggle above to enable payment processing'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    {enabled && (
                        <>
                            {/* Test Mode Indicator */}
                            <div className={`p-3 rounded-lg border ${
                                testMode 
                                    ? 'bg-amber-50 border-amber-200' 
                                    : 'bg-blue-50 border-blue-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {testMode ? (
                                        <>
                                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                                            <span className="text-sm text-amber-800 font-medium">
                                                Test Mode Active - Using test keys (rzp_test_xxx)
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm text-blue-800 font-medium">
                                                Live Mode - Using production keys (rzp_live_xxx)
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* API Credentials */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="keyId">Key ID</Label>
                                    <Input
                                        id="keyId"
                                        placeholder="rzp_test_xxxxxxxxxxxxxx"
                                        value={keyId}
                                        onChange={(e) => setKeyId(e.target.value)}
                                        className="font-mono bg-slate-50 border-slate-200"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Available in Razorpay Dashboard → Settings → API Keys
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="keySecret">Key Secret</Label>
                                    <div className="relative">
                                        <Input
                                            id="keySecret"
                                            type={showSecret ? "text" : "password"}
                                            placeholder={keySecret ? "••••••••••••" : "Enter Key Secret"}
                                            value={keySecret}
                                            onChange={(e) => setKeySecret(e.target.value)}
                                            className="font-mono bg-slate-50 border-slate-200 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSecret(!showSecret)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="webhookSecret">Webhook Secret (Optional)</Label>
                                    <div className="relative">
                                        <Input
                                            id="webhookSecret"
                                            type={showWebhook ? "text" : "password"}
                                            placeholder={webhookSecret ? "••••••••••••" : "Enter Webhook Secret"}
                                            value={webhookSecret}
                                            onChange={(e) => setWebhookSecret(e.target.value)}
                                            className="font-mono bg-slate-50 border-slate-200 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowWebhook(!showWebhook)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showWebhook ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Get from Razorpay Dashboard → Settings → Webhooks
                                    </p>
                                </div>
                            </div>

                            {/* Test Connection */}
                            <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={testConnection}
                                    disabled={testing || !keyId}
                                    className="border-slate-200"
                                >
                                    {testing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...
                                        </>
                                    ) : (
                                        'Test Connection'
                                    )}
                                </Button>
                                {testResult && (
                                    <span className={`text-sm ${testResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {testResult.message}
                                    </span>
                                )}
                            </div>
                        </>
                    )}

                    {/* Save Button */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <Button 
                            type="submit" 
                            disabled={saving} 
                            className="bg-teal-600 hover:bg-teal-700 text-white min-w-[140px]"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Save Settings
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
