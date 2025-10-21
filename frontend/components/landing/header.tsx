"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAppKit } from "@reown/appkit/react"
import { useAccount } from "wagmi"
import { Coins } from "lucide-react"

export function Header() {
  const { open } = useAppKit()
  const { address, isConnected } = useAccount()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Coins className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Ajo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#security"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Security
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {isConnected ? (
              <>
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button onClick={() => open()} variant="outline">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </Button>
              </>
            ) : (
              <Button onClick={() => open()} className="bg-primary hover:bg-primary/90">
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
