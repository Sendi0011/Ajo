"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Settings } from 'lucide-react'

interface ChatHeaderProps {
  poolName: string
  memberCount: number
  onSettingsClick: () => void
}

