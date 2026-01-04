"use client"

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Pin, Reply, ThumbsUp, Smile } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import { toast } from 'sonner'

interface ChatMessageProps {
  message: ChatMessageType
  isOwnMessage: boolean
  showAvatar: boolean
  poolId: string
}

export function ChatMessage({ message, isOwnMessage, showAvatar, poolId }: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handlePinMessage = async () => {
    try {
      const response = await fetch('/api/chat/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pool_id: poolId,
          message_id: message.id,
          message_content: message.content,
          message_sender: message.senderAddress,
        }),
      })

      if (response.ok) {
        toast.success('Message pinned!')
      } else {
        toast.error('Failed to pin message')
      }
    } catch (error) {
      console.error('Failed to pin message:', error)
      toast.error('Failed to pin message')
    }
  }

  const handleReaction = (emoji: string) => {
    toast.success(`Reacted with ${emoji}`)
    // In production, store reactions in database or XMTP metadata
  }

  return (
    <div
      className={cn(
        "flex gap-3 group",
        isOwnMessage && "flex-row-reverse"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {message.senderAddress.slice(2, 4).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      
      {!showAvatar && <div className="h-8 w-8 flex-shrink-0" />}

      <div className={cn("flex-1 space-y-1", isOwnMessage && "text-right")}>
        {showAvatar && (
          <div className={cn("flex items-center gap-2 text-xs", isOwnMessage && "justify-end")}>
            <span className="font-medium font-mono">
              {formatAddress(message.senderAddress)}
            </span>
            <span className="text-muted-foreground">
              {formatDistanceToNow(message.timestamp, { addSuffix: true })}
            </span>
          </div>
        )}

        <div className={cn("flex gap-2 items-start", isOwnMessage && "justify-end")}>
          <div
            className={cn(
              "rounded-2xl px-4 py-2 max-w-[80%] break-words",
              isOwnMessage
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-muted rounded-tl-sm"
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {message.isPinned && (
              <div className="mt-2 pt-2 border-t border-current/20">
                <Badge variant="secondary" className="text-xs">
                  <Pin className="h-3 w-3 mr-1" />
                  Pinned
                </Badge>
              </div>
            )}
          </div>

          {showActions && (
            <div className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity flex gap-1",
              isOwnMessage && "flex-row-reverse"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleReaction('👍')}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isOwnMessage ? "end" : "start"}>
                  <DropdownMenuItem onClick={() => handleReaction('😊')}>
                    <Smile className="h-4 w-4 mr-2" />
                    React
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info('Reply feature coming soon!')}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  {!isOwnMessage && (
                    <DropdownMenuItem onClick={handlePinMessage}>
                      <Pin className="h-4 w-4 mr-2" />
                      Pin Message
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Reactions (if any) */}
        {message.reactions && message.reactions.length > 0 && (
          <div className={cn("flex gap-1 mt-1", isOwnMessage && "justify-end")}>
            {message.reactions.map((reaction, idx) => (
              <button
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted hover:bg-muted/80 text-xs transition-colors"
                onClick={() => handleReaction(reaction.emoji)}
              >
                <span>{reaction.emoji}</span>
                <span className="text-muted-foreground">{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}