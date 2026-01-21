import { Stethoscope, Pill, Activity, Utensils, Brain, Users } from "lucide-react"

const services = [
  {
    icon: Stethoscope,
    title: "Doctor Consult",
    description: "Online and in-home consultations with experienced doctors for health assessments.",
  },
  {
    icon: Users,
    title: "Diseases Management",
    description: "Specialized management for chronic conditions including cardiac care and diabetes.",
  },
  {
    icon: Pill,
    title: "Medication Management",
    description: "Smart reminders and adherence tracking for prescribed medications.",
  },
  {
    icon: Activity,
    title: "Wellness Programs",
    description: "Customized fitness and wellness programs designed for senior health.",
  },
  {
    icon: Utensils,
    title: "Nutrition Guidance",
    description: "Personalized diet plans and nutritional counseling from certified nutritionists.",
  },
  {
    icon: Brain,
    title: "Mental Wellness",
    description: "Counseling and mental health support for emotional well-being.",
  },
]

export function ServicesGrid() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-blue-50/50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10 transform translate-y-1/4"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">Solutions for Every Senior's Needs</h2>
          <p className="text-lg md:text-xl text-black font-semibold max-w-3xl mx-auto leading-relaxed">
            Comprehensive range of premium healthcare services thoughtfully designed and tailored for seniors and their families.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => {
            const Icon = service.icon
            return (
              <div
                key={idx}
                className="group relative bg-white border border-border rounded-2xl p-8 hover:border-accent/50 hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent/10 to-secondary/10 group-hover:from-accent/20 group-hover:to-secondary/20 flex items-center justify-center mb-6 transition-all duration-500">
                    <Icon className="text-accent group-hover:text-secondary transition-colors" size={32} />
                  </div>
                  <h3 className="font-semibold text-xl text-primary mb-3 group-hover:text-secondary transition-colors">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">{service.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
