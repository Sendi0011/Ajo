"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ThumbsUp, 
  ThumbsDown,
  Loader2,
  XCircle,
} from "lucide-react"
import { useAccount } from "wagmi"
import { formatEther } from "viem"
import {
  useRequestEmergencyWithdrawal,
  useVoteOnEmergencyRequest,
  useExecuteEmergencyRequest,
  useEmergencyRequest,
  useEmergencyRequestCount,
  useHasVoted,
  useEmergencyUsageCount,
} from "@/hooks/useEmergencyWithdrawal"

// Request Emergency Withdrawal Modal
export function EmergencyWithdrawalRequest({ poolAddress }: { poolAddress: string }) {
  const { address } = useAccount()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  const { request, isLoading, isSuccess } = useRequestEmergencyWithdrawal(poolAddress)
  const { usageCount } = useEmergencyUsageCount(poolAddress, address)

  const handleSubmit = () => {
    setError("")

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (!reason || reason.trim().length < 10) {
      setError("Please provide a detailed reason (minimum 10 characters)")
      return
    }

    if (reason.length > 500) {
      setError("Reason is too long (maximum 500 characters)")
      return
    }

    request(amount, reason)
  }

  // Close modal on success
  if (isSuccess && open) {
    setTimeout(() => {
      setOpen(false)
      setAmount("")
      setReason("")
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <AlertCircle className="mr-2 h-4 w-4" />
          Request Emergency Withdrawal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Emergency Withdrawal Request
          </DialogTitle>
          <DialogDescription>
            Request an emergency withdrawal from the pool. Other members will vote on your request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning Banner */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-destructive">Important Notice</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>A 10% penalty will be deducted from your withdrawal</li>
                  <li>Members have 2 days to vote on your request</li>
                  <li>Simple majority (50%+) required for approval</li>
                  <li>You have used emergency withdrawal {usageCount} time(s)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="amount">Withdrawal Amount (ETH)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason for Emergency Withdrawal *</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a detailed explanation of why you need this emergency withdrawal. Your group members will review this before voting."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
                rows={5}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {reason.length}/500 characters (minimum 10 required)
              </p>
            </div>
          </div>

          {error && (
            <div className="flex gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isSuccess && (
            <div className="flex gap-2 p-3 rounded-lg bg-green-500/10 text-green-600">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">Emergency request submitted successfully!</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Emergency Request Card
export function EmergencyRequestCard({ 
  poolAddress, 
  requestId,
  totalMembers,
}: { 
  poolAddress: string
  requestId: number
  totalMembers: number
}) {
  const { address } = useAccount()
  const { request, isLoading, refetch } = useEmergencyRequest(poolAddress, requestId)
  const { hasVoted } = useHasVoted(poolAddress, requestId, address)
  const { vote, isLoading: isVoting } = useVoteOnEmergencyRequest(poolAddress)
  const { execute, isLoading: isExecuting } = useExecuteEmergencyRequest(poolAddress)

  if (isLoading || !request) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  const isRequester = address?.toLowerCase() === request.requester.toLowerCase()
  const now = Math.floor(Date.now() / 1000)
  const isVotingActive = now <= request.votingDeadline && !request.executed && !request.rejected
  const requiredVotes = Math.ceil((totalMembers - 1) / 2)
  const hasEnoughVotes = request.votesFor >= requiredVotes
  const canExecute = hasEnoughVotes && !request.executed && !request.rejected

  const getStatusBadge = () => {
    if (request.executed) {
      return <Badge className="bg-green-500">Executed</Badge>
    }
    if (request.rejected) {
      return <Badge variant="destructive">Rejected</Badge>
    }
    if (isVotingActive) {
      return <Badge variant="secondary">Voting Active</Badge>
    }
    return <Badge variant="outline">Voting Ended</Badge>
  }

  const handleVote = (support: boolean) => {
    vote(requestId, support)
    setTimeout(() => refetch(), 2000)
  }

  const handleExecute = () => {
    execute(requestId)
    setTimeout(() => refetch(), 2000)
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">Request #{requestId}</h4>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              Requested by {isRequester ? "You" : `${request.requester.slice(0, 6)}...${request.requester.slice(-4)}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{formatEther(request.amount)} ETH</p>
            <p className="text-xs text-muted-foreground">
              -{(parseFloat(formatEther(request.amount)) * 0.1).toFixed(4)} ETH penalty
            </p>
          </div>
        </div>

        <Separator />

        {/* Reason */}
        <div>
          <Label className="text-xs text-muted-foreground">Reason</Label>
          <p className="text-sm mt-1">{request.reason}</p>
        </div>

        <Separator />

        {/* Voting Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              <span className="font-semibold">{request.votesFor} For</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {requiredVotes} needed to pass
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-red-600" />
              <span className="font-semibold">{request.votesAgainst} Against</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {totalMembers - 1 - request.votesFor - request.votesAgainst} not voted
            </p>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {isVotingActive 
              ? `Voting ends in ${Math.ceil((request.votingDeadline - now) / 3600)} hours`
              : `Voting ended ${new Date(request.votingDeadline * 1000).toLocaleDateString()}`
            }
          </span>
        </div>

        {/* Action Buttons */}
        {!isRequester && isVotingActive && !hasVoted && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
              onClick={() => handleVote(true)}
              disabled={isVoting}
            >
              {isVoting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
              onClick={() => handleVote(false)}
              disabled={isVoting}
            >
              {isVoting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          </div>
        )}

        {hasVoted && !request.executed && !request.rejected && (
          <div className="flex gap-2 p-3 rounded-lg bg-blue-50 text-blue-600">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">You have already voted on this request</p>
          </div>
        )}

        {canExecute && (
          <Button 
            className="w-full" 
            onClick={handleExecute}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Executing...
              </>
            ) : (
              "Execute Withdrawal"
            )}
          </Button>
        )}
      </div>
    </Card>
  )
}

// Emergency Requests List
export function EmergencyRequestsList({ 
  poolAddress,
  totalMembers,
}: { 
  poolAddress: string
  totalMembers: number
}) {
  const { count, isLoading } = useEmergencyRequestCount(poolAddress)

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </Card>
    )
  }

  if (count === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-1">No Emergency Requests</h3>
          <p className="text-sm text-muted-foreground">
            There are currently no emergency withdrawal requests for this pool.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Emergency Requests ({count})
      </h3>
      {Array.from({ length: count }, (_, i) => count - 1 - i).map((requestId) => (
        <EmergencyRequestCard
          key={requestId}
          poolAddress={poolAddress}
          requestId={requestId}
          totalMembers={totalMembers}
        />
      ))}
    </div>
  )
}