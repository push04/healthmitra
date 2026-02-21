import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Heart, Users, Shield, Target, Award, Clock } from "lucide-react"

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
                {/* Hero Section */}
                <section className="py-20 px-4 md:px-6">
                    <div className="max-w-6xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            About <span className="text-primary">HealthMitra</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Your trusted partner in healthcare management. We&apos;re on a mission to make quality healthcare accessible, affordable, and hassle-free for everyone.
                        </p>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="py-16 px-4 md:px-6 bg-card">
                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                            <Target className="w-12 h-12 text-primary mb-4" />
                            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                            <p className="text-muted-foreground">
                                To revolutionize healthcare access by providing comprehensive health plans, seamless digital services, and personalized care solutions that empower individuals and families to take control of their health journey.
                            </p>
                        </div>
                        <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                            <Award className="w-12 h-12 text-primary mb-4" />
                            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                            <p className="text-muted-foreground">
                                To become India&apos;s most trusted healthcare platform, bridging the gap between patients and quality medical services while ensuring transparency, affordability, and excellence in every interaction.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="py-16 px-4 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center p-6">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Heart className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Patient First</h3>
                                <p className="text-muted-foreground">Every decision we make prioritizes the health and well-being of our members.</p>
                            </div>
                            <div className="text-center p-6">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Trust & Transparency</h3>
                                <p className="text-muted-foreground">We believe in honest communication and clear policies with no hidden terms.</p>
                            </div>
                            <div className="text-center p-6">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Inclusive Care</h3>
                                <p className="text-muted-foreground">Quality healthcare should be accessible to everyone, regardless of background.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="py-16 px-4 md:px-6 bg-primary text-primary-foreground">
                    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold mb-2">50K+</div>
                            <div className="opacity-90">Happy Members</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">500+</div>
                            <div className="opacity-90">Network Hospitals</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">24/7</div>
                            <div className="opacity-90">Customer Support</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">98%</div>
                            <div className="opacity-90">Satisfaction Rate</div>
                        </div>
                    </div>
                </section>

                {/* Team Preview */}
                <section className="py-16 px-4 md:px-6">
                    <div className="max-w-6xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-6">Built by Healthcare Experts</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
                            Our team comprises experienced healthcare professionals, technology experts, and customer service specialists dedicated to transforming your healthcare experience.
                        </p>
                        <div className="flex items-center justify-center gap-4">
                            <Clock className="w-5 h-5 text-primary" />
                            <span className="text-muted-foreground">Serving families since 2020</span>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
