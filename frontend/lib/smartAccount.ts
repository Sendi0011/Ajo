import { createSmartAccountClient, BiconomySmartAccountV2 } from "@biconomy/account";
import { type WalletClient } from "viem";
import { base, baseSepolia } from "viem/chains";

// Get Biconomy API keys from environment
const BICONOMY_BUNDLER_URL = process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL;
const BICONOMY_PAYMASTER_URL = process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL;

