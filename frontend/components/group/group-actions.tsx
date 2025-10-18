"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { useAccount } from "wagmi"

export function GroupActions({ groupId }: { groupId: string }) {
  const { address } = useAccount()
  const [isDepositing, setIsDepositing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")

  const handleDeposit = async () => {
    setIsDepositing(true)
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("[v0] Depositing:", depositAmount, "ETH to group", groupId)
    setIsDepositing(false)
    setDepositAmount("")
  }

  const handleWithdraw = async () => {
    setIsWithdrawing(true)
    // Simulate transaction
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("[v0] Withdrawing:", withdrawAmount, "ETH from group", groupId)
    setIsWithdrawing(false)
    setWithdrawAmount("")
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="deposit">Deposit Amount (ETH)</Label>
          <Input
            id="deposit"
            type="number"
            step="0.01"
            placeholder="0.5"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
          <Button
            className="w-full bg-primary hover:bg-primary/90"
            onClick={handleDeposit}
            disabled={isDepositing || !depositAmount}
          >
            {isDepositing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Deposit
              </>
            )}
          </Button>
        </div>

        <div className="border-t border-border pt-6 space-y-3">
          <Label htmlFor="withdraw">Withdraw Amount (ETH)</Label>
          <Input
            id="withdraw"
            type="number"
            step="0.01"
            placeholder="0.5"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={handleWithdraw}
            disabled={isWithdrawing || !withdrawAmount}
          >
            {isWithdrawing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowDownLeft className="mr-2 h-4 w-4" />
                Withdraw
              </>
            )}
          </Button>
        </div>

        <div className="border-t border-border pt-6">
          <p className="text-xs text-muted-foreground mb-2">Your wallet</p>
          <p className="text-sm font-mono bg-muted/30 p-2 rounded">{address}</p>
        </div>
      </div>
    </Card>
  )
}
