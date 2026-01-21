import { Heart, Shield, Users, Zap, Award, Headphones } from "lucide-react"

const features = [
  {
    icon: Heart,
    title: "Holistic Care",
    description:
      "Comprehensive health monitoring, doctor consultations, and preventive care tailored for senior health needs.",
  },
  {
    icon: Shield,
    title: "24/7 Emergency Support",
    description: "Immediate access to emergency services with trained medical professionals ready anytime.",
  },
  {
    icon: Users,
    title: "Family Coordination",
    description: "Keep all family members informed with real-time health updates and easy communication.",
  },
  {
    icon: Zap,
    title: "Quick Service Access",
    description: "Schedule appointments instantly with transparent pricing and flexible time slots.",
  },
  {
    icon: Award,
    title: "Expert Healthcare Team",
    description: "Trained, verified, and certified healthcare providers committed to senior wellness.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "Our support specialists are always available to help with any questions or concerns.",
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">Why Choose HealthMitra?</h2>
          <p className="text-lg md:text-xl text-black font-semibold max-w-3xl mx-auto leading-relaxed">
            Designed specifically for seniors and their families, combining professional healthcare expertise with genuine, compassionate care that puts your loved ones first.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="group relative bg-white border border-border rounded-2xl p-8 hover:border-secondary/50 hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-secondary/10 to-accent/10 group-hover:from-secondary/20 group-hover:to-accent/20 flex items-center justify-center mb-6 transition-all duration-500">
                    <Icon className="text-secondary group-hover:text-primary transition-colors" size={32} />
                  </div>
                  <h3 className="font-semibold text-xl text-primary mb-3 group-hover:text-secondary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
