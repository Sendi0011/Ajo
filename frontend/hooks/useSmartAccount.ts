"use client";

import { useEffect, useState } from "react";
import { useWalletClient, useChainId, useAccount } from "wagmi";
import { getSmartAccount } from "@/lib/smartAccount";
import { base, baseSepolia } from "viem/chains";
import type { BiconomySmartAccountV2 } from "@biconomy/account";



export function useSmartAccount() {
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      // Reset state if wallet disconnected
      if (!isConnected || !walletClient || !chainId || !address) {
        setSmartAccount(null);
        setSmartAccountAddress(null);
        setError(null);
        return;
      }

      // Check if we're on a supported chain
      const chain = chainId === base.id ? base : chainId === baseSepolia.id ? baseSepolia : null;

      if (!chain) {
        setError("Please switch to Base or Base Sepolia network");
        setSmartAccount(null);
        return;
      }

      // Don't reinitialize if already initialized for this address
      if (smartAccount && smartAccountAddress) {
        return;
      }

      setIsInitializing(true);
      setError(null);

      try {
        console.log("Initializing smart account for:", address);
        const sa = await getSmartAccount(walletClient, chainId);
        
        if (sa) {
          const scwAddress = await sa.getAccountAddress();
          setSmartAccount(sa);
          setSmartAccountAddress(scwAddress);
          console.log("Smart Account Address:", scwAddress);
        } else {
          setError("Failed to initialize smart account");
        }
      } catch (err: any) {
        console.error("Smart account initialization error:", err);
        setError(err.message || "Failed to initialize smart account");
        setSmartAccount(null);
      } finally {
        setIsInitializing(false);
      }
    }

    init();
  }, [walletClient, chainId, address, isConnected]);

  return {
    smartAccount,
    smartAccountAddress,
    isInitializing,
    error,
    isReady: !!smartAccount && !!smartAccountAddress && !isInitializing,
  };
}

// Hook to get just the smart account address (useful for display)
export function useSmartAccountAddress() {
  const { smartAccountAddress, isInitializing, error } = useSmartAccount();
  return { address: smartAccountAddress, isLoading: isInitializing, error };
}