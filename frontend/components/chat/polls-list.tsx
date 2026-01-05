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

  
}