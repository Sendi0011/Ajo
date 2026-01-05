"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart3, Check, Clock, Lock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'
import type { Poll } from '@/types/chat'

interface PollCardProps {
  poll: Poll & {
    options: Array<{
      id: string
      option_text: string
      vote_count: number
    }>
    votes?: Array<{
      voter_address: string
      option_id: string
    }>
  }
  onVoteUpdate?: () => void
}

export function PollCard({ poll, onVoteUpdate }: PollCardProps) {
  const { address } = useAccount()
  const [isVoting, setIsVoting] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  // Check if user has voted
  const userVote = poll.votes?.find(
    v => v.voter_address.toLowerCase() === address?.toLowerCase()
  )
  const hasVoted = !!userVote

  // Calculate total votes
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.vote_count, 0)

  // Check if poll is closed
  const isClosed = !poll.is_active || (poll.closes_at && new Date(poll.closes_at) < new Date())

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleVote = async (optionId: string) => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    if (isClosed) {
      toast.error('This poll is closed')
      return
    }

    setIsVoting(true)
    setSelectedOption(optionId)

    try {
      const response = await fetch('/api/chat/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poll_id: poll.id,
          option_id: optionId,
          voter_address: address,
        }),
      })

      if (response.ok) {
        toast.success(hasVoted ? 'Vote changed!' : 'Vote recorded!')
        onVoteUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to vote')
      }
    } catch (error) {
      console.error('Failed to vote:', error)
      toast.error('Failed to vote')
    } finally {
      setIsVoting(false)
      setSelectedOption(null)
    }
  }

  const getOptionPercentage = (voteCount: number) => {
    if (totalVotes === 0) return 0
    return Math.round((voteCount / totalVotes) * 100)
  }

  return (
    <Card className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{poll.question}</h4>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              by {formatAddress(poll.creator_address)}
            </p>
          </div>
        </div>

        {isClosed ? (
          <Badge variant="secondary" className="flex-shrink-0">
            <Lock className="h-3 w-3 mr-1" />
            Closed
          </Badge>
        ) : poll.closes_at ? (
          <Badge variant="outline" className="flex-shrink-0">
            <Clock className="h-3 w-3 mr-1" />
            {formatDistanceToNow(new Date(poll.closes_at), { addSuffix: true })}
          </Badge>
        ) : (
          <Badge className="flex-shrink-0 bg-green-500/10 text-green-500">
            Active
          </Badge>
        )}
      </div>

      
  )
}