import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata = {
    title: 'Disclaimers | HealthMitra',
    description: 'Legal disclaimers for HealthMitra services.',
};

export default function DisclaimersPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-slate-50 py-12 px-4 md:px-6">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">Legal Disclaimers</h1>
                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p>Last updated: {new Date().toLocaleDateString()}</p>
                        
                        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Not a Substitute for Emergency Medical Care</h2>
                        <p>The content provided by this platform is strictly for informational and scheduling purposes. Always seek direct medical attention via standard emergency hotlines in case of a severe medical crisis.</p>
                        
                        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. Third-Party Links</h2>
                        <p>Certain content or payment portals (such as Razorpay and PayPal) exist outside our immediate infrastructure scope. We limit our liability regarding their direct service upimes outside of API interactions.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
