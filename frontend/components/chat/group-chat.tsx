"use client"

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Users, Pin, Search, Settings } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useXMTP } from '@/contexts/XMTPProvider'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { ChatHeader } from './chat-header'
import { ChatPinnedMessages } from './chat-pinned-messages'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface GroupChatProps {
  poolId: string
  poolName: string
  memberAddresses: string[]
}

export function GroupChat({ poolId, poolName, memberAddresses }: GroupChatProps) {
  const { address } = useAccount()
  const { client, isLoading: xmtpLoading, initializeClient, isInitialized } = useXMTP()
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeTab, setActiveTab] = useState<'chat' | 'pinned' | 'members'>('chat')

  // Initialize XMTP when chat is opened
  useEffect(() => {
    if (isOpen && !isInitialized && address) {
      initializeClient()
    }
  }, [isOpen, isInitialized, address])

  // Simulate unread count (in real app, this would come from read receipts)
  useEffect(() => {
    if (!isOpen) {
      // Could fetch actual unread count from API
      // For now, just demonstration
    }
  }, [isOpen])

  const handleOpenChat = () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }
    setIsOpen(true)
    setUnreadCount(0) // Clear unread when opened
  }

  
}