"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import { useAppKit } from "@reown/appkit/react"
import { useAccount } from "wagmi"
import Link from "next/link"

export function Hero() {
  const { open } = useAppKit()
  const { isConnected } = useAccount()

  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100 text-balance">
            Save together, <span className="text-primary">grow together</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 text-pretty">
            A decentralized community savings platform helping Africans build trust-based financial circles with
            automated contributions and transparent payouts.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            {isConnected ? (
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 h-14" asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 h-14" onClick={() => open()}>
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
            <Button size="lg" variant="outline" className="text-lg px-8 h-14 bg-transparent" asChild>
              <Link href="#how-it-works">Learn More</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">On-chain Trust</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">0%</div>
              <div className="text-sm text-muted-foreground">Hidden Fees</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Automated</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
