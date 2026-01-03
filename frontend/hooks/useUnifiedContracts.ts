"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useSmartAccount } from "./useSmartAccount";
import { usePaymentTracker } from "./usePaymentTracker";

// Import EOA hooks
import * as EOAHooks from "./useBaseSafeContracts";

// Import Smart Account hooks
import * as SmartHooks from "./useSmartAccountContracts";

/**
 * Hook to detect if user wants to use Smart Account or EOA
 * Stores preference in localStorage
 */
export function useAccountMode() {
  const [useSmartWallet, setUseSmartWallet] = useState(false);
  const smartAccount = useSmartAccount();
  const { address } = useAccount();

  useEffect(() => {
    // Check localStorage for user preference
    const saved = localStorage.getItem("ajo-use-smart-wallet");
    if (saved !== null) {
      setUseSmartWallet(saved === "true");
    }
  }, []);

  const toggleMode = () => {
    const newMode = !useSmartWallet;
    setUseSmartWallet(newMode);
    localStorage.setItem("ajo-use-smart-wallet", String(newMode));
  };

  // Determine if smart account is actually available
  const isSmartAccountReady = useSmartWallet && !!smartAccount && !!address;

  return {
    useSmartWallet,
    toggleMode,
    isSmartAccountReady,
    smartAccount,
  };
}

/**
 * Unified hook that automatically uses Smart Account or EOA based on user preference
 */
export function useUnifiedCreateRotational(
  members: string[],
  depositAmount: string,
  frequency: string,
  treasuryFeeBps: number,
  relayerFeeBps: number
) {
  const { isSmartAccountReady } = useAccountMode();

  const eoaHook = EOAHooks.useCreateRotational(
    members,
    depositAmount,
    frequency,
    treasuryFeeBps,
    relayerFeeBps
  );

  const smartHook = SmartHooks.useSmartCreateRotational(
    members,
    depositAmount,
    frequency,
    treasuryFeeBps,
    relayerFeeBps
  );

  return isSmartAccountReady ? smartHook : eoaHook;
}

export function useUnifiedCreateTarget(
  members: string[],
  targetAmount: string,
  deadline: Date,
  treasuryFeeBps: number
) {
  const { isSmartAccountReady } = useAccountMode();

  const eoaHook = EOAHooks.useCreateTarget(
    members,
    targetAmount,
    deadline,
    treasuryFeeBps
  );

  const smartHook = SmartHooks.useSmartCreateTarget(
    members,
    targetAmount,
    deadline,
    treasuryFeeBps
  );

  return isSmartAccountReady ? smartHook : eoaHook;
}

export function useUnifiedCreateFlexible(
  members: string[],
  minimumDeposit: string,
  withdrawalFee: string,
  yieldEnabled: boolean,
  treasuryFeeBps: number
) {
  const { isSmartAccountReady } = useAccountMode();

  const eoaHook = EOAHooks.useCreateFlexible(
    members,
    minimumDeposit,
    withdrawalFee,
    yieldEnabled,
    treasuryFeeBps
  );

  const smartHook = SmartHooks.useSmartCreateFlexible(
    members,
    minimumDeposit,
    withdrawalFee,
    yieldEnabled,
    treasuryFeeBps
  );

  return isSmartAccountReady ? smartHook : eoaHook;
}

export function useUnifiedApproveToken(spender: string, amount: string) {
  const { isSmartAccountReady } = useAccountMode();

  const eoaHook = EOAHooks.useApproveToken(spender, amount);
  const smartHook = SmartHooks.useSmartApproveToken(spender, amount);

  return isSmartAccountReady ? smartHook : eoaHook;
}

// ENHANCED: Deposit hooks now track payments automatically
export function useUnifiedRotationalDeposit(poolAddress: string, poolId: string) {
  const { isSmartAccountReady } = useAccountMode();
  const { address } = useAccount();

  const eoaHook = EOAHooks.useRotationalDeposit(poolAddress);
  const smartHook = SmartHooks.useSmartRotationalDeposit(poolAddress);

  const baseHook = isSmartAccountReady ? smartHook : eoaHook;

  // Track payment automatically when successful
  usePaymentTracker({
    poolId,
    memberAddress: address,
    txHash: baseHook.hash,
    wasOnTime: true,
    isSuccess: baseHook.isSuccess,
  });

  return baseHook;
}

export function useUnifiedTargetContribute(poolAddress: string, amount: string, poolId: string) {
  const { isSmartAccountReady } = useAccountMode();
  const { address } = useAccount();

  const eoaHook = EOAHooks.useTargetContribute(poolAddress, amount);
  const smartHook = SmartHooks.useSmartTargetContribute(poolAddress, amount);

  const baseHook = isSmartAccountReady ? smartHook : eoaHook;

  // Track payment automatically when successful
  usePaymentTracker({
    poolId,
    memberAddress: address,
    amount,
    txHash: baseHook.hash,
    wasOnTime: true,
    isSuccess: baseHook.isSuccess,
  });

  return baseHook;
}

export function useUnifiedTargetWithdraw(poolAddress: string) {
  const { isSmartAccountReady } = useAccountMode();

  const eoaHook = EOAHooks.useTargetWithdraw(poolAddress);
  const smartHook = SmartHooks.useSmartTargetWithdraw(poolAddress);

  return isSmartAccountReady ? smartHook : eoaHook;
}

export function useUnifiedFlexibleDeposit(poolAddress: string, amount: string, poolId: string) {
  const { isSmartAccountReady } = useAccountMode();
  const { address } = useAccount();

  const eoaHook = EOAHooks.useFlexibleDeposit(poolAddress, amount);
  const smartHook = SmartHooks.useSmartFlexibleDeposit(poolAddress, amount);

  const baseHook = isSmartAccountReady ? smartHook : eoaHook;

  // Track payment automatically when successful
  usePaymentTracker({
    poolId,
    memberAddress: address,
    amount,
    txHash: baseHook.hash,
    wasOnTime: true,
    isSuccess: baseHook.isSuccess,
  });

  return baseHook;
}

export function useUnifiedFlexibleWithdraw(poolAddress: string, amount: string) {
  const { isSmartAccountReady } = useAccountMode();

  const eoaHook = EOAHooks.useFlexibleWithdraw(poolAddress, amount);
  const smartHook = SmartHooks.useSmartFlexibleWithdraw(poolAddress, amount);

  return isSmartAccountReady ? smartHook : eoaHook;
}