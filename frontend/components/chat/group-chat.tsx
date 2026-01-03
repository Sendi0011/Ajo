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

