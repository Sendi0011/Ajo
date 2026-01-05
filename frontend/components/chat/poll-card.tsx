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

