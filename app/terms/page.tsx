import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata = {
    title: 'Terms of Service | HealthMitra',
    description: 'Terms of Service and Conditions for using HealthMitra.',
};

export default function TermsPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-slate-50 py-12 px-4 md:px-6">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms of Service</h1>
                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p>Last updated: {new Date().toLocaleDateString()}</p>
                        
                        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p>By accessing or using HealthMitra, you agree to be bound by these Terms. If you disagree, please do not use our services.</p>
                        
                        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. Medical Disclaimer</h2>
                        <p>HealthMitra facilitates access to healthcare services but is not a substitute for immediate, strictly life-saving emergency services. Always consult certified medical professionals for severe issues.</p>
                        
                        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. Payment Terms</h2>
                        <p>Available payment options include major credit cards, UPI, and wallets via our integrated partners (Razorpay, PayPal). All transactions are billed according to your selected plan layout.</p>
                        
                        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. User Accounts</h2>
                        <p>You are strictly responsible for maintaining account confidentiality and for all activities that occur under your registered credentials.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
