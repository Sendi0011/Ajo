"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Settings } from 'lucide-react'

interface ChatHeaderProps {
  poolName: string
  memberCount: number
  onSettingsClick: () => void
}

export function ChatHeader({ poolName, memberCount, onSettingsClick }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h2 className="text-lg font-semibold truncate">{poolName}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{memberCount} members</span>
          <Badge variant="secondary" className="text-xs">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse" />
            Online
          </Badge>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onSettingsClick}
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  )
}