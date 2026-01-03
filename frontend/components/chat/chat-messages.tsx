"use client"

import { useEffect, useState, useRef } from 'react'
import { Client, Conversation } from '@xmtp/xmtp-js'
import { useAccount } from 'wagmi'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './chat-message'
import { Loader2 } from 'lucide-react'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

interface ChatMessagesProps {
  poolId: string
  poolName: string
  memberAddresses: string[]
  client: Client
}

export function ChatMessages({ poolId, poolName, memberAddresses, client }: ChatMessagesProps) {
  const { address } = useAccount()
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Create a unique conversation topic for this pool
  const conversationTopic = `ajo-pool-${poolId}`

  useEffect(() => {
    if (!client || !address) return

    const initConversation = async () => {
      try {
        setIsLoading(true)

        // In XMTP, we need to create a group conversation
        // For now, we'll use a simple approach with the pool creator as the peer
        // In production, you'd want to use XMTP's group messaging feature
        
        // Get or create conversation with all members
        const conversations = await client.conversations.list()
        let conv = conversations.find(c => c.context?.conversationId === conversationTopic)

        if (!conv && memberAddresses.length > 0) {
          // Create new conversation with the first other member
          // Note: XMTP group messaging is still in development
          // This is a simplified version for demonstration
          const otherMember = memberAddresses.find(addr => addr.toLowerCase() !== address.toLowerCase())
          if (otherMember) {
            conv = await client.conversations.newConversation(otherMember, {
              conversationId: conversationTopic,
              metadata: {
                poolId,
                poolName,
              }
            })
          }
        }

        if (conv) {
          setConversation(conv)
          
          // Load existing messages
          const existingMessages = await conv.messages()
          const formattedMessages: ChatMessageType[] = existingMessages.map((msg) => ({
            id: msg.id,
            senderAddress: msg.senderAddress,
            content: msg.content,
            timestamp: msg.sent,
            contentType: msg.contentType.toString(),
          }))
          setMessages(formattedMessages.reverse())

          // Stream new messages
          const stream = await conv.streamMessages()
          for await (const message of stream) {
            const newMessage: ChatMessageType = {
              id: message.id,
              senderAddress: message.senderAddress,
              content: message.content,
              timestamp: message.sent,
              contentType: message.contentType.toString(),
            }
            setMessages(prev => [...prev, newMessage])
            scrollToBottom()
          }
        }
      } catch (error) {
        console.error('Failed to initialize conversation:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initConversation()
  }, [client, address, conversationTopic, poolId, poolName, memberAddresses])

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Be the first to start the conversation! 👋
          </p>
        </div>
      </div>
    )
  }

  
}