"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Wallet, Sparkles, Info } from "lucide-react";
import { useAccountMode } from "@/hooks/useUnifiedContracts";
import { useAccount } from "wagmi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function WalletModeToggle() {
  const { useSmartWallet, toggleMode, isSmartAccountReady, smartAccount } =
    useAccountMode();
  const { address } = useAccount();

  if (!address) return null;

  return (
    <Card className="p-4 border-2 border-primary/20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {useSmartWallet ? (
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-muted">
              <Wallet className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Label htmlFor="smart-wallet" className="font-semibold cursor-pointer">
                {useSmartWallet ? "Smart Wallet Mode" : "Regular Wallet Mode"}
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      <strong>Smart Wallet:</strong> Gasless transactions, better security, and advanced features.
                      <br /><br />
                      <strong>Regular Wallet:</strong> Traditional wallet like MetaMask. You pay gas fees.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {useSmartWallet
                ? "🎉 Gasless transactions enabled! No gas fees required."
                : "Traditional wallet mode. Gas fees required for transactions."}
            </p>
          </div>
        </div>

        <Switch
          id="smart-wallet"
          checked={useSmartWallet}
          onCheckedChange={toggleMode}
        />
      </div>

      {useSmartWallet && isSmartAccountReady && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">
            Smart Account Status: <span className="text-green-600 font-semibold">✓ Active</span>
          </p>
          <p className="text-xs font-mono bg-muted/30 p-2 rounded break-all">
            {smartAccount ? "Smart account initialized" : "Initializing..."}
          </p>
        </div>
      )}

      {useSmartWallet && !isSmartAccountReady && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-amber-600">
            ⚠️ Smart account initializing... Please wait.
          </p>
        </div>
      )}
    </Card>
  );
}