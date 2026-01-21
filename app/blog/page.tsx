import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const blogPosts = [
    {
        title: "10 Tips for Maintaining a Healthy Lifestyle in 2024",
        excerpt: "Discover simple yet effective ways to improve your overall health and well-being this year.",
        category: "Wellness",
        date: "Jan 15, 2024",
        readTime: "5 min read",
        image: "bg-gradient-to-br from-green-400 to-emerald-600"
    },
    {
        title: "Understanding Health Insurance: A Complete Guide",
        excerpt: "Everything you need to know about health insurance plans, coverage, and making the right choice.",
        category: "Insurance",
        date: "Jan 12, 2024",
        readTime: "8 min read",
        image: "bg-gradient-to-br from-blue-400 to-indigo-600"
    },
    {
        title: "The Importance of Regular Health Checkups",
        excerpt: "Why preventive health screenings can save your life and how often you should get them.",
        category: "Prevention",
        date: "Jan 10, 2024",
        readTime: "4 min read",
        image: "bg-gradient-to-br from-purple-400 to-pink-600"
    },
    {
        title: "Managing Diabetes: Diet, Exercise, and Medication",
        excerpt: "A comprehensive guide to living well with diabetes and keeping your blood sugar in check.",
        category: "Chronic Care",
        date: "Jan 8, 2024",
        readTime: "7 min read",
        image: "bg-gradient-to-br from-orange-400 to-red-600"
    },
    {
        title: "Mental Health Matters: Breaking the Stigma",
        excerpt: "Why mental health is just as important as physical health and how to seek help.",
        category: "Mental Health",
        date: "Jan 5, 2024",
        readTime: "6 min read",
        image: "bg-gradient-to-br from-teal-400 to-cyan-600"
    },
    {
        title: "Telemedicine: The Future of Healthcare",
        excerpt: "How virtual consultations are revolutionizing access to medical care.",
        category: "Technology",
        date: "Jan 2, 2024",
        readTime: "5 min read",
        image: "bg-gradient-to-br from-rose-400 to-pink-600"
    }
]

export default function BlogPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
                {/* Hero Section */}
                <section className="py-20 px-4 md:px-6">
                    <div className="max-w-6xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Health <span className="text-primary">Blog</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                            Stay informed with the latest health tips, medical news, and wellness advice from our experts.
                        </p>
                    </div>
                </section>

                {/* Featured Post */}
                <section className="px-4 md:px-6 pb-12">
                    <div className="max-w-6xl mx-auto">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 md:p-12">
                            <div className="relative z-10 max-w-2xl">
                                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-4">Featured</span>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Complete Guide to Preventive Healthcare</h2>
                                <p className="opacity-90 mb-6">Learn how regular checkups, vaccinations, and lifestyle changes can help you live a longer, healthier life.</p>
                                <Button variant="secondary" className="group">
                                    Read Article
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                            <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
                                <div className="w-full h-full bg-white rounded-full transform translate-x-1/2" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Blog Grid */}
                <section className="py-16 px-4 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blogPosts.map((post, index) => (
                                <article
                                    key={index}
                                    className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className={`h-48 ${post.image} flex items-center justify-center`}>
                                        <span className="text-white/80 text-6xl font-bold opacity-20">{post.category[0]}</span>
                                    </div>
                                    <div className="p-6">
                                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-3">
                                            {post.category}
                                        </span>
                                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {post.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {post.readTime}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Newsletter */}
                <section className="py-16 px-4 md:px-6 bg-card">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
                        <p className="text-muted-foreground mb-8">Get the latest health tips and updates delivered to your inbox.</p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <Button className="bg-primary hover:bg-primary/90">Subscribe</Button>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    )
}
