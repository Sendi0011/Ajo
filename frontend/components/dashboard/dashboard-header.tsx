"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAppKit } from "@reown/appkit/react"
import { useAccount } from "wagmi"
import { Coins, Menu } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function DashboardHeader() {
  const { open } = useAppKit()
  const { address } = useAccount()

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Coins className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">BaseSafe</span>
          </Link>

          <div className="flex items-center gap-4">
            <Button onClick={() => open()} variant="outline" className="hidden sm:flex">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => open()}>
                  Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
