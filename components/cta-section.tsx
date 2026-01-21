import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-primary via-primary/95 to-primary/90 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
          Ready to Transform Your Senior Care?
        </h2>
        <p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join thousands of families receiving compassionate, professional healthcare support. Explore our premium plans and experience the HealthMitra difference today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/plans">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white hover:bg-white/95 text-primary text-base font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Explore Plans
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
          <Link href="/contact">
            <Button
              size="lg"
              className="w-full sm:w-auto text-base font-semibold border-2 border-white text-white hover:bg-white/15 bg-transparent transition-all"
            >
              Schedule Consultation
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
