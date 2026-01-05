"use client"

import { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PollCard } from './poll-card'
import { PollCreator } from './poll-creator'
import { Loader2, BarChart3 } from 'lucide-react'
import type { Poll } from '@/types/chat'

interface PollsListProps {
  poolId: string
}

export function PollsList({ poolId }: PollsListProps) {
  const [polls, setPolls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPolls()
  }, [poolId])

  const fetchPolls = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/chat/polls?pool_id=${poolId}`)
      if (response.ok) {
        const data = await response.json()
        setPolls(data)
      }
    } catch (error) {
      console.error('Failed to fetch polls:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading polls...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with Create button */}
      <div className="p-4 border-b">
        <PollCreator poolId={poolId} onPollCreated={fetchPolls} />
      </div>

      {/* Polls list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {polls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                No polls yet
              </p>
              <p className="text-xs text-muted-foreground">
                Create the first poll to gather group opinions
              </p>
            </div>
          ) : (
            <>
              {/* Active polls */}
              {polls.filter(p => p.is_active).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Active Polls
                  </h3>
                  {polls
                    .filter(p => p.is_active)
                    .map(poll => (
                      <PollCard
                        key={poll.id}
                        poll={poll}
                        onVoteUpdate={fetchPolls}
                      />
                    ))}
                </div>
              )}

              {/* Closed polls */}
              {polls.filter(p => !p.is_active).length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Closed Polls
                  </h3>
                  {polls
                    .filter(p => !p.is_active)
                    .map(poll => (
                      <PollCard
                        key={poll.id}
                        poll={poll}
                        onVoteUpdate={fetchPolls}
                      />
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}