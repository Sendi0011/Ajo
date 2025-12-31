"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowUpRight, ArrowDownLeft, Check, AlertCircle } from "lucide-react"
import { useAccount } from "wagmi"
import { toast } from "sonner"
import {
  useApproveToken,
  useRotationalDeposit,
  useTargetContribute,
  useTargetWithdraw,
  useFlexibleDeposit,
  useFlexibleWithdraw,
} from "@/hooks/useBaseSafeContracts"
import { EmergencyWithdrawalRequest, EmergencyRequestsList } from "@/components/group/emergency-withdrawal"
import { QRInviteDialog } from "@/components/group/qr-invite-dialog"
import { updateReputationAfterPayment } from "@/lib/supabase"
import { triggerBadgeCheck } from "@/lib/badge-system"

interface GroupActionsProps {
  groupId: string
  poolAddress: string
  poolType: "rotational" | "target" | "flexible"
  tokenAddress: string
  totalMembers: number
  poolName?: string
}

export function GroupActions({
  groupId,
  poolAddress,
  poolType,
  tokenAddress,
  totalMembers,
  poolName = "Savings Group",
}: GroupActionsProps) {
  const { address } = useAccount()
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [approved, setApproved] = useState(false)
  const [error, setError] = useState("")

  // Approval hook
  const approveToken = useApproveToken(poolAddress, depositAmount)

  // Pool-specific hooks
  const rotationalDeposit = useRotationalDeposit(poolAddress)
  const targetContribute = useTargetContribute(poolAddress, depositAmount)
  const targetWithdraw = useTargetWithdraw(poolAddress)
  const flexibleDeposit = useFlexibleDeposit(poolAddress, depositAmount)
  const flexibleWithdraw = useFlexibleWithdraw(poolAddress, withdrawAmount)

  // Handle approval + transaction flow
  useEffect(() => {
    if (approveToken.isSuccess) {
      setApproved(true)
      setIsApproving(false)
    }
  }, [approveToken.isSuccess])

  // Handle successful deposits - Update reputation
  useEffect(() => {
    const handleDepositSuccess = async () => {
      if (!address) return

      let isSuccess = false
      if (poolType === "rotational" && rotationalDeposit.isSuccess) {
        isSuccess = true
      } else if (poolType === "target" && targetContribute.isSuccess) {
        isSuccess = true
      } else if (poolType === "flexible" && flexibleDeposit.isSuccess) {
        isSuccess = true
      }

      if (isSuccess) {
        try {
          // Update reputation (assuming on-time since they just deposited)
          await updateReputationAfterPayment(address, groupId, true)
          
          // Check for new badges
          const badgeResult = await triggerBadgeCheck(address, 'payment_made')
          
          if (badgeResult.newBadges && badgeResult.newBadges.length > 0) {
            toast.success(`🎉 You earned ${badgeResult.newBadges.length} new badge(s)!`)
          } else {
            toast.success("Deposit successful! Reputation updated.")
          }

          // Reset form
          setDepositAmount("")
          setApproved(false)
        } catch (error) {
          console.error("Failed to update reputation:", error)
          toast.success("Deposit successful!")
        }
      }
    }

    handleDepositSuccess()
  }, [
    rotationalDeposit.isSuccess,
    targetContribute.isSuccess,
    flexibleDeposit.isSuccess,
    address,
    groupId,
    poolType
  ])

  const handleApproveAndDeposit = async () => {
    setError("")
    if (!address) {
      setError("Please connect your wallet first")
      return
    }
    setIsApproving(true)
    if (approveToken.approve) {
      approveToken.approve()
    }
  }

  const handleDeposit = async () => {
    setError("")
    if (!depositAmount || !address) {
      setError("Please enter an amount")
      return
    }

    // If not approved yet, approve first
    if (!approved) {
      await handleApproveAndDeposit()
      return
    }

    // Call appropriate deposit function
    if (poolType === "rotational") {
      rotationalDeposit.deposit?.()
    } else if (poolType === "target") {
      targetContribute.contribute?.()
    } else if (poolType === "flexible") {
      flexibleDeposit.deposit?.()
    }
  }

  const handleWithdraw = async () => {
    setError("")
    if (!withdrawAmount || !address) {
      setError("Please enter an amount")
      return
    }

    if (poolType === "target") {
      targetWithdraw.withdraw?.()
    } else if (poolType === "flexible") {
      flexibleWithdraw.withdraw?.()
    }
  }

  const isDepositLoading =
    poolType === "rotational"
      ? rotationalDeposit.isLoading
      : poolType === "target"
        ? targetContribute.isLoading
        : flexibleDeposit.isLoading

  const isWithdrawLoading =
    poolType === "target"
      ? targetWithdraw.isLoading
      : flexibleWithdraw.isLoading

  const isRotational = poolType === "rotational"
  const isTarget = poolType === "target"
  const isFlexible = poolType === "flexible"

  return (
    <div className="space-y-6">
      {/* Invite Card - NEW */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="space-y-2">
          <p className="text-sm font-medium">Invite Members</p>
          <p className="text-xs text-muted-foreground">
            Share this group with friends using QR codes or invite links
          </p>
          <QRInviteDialog poolId={groupId} poolName={poolName} />
        </div>
      </Card>

      <Card className="p-6">
        <Tabs defaultValue="actions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="actions">Quick Actions</TabsTrigger>
            <TabsTrigger value="emergency">Emergency</TabsTrigger>
          </TabsList>

          <TabsContent value="actions" className="space-y-6 mt-6">
            {error && (
              <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 text-destructive mb-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* DEPOSIT SECTION */}
            <div className="space-y-3">
              <Label htmlFor="deposit">
                {isRotational
                  ? "Deposit Fixed Amount (ETH)"
                  : isTarget
                    ? "Contribute Amount (ETH)"
                    : "Deposit Amount (ETH)"}
              </Label>
              <Input
                id="deposit"
                type="number"
                step="0.01"
                placeholder="0.5"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={isDepositLoading || isApproving}
              />
              <p className="text-xs text-muted-foreground">
                {isRotational &&
                  "Deposit the fixed pool amount. Same amount for all members."}
                {isTarget && "Contribute any amount toward the target goal."}
                {isFlexible &&
                  "Deposit any amount (must meet minimum). Withdraw anytime."}
              </p>
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={handleDeposit}
                disabled={isDepositLoading || isApproving || !depositAmount || !address}
              >
                {isDepositLoading || isApproving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {approved ? "Depositing..." : "Approving..."}
                  </>
                ) : approved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    {isRotational ? "Deposit" : isTarget ? "Contribute" : "Deposit"}
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    {isRotational ? "Deposit" : isTarget ? "Contribute" : "Deposit"}
                  </>
                )}
              </Button>
            </div>

            {/* WITHDRAW SECTION */}
            {!isRotational && (
              <div className="border-t border-border pt-6 space-y-3">
                <Label htmlFor="withdraw">
                  {isTarget ? "Withdraw Share (ETH)" : "Withdraw Amount (ETH)"}
                </Label>
                <Input
                  id="withdraw"
                  type="number"
                  step="0.01"
                  placeholder="0.5"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  disabled={isWithdrawLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {isTarget &&
                    "Withdraw after target reached or deadline passed."}
                  {isFlexible && "Withdraw anytime. Exit fee will be deducted."}
                </p>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={handleWithdraw}
                  disabled={isWithdrawLoading || !withdrawAmount || !address}
                >
                  {isWithdrawLoading ? (
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
            )}

            {isRotational && (
              <div className="border-t border-border pt-6 bg-blue-50 dark:bg-blue-950 p-3 rounded">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Rotational Pool:</strong> No direct withdrawals.
                  Payouts are automatic when your turn comes. A relayer triggers
                  payouts on schedule.
                </p>
              </div>
            )}

            {/* WALLET INFO */}
            <div className="border-t border-border pt-6">
              <p className="text-xs text-muted-foreground mb-2">Your wallet</p>
              <p className="text-sm font-mono bg-muted/30 p-2 rounded break-all">
                {address || "Not connected"}
              </p>
            </div>

            {/* Reputation Info - NEW */}
            <div className="border-t border-border pt-6 bg-muted/30 p-4 rounded-lg">
              <p className="text-xs font-semibold mb-2">💡 Earn Reputation</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• On-time deposits: <strong>+5 reputation points</strong></li>
                <li>• Complete this group: <strong>+10 reputation points</strong></li>
                <li>• Unlock badges and premium features</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  ⚠️ Emergency withdrawals should only be used in genuine emergencies. 
                  A 10% penalty applies and requires group approval.
                </p>
              </div>

              <EmergencyWithdrawalRequest poolAddress={poolAddress} />
              
              <div className="border-t border-border pt-6">
                <EmergencyRequestsList 
                  poolAddress={poolAddress} 
                  totalMembers={totalMembers}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}