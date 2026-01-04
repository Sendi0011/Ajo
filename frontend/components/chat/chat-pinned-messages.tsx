"use client"

import { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pin, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import type { PinnedMessage } from '@/types/chat'

interface ChatPinnedMessagesProps {
  poolId: string
}

export function ChatPinnedMessages({ poolId }: ChatPinnedMessagesProps) {
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPinnedMessages()
  }, [poolId])

  const fetchPinnedMessages = async () => {
    try {
      const response = await fetch(`/api/chat/pins?pool_id=${poolId}`)
      if (response.ok) {
        const data = await response.json()
        setPinnedMessages(data)
      }
    } catch (error) {
      console.error('Failed to fetch pinned messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnpin = async (messageId: string) => {
    try {
      const response = await fetch(`/api/chat/pins?message_id=${messageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPinnedMessages(prev => prev.filter(m => m.message_id !== messageId))
        toast.success('Message unpinned')
      } else {
        toast.error('Failed to unpin message')
      }
    } catch (error) {
      console.error('Failed to unpin message:', error)
      toast.error('Failed to unpin message')
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (pinnedMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Pin className="h-12 w-12 text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          No pinned messages yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Pin important messages to keep them easily accessible
        </p>
      </div>
    )
  }

  
}