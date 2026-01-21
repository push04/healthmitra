import { Users, Heart, CheckCircle2, Clock } from "lucide-react"

export function StatsSection() {
  const stats = [
    { number: "50K+", label: "Seniors Served", icon: Users },
    { number: "100+", label: "Healthcare Professionals", icon: Heart },
    { number: "99.8%", label: "Uptime Guarantee", icon: CheckCircle2 },
    { number: "24/7", label: "Emergency Support", icon: Clock },
  ]

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-primary via-primary/95 to-primary/90 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="group text-center text-white transition-all duration-500">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 group-hover:bg-white/20 mb-6 transition-all duration-500">
                  <Icon className="w-8 h-8 opacity-100 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold mb-3 group-hover:scale-110 transition-transform origin-center">{stat.number}</div>
                <p className="text-base md:text-lg text-white/90 font-medium">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
