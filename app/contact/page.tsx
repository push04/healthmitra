"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Mail, Phone, MapPin, Clock, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    })
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        
        const supabase = createClient()
        const { error } = await supabase.from('contact_messages').insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: formData.subject,
            message: formData.message,
            status: 'pending'
        })

        setLoading(false)
        
        if (error) {
            toast.error('Failed to send message. Please try again.')
        } else {
            setSubmitted(true)
            toast.success('Message sent successfully! We\'ll get back to you soon.')
            setTimeout(() => setSubmitted(false), 5000)
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
        }
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
                {/* Hero Section */}
                <section className="py-20 px-4 md:px-6">
                    <div className="max-w-6xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Get in <span className="text-primary">Touch</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Have questions or need assistance? We're here to help you 24/7.
                        </p>
                    </div>
                </section>

                {/* Contact Info & Form */}
                <section className="py-16 px-4 md:px-6">
                    <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-12">
                        {/* Contact Information */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                                <p className="text-muted-foreground">
                                    Reach out to us through any of these channels and we'll respond as quickly as possible.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Phone</h3>
                                        <p className="text-muted-foreground">1800-123-4567 (Toll Free)</p>
                                        <p className="text-muted-foreground">+91 98765 43210</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Email</h3>
                                        <p className="text-muted-foreground">support@healthmitra.com</p>
                                        <p className="text-muted-foreground">sales@healthmitra.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Address</h3>
                                        <p className="text-muted-foreground">
                                            HealthMitra Headquarters<br />
                                            123 Healthcare Avenue<br />
                                            Bangalore, Karnataka 560001
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-1">Business Hours</h3>
                                        <p className="text-muted-foreground">Monday - Saturday: 9 AM - 8 PM</p>
                                        <p className="text-muted-foreground">Sunday: 10 AM - 6 PM</p>
                                        <p className="text-sm text-primary mt-1">Emergency: 24/7 Available</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-3">
                            <div className="bg-card rounded-2xl border border-border p-8">
                                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

                                {submitted && (
                                    <div className="mb-6 p-4 bg-green-500/10 text-green-600 rounded-lg">
                                        Thank you! Your message has been sent successfully. We'll get back to you soon.
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Full Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Email Address *</label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                                placeholder="+91 98765 43210"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Subject *</label>
                                            <select
                                                required
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="">Select a topic</option>
                                                <option value="general">General Inquiry</option>
                                                <option value="plans">Health Plans</option>
                                                <option value="claims">Claims & Reimbursements</option>
                                                <option value="services">Services</option>
                                                <option value="technical">Technical Support</option>
                                                <option value="feedback">Feedback</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Message *</label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                            placeholder="How can we help you?"
                                        />
                                    </div>

                                    <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                        {loading ? 'Sending...' : 'Send Message'}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Map Section */}
                <section className="py-16 px-4 md:px-6 bg-card">
                    <div className="max-w-6xl mx-auto">
                        <div className="rounded-2xl overflow-hidden border border-border h-80 bg-muted flex items-center justify-center">
                            <div className="text-center">
                                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">Interactive map would be displayed here</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
