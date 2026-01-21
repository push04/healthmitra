"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <nav className="flex items-center justify-between px-4 py-3.5 md:px-6 max-w-7xl mx-auto w-full">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl md:text-2xl text-primary hover:opacity-90 transition-opacity"
        >
          <img src="/logo.jpg" alt="HealthMitra" className="h-14 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          <Link href="/">
            <Button variant="ghost" className="text-sm text-foreground hover:text-primary">
              Home
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="ghost" className="text-sm text-foreground hover:text-primary">
              About
            </Button>
          </Link>
          <Link href="/services">
            <Button variant="ghost" className="text-sm text-foreground hover:text-primary">
              Services
            </Button>
          </Link>
          <Link href="/plans">
            <Button variant="ghost" className="text-sm text-foreground hover:text-primary">
              Plans
            </Button>
          </Link>
          <Link href="/blog">
            <Button variant="ghost" className="text-sm text-foreground hover:text-primary">
              Blog
            </Button>
          </Link>
          <Link href="/faq">
            <Button variant="ghost" className="text-sm text-foreground hover:text-primary">
              FAQ
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="ghost" className="text-sm text-foreground hover:text-primary">
              Contact
            </Button>
          </Link>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" className="text-foreground">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-foreground hover:bg-muted rounded-lg"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="flex flex-col p-4 gap-2 max-w-7xl mx-auto w-full">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start text-foreground">
                Home
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" className="w-full justify-start text-foreground">
                About
              </Button>
            </Link>
            <Link href="/services">
              <Button variant="ghost" className="w-full justify-start text-foreground">
                Services
              </Button>
            </Link>
            <Link href="/plans">
              <Button variant="ghost" className="w-full justify-start text-foreground">
                Plans
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" className="w-full justify-start text-foreground">
                Blog
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="ghost" className="w-full justify-start text-foreground">
                FAQ
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="w-full justify-start text-foreground">
                Contact
              </Button>
            </Link>
            <div className="border-t border-border pt-4 mt-2 flex flex-col gap-2">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full bg-transparent">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button className="w-full bg-primary hover:bg-primary/90">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
