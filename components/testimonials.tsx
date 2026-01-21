import { Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Rajesh Kumar",
    age: 72,
    role: "Retired Teacher",
    text: "HealthMitra has transformed how I manage my health. The doctors are professional, the app is intuitive, and my family stays informed.",
    rating: 5,
    initials: "RK",
  },
  {
    name: "Amit Sharma",
    age: 68,
    role: "Senior Consultant",
    text: "Peace of mind knowing I have 24/7 support. The emergency response was incredibly quick and professional when I needed it.",
    rating: 5,
    initials: "AS",
  },
  {
    name: "Priya Gupta",
    age: 75,
    role: "Community Volunteer",
    text: "The wellness programs are fantastic. I feel healthier, more connected to my family, and more independent than ever.",
    rating: 5,
    initials: "PG",
  },
]

export function Testimonials() {
  return (
    <section className="py-20 md:py-32 bg-white relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 -translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">Trusted by Thousands of Families</h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Real stories from seniors and families who've experienced the HealthMitra difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="group relative bg-white border border-border rounded-2xl p-8 hover:border-secondary/50 hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} size={20} className="fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-foreground mb-8 leading-relaxed text-base italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4 pt-6 border-t border-border">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-gradient-to-br from-secondary/20 to-accent/20 text-secondary font-bold text-base">
                      {testimonial.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-primary">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
