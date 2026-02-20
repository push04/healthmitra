import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { WhyChooseUs } from "@/components/why-choose-us"
import { ServicesGrid } from "@/components/services-grid"
import { StatsSection } from "@/components/stats-section"
import { Testimonials } from "@/components/testimonials"
import { FAQSection } from "@/components/faq-section"
import { CTASection } from "@/components/cta-section"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role === 'admin') {
      redirect('/admin/dashboard')
    }
    redirect('/dashboard')
  }

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <WhyChooseUs />
        <ServicesGrid />
        <StatsSection />
        <Testimonials />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
