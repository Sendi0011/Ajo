"use client"

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { BarChart3, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { useAccount } from 'wagmi'

interface PollCreatorProps {
  poolId: string
  onPollCreated?: () => void
}

