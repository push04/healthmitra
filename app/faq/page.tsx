"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const faqCategories = [
    {
        category: "General",
        questions: [
            {
                q: "What is HealthMitra?",
                a: "HealthMitra is a comprehensive healthcare platform that offers health plans, doctor consultations, medicine delivery, diagnostic tests, and emergency services all under one roof."
            },
            {
                q: "How do I create an account?",
                a: "Click on 'Get Started' or 'Sign Up' button, fill in your details, verify your email/phone, and you're ready to explore our services."
            },
            {
                q: "Is HealthMitra available in my city?",
                a: "We currently operate in major cities across India including Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata, and are expanding rapidly."
            }
        ]
    },
    {
        category: "Health Plans",
        questions: [
            {
                q: "What health plans do you offer?",
                a: "We offer three plans - Basic (₹2,999/year), Family (₹7,999/year), and Premium (₹14,999/year). Each plan offers different coverage levels and benefits."
            },
            {
                q: "Can I add family members to my plan?",
                a: "Yes! Our Family and Premium plans allow you to add family members. Family plan covers up to 4 members, while Premium covers up to 6 members."
            },
            {
                q: "What is covered under OPD benefits?",
                a: "OPD benefits include doctor consultations, diagnostic tests, medicines, and preventive health checkups as per your plan limits."
            },
            {
                q: "Is there a waiting period?",
                a: "There's no waiting period for OPD benefits. For hospitalization claims, a 30-day waiting period applies for non-emergency cases."
            }
        ]
    },
    {
        category: "Services",
        questions: [
            {
                q: "How do I book a doctor consultation?",
                a: "Go to 'Service Requests' in your dashboard, select 'Doctor Consultation', choose your preferred time and specialist, and confirm your booking."
            },
            {
                q: "How does medicine delivery work?",
                a: "Upload your prescription or select medicines, add to cart, and checkout. Medicines are delivered to your doorstep within 24-48 hours."
            },
            {
                q: "Can I book home sample collection for tests?",
                a: "Yes! We offer free home sample collection for diagnostic tests. Book through the dashboard and our phlebotomist will visit at your preferred time."
            },
            {
                q: "How do I access emergency ambulance services?",
                a: "Call our 24/7 emergency helpline or use the SOS button in your app. GPS-enabled ambulances will be dispatched immediately."
            }
        ]
    },
    {
        category: "Claims & Reimbursements",
        questions: [
            {
                q: "How do I file a reimbursement claim?",
                a: "Go to 'Reimbursements' in your dashboard, click 'New Claim', select claim type, upload documents, and submit. Track status in real-time."
            },
            {
                q: "What documents are needed for claims?",
                a: "Typically you need - original bills/invoices, prescription, discharge summary (for hospitalization), and diagnostic reports if applicable."
            },
            {
                q: "How long does claim processing take?",
                a: "Most claims are processed within 7-10 working days. Emergency claims are fast-tracked and processed within 48 hours."
            },
            {
                q: "What is the cashless facility?",
                a: "At network hospitals, you can avail treatment without paying upfront. Show your E-Card and we settle bills directly with the hospital."
            }
        ]
    },
    {
        category: "Account & Payment",
        questions: [
            {
                q: "How do I update my profile information?",
                a: "Go to 'Profile' in your dashboard, click 'Edit', update your details, and save. Some changes may require document verification."
            },
            {
                q: "What payment methods are accepted?",
                a: "We accept all major credit/debit cards, UPI, net banking, and wallet payments. EMI options are available for premium plans."
            },
            {
                q: "How do I download my E-Card?",
                a: "Go to 'E-Cards' in your dashboard. You can view, download, print, or email your E-Card to keep it handy for hospital visits."
            },
            {
                q: "Can I get a refund if I cancel my plan?",
                a: "Yes, we offer a 30-day money-back guarantee. Cancellations after 30 days will receive a pro-rata refund as per terms."
            }
        ]
    }
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border-b border-border last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 flex items-center justify-between text-left hover:text-primary transition-colors"
            >
                <span className="font-medium pr-4">{question}</span>
                <ChevronDown className={`w-5 h-5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-4 text-muted-foreground animate-in slide-in-from-top-2 duration-200">
                    {answer}
                </div>
            )}
        </div>
    )
}

export default function FAQPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
                {/* Hero Section */}
                <section className="py-20 px-4 md:px-6">
                    <div className="max-w-6xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Frequently Asked <span className="text-primary">Questions</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Find answers to common questions about HealthMitra services, plans, and features.
                        </p>
                    </div>
                </section>

                {/* FAQ Categories */}
                <section className="py-16 px-4 md:px-6">
                    <div className="max-w-4xl mx-auto space-y-12">
                        {faqCategories.map((category, index) => (
                            <div key={index}>
                                <h2 className="text-2xl font-bold mb-6 text-primary">{category.category}</h2>
                                <div className="bg-card rounded-2xl border border-border p-6">
                                    {category.questions.map((faq, idx) => (
                                        <FAQItem key={idx} question={faq.q} answer={faq.a} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Still Have Questions */}
                <section className="py-16 px-4 md:px-6 bg-card">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
                        <p className="text-muted-foreground mb-8">
                            Can't find what you're looking for? Our support team is here to help.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/contact">
                                <Button size="lg" className="bg-primary hover:bg-primary/90">Contact Support</Button>
                            </Link>
                            <a href="tel:18001234567">
                                <Button size="lg" variant="outline">
                                    Call: 1800-123-4567
                                </Button>
                            </a>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
