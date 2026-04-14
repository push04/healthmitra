import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata = {
    title: 'Refund & Cancellation Policy | HealthMitra',
    description: 'Refund and cancellation procedures for HealthMitra.',
};

export default function RefundCancellationPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-slate-50 py-12 px-4 md:px-6">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">Refund & Cancellation Policy</h1>
                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p>Last updated: {new Date().toLocaleDateString()}</p>
                        
                        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Cancellation Policy</h2>
                        <p>Users may cancel app services or plans directly through their dashboard or by contacting the support network. Unused subscription duration may qualify for prorated returns depending on the plan type.</p>
                        
                        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. Refund Eligibility</h2>
                        <p>Refunds are initiated only for failed services or wrongful deductions. Claims must be placed within 7 days of the disputed payment transaction.</p>
                        
                        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. Payment Gateway Routing</h2>
                        <p>All approved refunds are instantly routed back to the original source of payment (via Razorpay or PayPal) and usually reflect within 5-7 business working days.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
