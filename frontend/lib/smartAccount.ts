import { createSmartAccountClient, BiconomySmartAccountV2 } from "@biconomy/account";
import { type WalletClient } from "viem";
import { base, baseSepolia } from "viem/chains";

// Get Biconomy API keys from environment
const BICONOMY_BUNDLER_URL = process.env.NEXT_PUBLIC_BICONOMY_BUNDLER_URL;
const BICONOMY_PAYMASTER_URL = process.env.NEXT_PUBLIC_BICONOMY_PAYMASTER_URL;

export async function getSmartAccount(
  walletClient: WalletClient,
  chainId: number
): Promise<BiconomySmartAccountV2 | null> {
  try {
    // Determine which chain we're on
    const chain = chainId === base.id ? base : chainId === baseSepolia.id ? baseSepolia : null;

    if (!chain) {
      console.warn("Unsupported chain. Please use Base or Base Sepolia");
      return null;
    }

    // Get the bundler and paymaster URLs
    // You can use Biconomy's free tier or your own keys
    const bundlerUrl = BICONOMY_BUNDLER_URL || `https://bundler.biconomy.io/api/v2/${chainId}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44`;
    const paymasterUrl = BICONOMY_PAYMASTER_URL || `https://paymaster.biconomy.io/api/v1/${chainId}/YOUR_PAYMASTER_KEY`;

    // Create smart account client
    const smartAccount = await createSmartAccountClient({
      signer: walletClient,
      bundlerUrl,
      biconomyPaymasterApiKey: paymasterUrl,
      rpcUrl: chain.rpcUrls.default.http[0],
    });

    console.log("Smart Account Address:", await smartAccount.getAccountAddress());

    return smartAccount;
  } catch (error) {
    console.error("Error creating smart account:", error);
    return null;
  }
}

