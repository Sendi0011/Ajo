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

export function PollCreator({ poolId, onPollCreated }: PollCreatorProps) {
  const { address } = useAccount()
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [hasDeadline, setHasDeadline] = useState(false)
  const [hoursUntilClose, setHoursUntilClose] = useState(24)
  const [isCreating, setIsCreating] = useState(false)

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ''])
    } else {
      toast.error('Maximum 6 options allowed')
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    } else {
      toast.error('Minimum 2 options required')
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleCreate = async () => {
    if (!address) {
      toast.error('Please connect your wallet')
      return
    }

    if (!question.trim()) {
      toast.error('Please enter a question')
      return
    }

    const validOptions = options.filter(opt => opt.trim())
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/chat/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pool_id: poolId,
          creator_address: address,
          question: question.trim(),
          options: validOptions,
          closes_in_hours: hasDeadline ? hoursUntilClose : null,
        }),
      })

      if (response.ok) {
        toast.success('Poll created! 🗳️')
        setOpen(false)
        resetForm()
        onPollCreated?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create poll')
      }
    } catch (error) {
      console.error('Failed to create poll:', error)
      toast.error('Failed to create poll')
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setQuestion('')
    setOptions(['', ''])
    setHasDeadline(false)
    setHoursUntilClose(24)
  }

  
}