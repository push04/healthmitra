import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export const metadata = {
    title: 'Privacy Policy | HealthMitra',
    description: 'Privacy Policy for HealthMitra services and platform.',
};

export default function PrivacyPolicyPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-slate-50 py-12 px-4 md:px-6">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-100">
                    <h1 className="text-3xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p>Last updated: {new Date().toLocaleDateString()}</p>
                        
                        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Information We Collect</h2>
                        <p>We collect information that you strictly provide to us when registering, booking services, or completing your profile. This includes personally identifiable information (PII) securely managed.</p>
                        
                        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. How We Use Your Information</h2>
                        <p>Your information is used to provide requested services, process securely encrypted payments via our payment gateways (Razorpay, PayPal), and communicate with you effectively.</p>
                        
                        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. Data Security and Payments</h2>
                        <p>All online payments are securely processed through PCI-DSS compliant providers. We do not store your complete credit card or payment credentials on our servers.</p>

                        <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. Compliance</h2>
                        <p>We comply fully with applicable data protection laws. You reserve the right to access, alter, or request the deletion of your data by contacting our support desk.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
