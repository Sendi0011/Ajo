import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Web3Provider } from "@/components/web3-provider"
import { Toaster } from "@/components/ui/sonner"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Ajo - Community Savings on Base",
  description: "Save together, grow together. Decentralized community savings build on Base blockchain.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>
          <Web3Provider>
            {children}
            {/* Add Toaster 4 notifications */}
            <Toaster position="top-right" />
          </Web3Provider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
