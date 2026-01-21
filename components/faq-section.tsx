"use client"

import { useState } from "react"
import { ChevronDown, Mail } from "lucide-react"
import Link from "next/link"

const faqs = [
  {
    question: "What happens in an emergency?",
    answer:
      "In the event of an emergency, HealthMitra provides immediate assistance by coordinating with ambulance services, hospitals, doctors, and designated family members.",
  },
  {
    question: "Is HealthMitra a 24×7 service?",
    answer:
      "Yes. HealthMitra offers 24×7 support access for emergencies and urgent coordination. Scheduled visits are delivered during predefined working hours.",
  },
  {
    question: "How can I contact HealthMitra during an emergency?",
    answer: "You can contact HealthMitra through a dedicated helpline, WhatsApp support, or app-based contact options.",
  },
  {
    question: "How does HealthMitra define an emergency?",
    answer:
      "An emergency is any sudden medical situation requiring immediate attention, such as accidents, acute illness, or sudden deterioration in health.",
  },
  {
    question: "What is a Care Manager visit?",
    answer:
      "A Care Manager visit involves a trained HealthMitra professional visiting to assess care requirements and coordinate services.",
  },
  {
    question: "What is the duration of a Care Manager visit?",
    answer:
      "The duration depends on the plan and nature of support required. Visits may last up to 4 hours, as defined in your plan.",
  },
]

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about HealthMitra services and membership.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <button
              key={idx}
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full bg-white border border-border rounded-lg p-6 hover:border-primary/50 transition-colors text-left group"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-lg">{faq.question}</h3>
                <ChevronDown
                  className={`text-primary transition-transform flex-shrink-0 ${openIdx === idx ? "rotate-180" : ""}`}
                  size={20}
                />
              </div>
              {openIdx === idx && <p className="text-foreground mt-4 leading-relaxed text-base">{faq.answer}</p>}
            </button>
          ))}
        </div>

        <div className="mt-12 bg-white border border-border rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <Mail className="text-primary" size={32} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">
            Our support team is here to help. Reach out to us anytime for assistance.
          </p>
          <Link href="/contact" className="inline-block">
            <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Contact Us
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
