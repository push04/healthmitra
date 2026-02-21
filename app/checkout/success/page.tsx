'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);
    const [purchaseData, setPurchaseData] = useState<any>(null);

    useEffect(() => {
        const dataParam = searchParams.get('data');
        if (dataParam) {
            try {
                const decoded = JSON.parse(decodeURIComponent(dataParam));
                setPurchaseData(decoded);
            } catch (e) {
                console.error('Failed to parse purchase data');
            }
        }
    }, [searchParams]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            router.push('/my-purchases');
        }
    }, [countdown, router]);

    if (!purchaseData) {
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

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 md:px-6">
                <div className="max-w-2xl mx-auto">
                    {/* Success Card */}
                    <Card className="border-2 border-teal-200 shadow-2xl">
                        <CardContent className="p-8 text-center">
                            {/* Success Animation */}
                            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                <CheckCircle className="w-10 h-10 text-teal-600" />
                            </div>

                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                🎉 Purchase Successful!
                            </h1>
                            <p className="text-slate-500 mb-8">
                                Thank you for choosing HealthMitra
                            </p>

                            {/* Order Details */}
                            <div className="bg-slate-50 rounded-xl p-6 mb-6 text-left">
                                <h3 className="font-semibold text-slate-900 mb-4">Order Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Plan</span>
                                        <span className="font-medium text-slate-900">{purchaseData.planName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Amount Paid</span>
                                        <span className="font-medium text-slate-900">₹{Number(purchaseData.amount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Transaction ID</span>
                                        <span className="font-mono text-slate-700">{purchaseData.transactionId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Start Date</span>
                                        <span className="font-medium text-slate-900">
                                            {new Date(purchaseData.startDate).toLocaleDateString('en-IN')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Valid Until</span>
                                        <span className="font-medium text-teal-600">
                                            {new Date(purchaseData.expiryDate).toLocaleDateString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Next Steps */}
                            <div className="bg-teal-50 rounded-xl p-6 mb-6 text-left border border-teal-100">
                                <h3 className="font-semibold text-teal-900 mb-3">What's Next?</h3>
                                <ul className="space-y-2 text-sm text-teal-700">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        Add your family members to the plan
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        Download your e-card for cashless treatment
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        Explore network hospitals near you
                                    </li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link href="/my-purchases" className="flex-1">
                                    <Button className="w-full bg-teal-600 hover:bg-teal-700 h-12">
                                        View My Plans
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-3">
                                <Link href="/dashboard" className="flex-1">
                                    <Button variant="outline" className="w-full h-12">
                                        Go to Dashboard
                                    </Button>
                                </Link>
                            </div>

                            {/* Auto-redirect Notice */}
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <p className="text-sm text-slate-500">
                                    Redirecting to My Purchases in{' '}
                                    <span className="font-bold text-teal-600">{countdown}</span> seconds...
                                </p>
                                <p className="text-xs text-slate-400 mt-2">
                                    Or click the buttons above to navigate immediately
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </>
    );
}

function LoadingState() {
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

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
