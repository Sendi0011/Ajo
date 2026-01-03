"use client"

import { useState, useRef, useEffect } from 'react'
import { Client, Conversation } from '@xmtp/xmtp-js'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Paperclip, Smile, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ChatInputProps {
  poolId: string
  memberAddresses: string[]
  client: Client
}

