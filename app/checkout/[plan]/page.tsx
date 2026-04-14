'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Shield, Loader2, ArrowLeft, AlertCircle, Star, Lock, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { loadRazorpay } from '@/lib/razorpay';
import { toast } from 'sonner';

interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    duration_days: number;
    features: string[];
    is_active: boolean;
    is_featured: boolean;
    coverage_amount?: number;
}

export default function CheckoutPage({ params }: { params: Promise<{ plan: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const supabase = createClient();
    const paypalContainerRef = useRef<HTMLDivElement>(null);

    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [razorpaySettings, setRazorpaySettings] = useState({ enabled: false, keyId: '' });
    const [paypalSettings, setPaypalSettings] = useState({ enabled: false, clientId: '', sandbox: false });
    const [user, setUser] = useState<any>(null);
    const paypalRendered = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push('/login?redirect=/checkout'); return; }
            setUser(user);

            const [settingsRes, paypalRes, planRes] = await Promise.all([
                fetch('/api/settings/razorpay'),
                fetch('/api/settings/paypal'),
                fetch(`/api/plans/${resolvedParams.plan}`),
            ]);
            const [settingsData, paypalData, planData] = await Promise.all([
                settingsRes.json(), paypalRes.json(), planRes.json(),
            ]);

            if (settingsData.success) setRazorpaySettings(settingsData.data);
            if (paypalData.success) setPaypalSettings(paypalData.data);

            if (planData.success) {
                setPlan(planData.data);
            } else {
                toast.error('Plan not found');
                router.push('/shop/plans');
            }
            setLoading(false);
        };
        fetchData();
    }, [resolvedParams.plan, router, supabase]);

    useEffect(() => {
        if (!plan || !paypalSettings.enabled || !paypalSettings.clientId || paypalRendered.current) return;
        if (!paypalContainerRef.current) return;

        paypalRendered.current = true;
        const gst = Math.round(plan.price * 0.18);
        const total = plan.price + gst;

        const scriptId = 'paypal-sdk';
        const existing = document.getElementById(scriptId);
        if (existing) existing.remove();

        const sdkBase = paypalSettings.sandbox ? 'https://www.sandbox.paypal.com' : 'https://www.paypal.com';
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `${sdkBase}/sdk/js?client-id=${paypalSettings.clientId}&currency=USD&components=buttons`;
        script.async = true;
        script.onload = () => {
            if (!paypalContainerRef.current || !(window as any).paypal) return;
            (window as any).paypal.Buttons({
                style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 45 },
                createOrder: async () => {
                    const res = await fetch('/api/paypal/create-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ planId: plan.id, amount: total }),
                    });
                    const data = await res.json();
                    if (!data.success) throw new Error(data.error || 'Failed to create order');
                    return data.data.orderId;
                },
                onApprove: async (data: any) => {
                    setProcessing(true);
                    try {
                        const res = await fetch('/api/paypal/capture-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ paypalOrderId: data.orderID, planId: plan.id }),
                        });
                        const result = await res.json();
                        if (result.success) {
                            router.push(`/checkout/success?data=${encodeURIComponent(JSON.stringify(result.data))}`);
                        } else {
                            toast.error(result.error || 'Payment capture failed');
                        }
                    } catch {
                        toast.error('Payment failed');
                    } finally {
                        setProcessing(false);
                    }
                },
                onError: (err: any) => {
                    console.error('PayPal error:', err);
                    toast.error('PayPal payment failed');
                },
                onCancel: () => toast.info('Payment cancelled'),
            }).render(paypalContainerRef.current);
        };
        document.body.appendChild(script);
    }, [plan, paypalSettings, router]);

    const handleTestPayment = async () => {
        if (!plan || !user) return;
        setProcessing(true);
        try {
            const response = await fetch('/api/checkout/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: plan.id, paymentMethod: 'test' }),
            });
            const result = await response.json();
            if (result.success) {
                router.push(`/checkout/success?data=${encodeURIComponent(JSON.stringify(result.data))}`);
            } else {
                toast.error(result.error || 'Purchase failed');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setProcessing(false);
        }
    };

    const handleRazorpayPayment = async () => {
        if (!plan || !user || !razorpaySettings.enabled) return;
        setProcessing(true);
        try {
            const orderRes = await fetch('/api/checkout/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: plan.id, amount: plan.price }),
            });
            const orderData = await orderRes.json();
            if (!orderData.success) {
                toast.error(orderData.error || 'Failed to create order');
                setProcessing(false);
                return;
            }
            const razorpay = await loadRazorpay(orderData.data.keyId);
            razorpay.open({
                key: orderData.data.keyId,
                amount: orderData.data.amount,
                currency: orderData.data.currency,
                name: 'HealthMitra',
                description: `${plan.name} — Plan Purchase`,
                order_id: orderData.data.orderId,
                handler: async (response: any) => {
                    const verifyRes = await fetch('/api/checkout/purchase', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            planId: plan.id,
                            paymentMethod: 'razorpay',
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                        }),
                    });
                    const r = await verifyRes.json();
                    if (r.success) {
                        router.push(`/checkout/success?data=${encodeURIComponent(JSON.stringify(r.data))}`);
                    } else {
                        toast.error(r.error || 'Payment verification failed');
                    }
                },
                prefill: { name: user.email?.split('@')[0] || '', email: user.email || '' },
                theme: { color: '#0891b2' },
            });
        } catch {
            toast.error('Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
                    <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">Loading checkout...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!plan) return null;

    const gst = Math.round(plan.price * 0.18);
    const total = plan.price + gst;
    const anyLivePayment = razorpaySettings.enabled || paypalSettings.enabled;

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-white py-8 px-4 md:px-6">
                <div className="max-w-5xl mx-auto">

                    {/* Back */}
                    <button onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 hover:text-primary mb-6 transition-colors text-sm font-medium group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Plans
                    </button>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">Secure Checkout</h1>
                        <p className="text-slate-500 mt-1">Complete your purchase securely</p>
                    </div>

                    <div className="grid lg:grid-cols-5 gap-8">

                        {/* Order Summary — 3 cols */}
                        <div className="lg:col-span-3 space-y-4">

                            {/* Plan Card */}
                            <Card className="border border-slate-200 shadow-sm overflow-hidden">
                                <div className="h-1.5 bg-gradient-to-r from-primary to-cyan-400" />
                                <CardHeader className="pb-3 pt-5">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg text-slate-800">Your Plan</CardTitle>
                                        {plan.is_featured && (
                                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                                                <Star className="w-3 h-3 mr-1 fill-amber-500" /> Popular
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                            <Shield className="w-7 h-7 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                                            <p className="text-slate-500 text-sm mt-0.5">{plan.description}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5">
                                                    {plan.duration_days} days
                                                </Badge>
                                                {plan.coverage_amount && (
                                                    <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700 bg-emerald-50">
                                                        ${Number(plan.coverage_amount).toLocaleString()} cover
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-2xl font-bold text-slate-900">${Number(plan.price || 0).toLocaleString()}</p>
                                            <p className="text-xs text-slate-400">base price</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Features */}
                            {(plan.features || []).length > 0 && (
                                <Card className="border border-slate-200 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base text-slate-800">What&apos;s Included</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {(plan.features || []).slice(0, 8).map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2.5 text-sm text-slate-600 py-1">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                    </div>
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Price Breakdown */}
                            <Card className="border border-slate-200 shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base text-slate-800">Price Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Base Price</span>
                                        <span className="text-slate-800 font-medium">${Number(plan.price || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">GST (18%)</span>
                                        <span className="text-slate-800 font-medium">${gst.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-slate-100" />
                                    <div className="flex justify-between text-base font-bold">
                                        <span className="text-slate-900">Total Payable</span>
                                        <span className="text-primary text-lg">${total.toLocaleString()}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Payment — 2 cols */}
                        <div className="lg:col-span-2">
                            <div className="sticky top-8 space-y-4">

                                <Card className="border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="h-1.5 bg-gradient-to-r from-primary to-cyan-400" />
                                    <CardHeader className="pb-3 pt-5">
                                        <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-primary" />
                                            Payment
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-0 space-y-4">

                                        {/* Status pill - ONLY show if not in live mode */}
                                        {!anyLivePayment && (
                                            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium bg-amber-50 border border-amber-200 text-amber-700">
                                                <AlertCircle className="w-4 h-4 shrink-0" /> Test Payment Mode
                                            </div>
                                        )}

                                        {/* Amount display */}
                                        <div className="text-center py-3 border border-slate-100 rounded-xl bg-slate-50">
                                            <p className="text-3xl font-bold text-slate-900">${total.toLocaleString()}</p>
                                            <p className="text-xs text-slate-400 mt-1">incl. GST</p>
                                        </div>

                                        {/* Razorpay */}
                                        {razorpaySettings.enabled && (
                                            <Button onClick={handleRazorpayPayment} disabled={processing}
                                                className="w-full h-12 text-sm font-semibold bg-[#072654] hover:bg-[#061e42] text-white gap-2">
                                                {processing
                                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                                                    : <><CreditCard className="h-4 w-4" /> Pay with Razorpay</>
                                                }
                                            </Button>
                                        )}

                                        {/* Divider when both enabled */}
                                        {razorpaySettings.enabled && paypalSettings.enabled && (
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-px bg-slate-200" />
                                                <span className="text-xs text-slate-400 font-medium">OR</span>
                                                <div className="flex-1 h-px bg-slate-200" />
                                            </div>
                                        )}

                                        {/* PayPal */}
                                        {paypalSettings.enabled && (
                                            <div>
                                                {processing && (
                                                    <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-500">
                                                        <Loader2 className="h-4 w-4 animate-spin" /> Completing payment...
                                                    </div>
                                                )}
                                                <div
                                                    ref={paypalContainerRef}
                                                    id="paypal-button-container"
                                                    className={processing ? 'opacity-40 pointer-events-none' : ''}
                                                />
                                            </div>
                                        )}

                                        {/* Test mode button */}
                                        {!anyLivePayment && (
                                            <Button onClick={handleTestPayment} disabled={processing}
                                                className="w-full h-12 text-sm font-semibold bg-primary hover:bg-primary/90 text-white gap-2">
                                                {processing
                                                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                                                    : <><Zap className="h-4 w-4" /> Complete Purchase (Test)</>
                                                }
                                            </Button>
                                        )}

                                        {/* Trust signals */}
                                        <div className="pt-2 border-t border-slate-100 space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Lock className="w-3.5 h-3.5 shrink-0" />
                                                <span>256-bit SSL encrypted checkout</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Shield className="w-3.5 h-3.5 shrink-0" />
                                                <span>Your payment info is never stored</span>
                                            </div>
                                            {!anyLivePayment && (
                                                <p className="text-xs text-amber-600 mt-2 text-center">
                                                    Demo mode — no real payment charged
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Need help */}
                                <p className="text-center text-xs text-slate-400">
                                    Need help?{' '}
                                    <a href="/contact" className="text-primary hover:underline">Contact support</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
