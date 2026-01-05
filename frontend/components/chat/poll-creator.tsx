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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <BarChart3 className="h-4 w-4 mr-2" />
          Create Poll
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Poll</DialogTitle>
          <DialogDescription>
            Ask a question and let members vote on the options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              placeholder="What should we do?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {question.length}/200 characters
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label>Options</Label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    maxLength={100}
                  />
                  {options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <Button
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            )}
          </div>

          {/* Deadline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="deadline">Set Deadline</Label>
              <Switch
                id="deadline"
                checked={hasDeadline}
                onCheckedChange={setHasDeadline}
              />
            </div>

            {hasDeadline && (
              <div className="space-y-2">
                <Label htmlFor="hours">Close after (hours)</Label>
                <Input
                  id="hours"
                  type="number"
                  min={1}
                  max={720}
                  value={hoursUntilClose}
                  onChange={(e) => setHoursUntilClose(parseInt(e.target.value) || 24)}
                />
                <p className="text-xs text-muted-foreground">
                  Poll will close in {hoursUntilClose} hours (
                  {new Date(Date.now() + hoursUntilClose * 60 * 60 * 1000).toLocaleString()}
                  )
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Poll'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}