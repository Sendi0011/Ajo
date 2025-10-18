"use client"

import { createAppKit } from "@reown/appkit/react"
import { base, baseSepolia } from "@reown/appkit/networks"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi"
import type { ReactNode } from "react"

// 1. Get projectId from https://cloud.reown.com
const projectId = "3b6a40e24f6067b673d508713650f6a6"

// 2. Create metadata object
const metadata = {
  name: "BaseSafe",
  description: "Decentralized Community Savings Platform on Base",
  url: typeof window !== "undefined" ? window.location.origin : "https://basesafe.app",
  icons: ["https://basesafe.app/icon.png"],
}

// 3. Set the networks
const networks = [base, baseSepolia]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
})

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "oklch(0.65 0.20 165)",
    "--w3m-border-radius-master": "12px",
  },
})

// 6. Setup queryClient
const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
