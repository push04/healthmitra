'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, CreditCard, Shield, Loader2, ArrowLeft, ArrowRight, Star, AlertCircle } from 'lucide-react';
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

interface RazorpaySettings {
    enabled: boolean;
    keyId: string;
}

export default function CheckoutPage({ params }: { params: Promise<{ plan: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const supabase = createClient();

    const [plan, setPlan] = useState<Plan | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [razorpaySettings, setRazorpaySettings] = useState<RazorpaySettings>({ enabled: false, keyId: '' });
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login?redirect=/checkout');
                return;
            }
            setUser(user);

            // Fetch Razorpay settings
            const settingsRes = await fetch('/api/settings/razorpay');
            const settingsData = await settingsRes.json();
            if (settingsData.success) {
                setRazorpaySettings(settingsData.data);
            }

            // Fetch plan details
            const planRes = await fetch(`/api/plans/${resolvedParams.plan}`);
            const planData = await planRes.json();
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

    const handleTestPayment = async () => {
        if (!plan || !user) return;

        setProcessing(true);

        try {
            const response = await fetch('/api/checkout/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan.id,
                    paymentMethod: 'test',
                }),
            });

            const result = await response.json();

            if (result.success) {
                router.push(`/checkout/success?data=${encodeURIComponent(JSON.stringify(result.data))}`);
            } else {
                toast.error(result.error || 'Purchase failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setProcessing(false);
        }
    };

    const handleRazorpayPayment = async () => {
        if (!plan || !user || !razorpaySettings.enabled) return;

        setProcessing(true);

        try {
            // Create Razorpay order
            const orderRes = await fetch('/api/checkout/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan.id,
                    amount: plan.price,
                }),
            });

            const orderData = await orderRes.json();

            if (!orderData.success) {
                toast.error(orderData.error || 'Failed to create order');
                setProcessing(false);
                return;
            }

            // Load Razorpay
            const razorpay = await loadRazorpay(orderData.data.keyId);

            const options = {
                key: orderData.data.keyId,
                amount: orderData.data.amount,
                currency: orderData.data.currency,
                name: 'HealthMitra',
                description: `${plan.name} - Plan Purchase`,
                order_id: orderData.data.orderId,
                handler: async (response: any) => {
                    // Verify and complete purchase
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

                    const verifyResult = await verifyRes.json();

                    if (verifyResult.success) {
                        router.push(`/checkout/success?data=${encodeURIComponent(JSON.stringify(verifyResult.data))}`);
                    } else {
                        toast.error(verifyResult.error || 'Payment verification failed');
                    }
                },
                prefill: {
                    name: user.email?.split('@')[0] || '',
                    email: user.email || '',
                },
                theme: {
                    color: '#0d9488',
                },
            };

            razorpay.open(options);
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                </div>
                <Footer />
            </>
        );
    }

    if (!plan) return null;

    const gst = Math.round(plan.price * 0.18);
    const total = plan.price + gst;

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 px-4 md:px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-600 hover:text-teal-600 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Plans
                    </button>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Order Summary */}
                        <div className="lg:col-span-2">
                            <Card className="border border-slate-200 shadow-lg">
                                <CardHeader className="border-b border-slate-200">
                                    <CardTitle className="text-xl text-slate-900">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {/* Plan Details */}
                                    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl mb-6">
                                        {plan.is_featured && (
                                            <div className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                POPULAR
                                            </div>
                                        )}
                                        <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center shrink-0">
                                            <Shield className="w-8 h-8 text-teal-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-slate-900">{plan.name}</h3>
                                            <p className="text-slate-500 text-sm">{plan.description}</p>
                                            <p className="text-slate-500 text-sm mt-1">{plan.duration_days} days coverage</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-slate-900">₹{Number(plan.price || 0).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div className="mb-6">
                                        <h4 className="font-semibold text-slate-900 mb-3">Plan Includes:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {(plan.features || []).slice(0, 6).map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                                                    <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="border-t border-slate-200 pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Base Price</span>
                                            <span className="text-slate-900">₹{Number(plan.price || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">GST (18%)</span>
                                            <span className="text-slate-900">₹{gst.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                                            <span className="text-slate-900">Total</span>
                                            <span className="text-teal-600">₹{total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Payment Section */}
                        <div className="lg:col-span-1">
                            <Card className="border border-slate-200 shadow-lg sticky top-8">
                                <CardHeader className="border-b border-slate-200">
                                    <CardTitle className="text-xl text-slate-900">Payment</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {/* Payment Mode Info */}
                                    <div className={`p-4 rounded-xl ${razorpaySettings.enabled ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {razorpaySettings.enabled ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                            )}
                                            <span className={`font-medium ${razorpaySettings.enabled ? 'text-green-700' : 'text-amber-700'}`}>
                                                {razorpaySettings.enabled ? 'Live Payment Mode' : 'Test Payment Mode'}
                                            </span>
                                        </div>
                                        <p className={`text-sm ${razorpaySettings.enabled ? 'text-green-600' : 'text-amber-600'}`}>
                                            {razorpaySettings.enabled
                                                ? 'Secure payment via Razorpay'
                                                : 'Demo mode - no real payment required'}
                                        </p>
                                    </div>

                                    {/* Payment Button */}
                                    {razorpaySettings.enabled ? (
                                        <Button
                                            onClick={handleRazorpayPayment}
                                            disabled={processing}
                                            className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-base"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Pay ₹{total.toLocaleString()}
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleTestPayment}
                                            disabled={processing}
                                            className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-base"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    Complete Purchase (Test)
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    {/* Security Note */}
                                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-4">
                                        <Shield className="w-4 h-4" />
                                        <span>Secure 256-bit SSL Encryption</span>
                                    </div>

                                    {/* Test Mode Notice */}
                                    {!razorpaySettings.enabled && (
                                        <div className="text-center text-xs text-slate-500 mt-2">
                                            <p>This is a test purchase.</p>
                                            <p>No real payment will be deducted.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
