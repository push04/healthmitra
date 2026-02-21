"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface FAQ {
    id: string
    question: string
    answer: string
    category: string
    status: string
    order: number
}

export default function FAQPage() {
    const [faqCategories, setFaqCategories] = useState<{ category: string; questions: FAQ[] }[]>([])
    const [loading, setLoading] = useState(true)
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    useEffect(() => {
        const fetchFAQs = async () => {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('cms_content')
                .select('key, value')
                .like('key', 'faq_%')
                .eq('status', 'active')
                .order('display_order', { ascending: true })

            if (error) {
                console.error('Error fetching FAQs:', error)
                setLoading(false)
                return
            }

            // Group FAQs by category
            const grouped: Record<string, FAQ[]> = {}
            data?.forEach((item: any) => {
                try {
                    const faq = JSON.parse(item.value)
                    if (!grouped[faq.category]) {
                        grouped[faq.category] = []
                    }
                    grouped[faq.category].push({
                        id: item.key,
                        question: faq.question || faq.q,
                        answer: faq.answer || faq.a,
                        category: faq.category,
                        status: faq.status || 'active',
                        order: faq.order || 0
                    })
                } catch (e) {
                    // Skip invalid entries
                }
            })

            const categories = Object.entries(grouped).map(([category, questions]) => ({
                category,
                questions
            }))

            setFaqCategories(categories)
            setLoading(false)
        }

        fetchFAQs()
    }, [])

    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                </div>
                <Footer />
            </>
        )
    }

    // Default FAQs if none in DB
    const defaultFaqs = faqCategories.length === 0 ? [
        {
            category: "General",
            questions: [
                { q: "What is HealthMitra?", a: "HealthMitra is a comprehensive healthcare platform that offers health plans, doctor consultations, medicine delivery, diagnostic tests, and emergency services all under one roof." },
                { q: "How do I create an account?", a: "Click on 'Get Started' or 'Sign Up' button, fill in your details, verify your email/phone, and you're ready to explore our services." },
                { q: "Is HealthMitra available in my city?", a: "We currently operate in major cities across India including Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata, and are expanding rapidly." }
            ]
        },
        {
            category: "Health Plans",
            questions: [
                { q: "What health plans do you offer?", a: "We offer Basic, Family, and Premium plans. Each plan offers different coverage levels and benefits." },
                { q: "Can I add family members to my plan?", a: "Yes! Our Family and Premium plans allow you to add family members." }
            ]
        }
    ] : faqCategories

    let globalIndex = 0

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <section className="py-20 bg-gradient-to-r from-teal-600 to-teal-700">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Frequently Asked Questions</h1>
                        <p className="text-xl text-teal-100">Find answers to common questions about HealthMitra</p>
                    </div>
                </section>

                <section className="py-16 px-4">
                    <div className="max-w-4xl mx-auto">
                                {defaultFaqs.map((category) => (
                            <div key={category.category} className="mb-12">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">{category.category}</h2>
                                <div className="space-y-3">
                                    {category.questions.map((faq: any) => {
                                        const currentIndex = globalIndex++
                                        const questionText = faq.q || faq.question || ''
                                        const answerText = faq.a || faq.answer || ''
                                        return (
                                            <div key={currentIndex} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                                <button
                                                    onClick={() => setOpenIndex(openIndex === currentIndex ? null : currentIndex)}
                                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                                                >
                                                    <span className="font-medium text-slate-800">{questionText}</span>
                                                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openIndex === currentIndex ? 'rotate-180' : ''}`} />
                                                </button>
                                                {openIndex === currentIndex && (
                                                    <div className="px-6 pb-4 text-slate-600">
                                                        {answerText}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="py-16 px-4 bg-slate-50">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Still have questions?</h2>
                        <p className="text-slate-600 mb-6">Our support team is here to help you with any questions</p>
                        <Link href="/contact">
                            <Button className="bg-teal-600 hover:bg-teal-700">Contact Support</Button>
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
