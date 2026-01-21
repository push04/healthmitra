import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Check, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const plans = [
    {
        name: "Basic",
        price: "₹2,999",
        period: "/year",
        description: "Essential coverage for individuals",
        features: [
            "Up to ₹2 Lakh Coverage",
            "OPD Consultation (10 visits)",
            "Basic Diagnostic Tests",
            "Medicine Discounts (15%)",
            "Teleconsultation Access",
            "Email Support"
        ],
        popular: false
    },
    {
        name: "Family",
        price: "₹7,999",
        period: "/year",
        description: "Comprehensive coverage for families",
        features: [
            "Up to ₹5 Lakh Coverage",
            "Cover for 4 Family Members",
            "Unlimited OPD Consultations",
            "All Diagnostic Tests Included",
            "Medicine Discounts (25%)",
            "Free Ambulance Service",
            "24/7 Priority Support",
            "Wellness Programs"
        ],
        popular: true
    },
    {
        name: "Premium",
        price: "₹14,999",
        period: "/year",
        description: "Maximum protection with exclusive benefits",
        features: [
            "Up to ₹10 Lakh Coverage",
            "Cover for 6 Family Members",
            "Unlimited Everything",
            "International Coverage",
            "Personal Health Manager",
            "Home Healthcare Services",
            "VIP Hospital Treatment",
            "Mental Health Support",
            "Annual Health Checkup"
        ],
        popular: false
    }
]

export default function PlansPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
                {/* Hero Section */}
                <section className="py-20 px-4 md:px-6">
                    <div className="max-w-6xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Choose Your <span className="text-primary">Health Plan</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Affordable health plans designed to give you and your family the protection you deserve.
                        </p>
                    </div>
                </section>

                {/* Plans Grid */}
                <section className="py-16 px-4 md:px-6">
                    <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 ${plan.popular
                                        ? 'border-primary bg-gradient-to-b from-primary/5 to-primary/10 shadow-xl scale-105'
                                        : 'border-border bg-card hover:border-primary/50 hover:shadow-lg'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="flex items-center gap-1 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                                            <Star className="w-4 h-4 fill-current" />
                                            Most Popular
                                        </div>
                                    </div>
                                )}
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-bold text-primary">{plan.price}</span>
                                        <span className="text-muted-foreground">{plan.period}</span>
                                    </div>
                                    <p className="text-muted-foreground mt-2">{plan.description}</p>
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/signup" className="block">
                                    <Button
                                        className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                                        variant={plan.popular ? 'default' : 'outline'}
                                    >
                                        Get Started
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Preview */}
                <section className="py-16 px-4 md:px-6 bg-card">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
                        <p className="text-muted-foreground mb-8">
                            Check out our FAQ section or contact our team for personalized assistance.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/faq">
                                <Button variant="outline" size="lg">View FAQ</Button>
                            </Link>
                            <Link href="/contact">
                                <Button size="lg" className="bg-primary hover:bg-primary/90">Contact Sales</Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Guarantee */}
                <section className="py-16 px-4 md:px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full mb-4">
                            <Check className="w-5 h-5" />
                            <span className="font-medium">30-Day Money Back Guarantee</span>
                        </div>
                        <p className="text-muted-foreground">
                            Not satisfied? Get a full refund within 30 days, no questions asked.
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
