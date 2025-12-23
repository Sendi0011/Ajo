"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createAppKit } from "@reown/appkit/react";
import { base, baseSepolia } from "@reown/appkit/networks";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// 1. Project ID
const projectId = "3b6a40e24f6067b673d508713650f6a6";

// 2. Metadata
const metadata = {
  name: "BaseSafe",
  description: "Decentralized Community Savings Platform on Base",
  url: "https://basesafe.app",
  icons: ["https://basesafe.app/icon.png"],
};

// 3. Networks
const networks = [base, baseSepolia];

// 4. Wagmi Adapter (SSR must be FALSE)
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
});

// 5. Query client
const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  const initialized = useRef(false);

  // ✅ Initialize AppKit ONLY on the client
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

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
    });
  }, []);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
