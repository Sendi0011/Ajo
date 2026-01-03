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

export function ChatInput({ poolId, memberAddresses, client }: ChatInputProps) {
  const { address } = useAccount()
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [mentionPosition, setMentionPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const conversationTopic = `ajo-pool-${poolId}`

  // Handle @mentions
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const handleInput = () => {
      const cursorPos = textarea.selectionStart
      const textBeforeCursor = message.slice(0, cursorPos)
      const lastAtSymbol = textBeforeCursor.lastIndexOf('@')

      if (lastAtSymbol !== -1 && lastAtSymbol === cursorPos - 1) {
        setShowMentions(true)
        setMentionSearch('')
        setMentionPosition(lastAtSymbol)
      } else if (lastAtSymbol !== -1) {
        const searchTerm = textBeforeCursor.slice(lastAtSymbol + 1)
        if (!searchTerm.includes(' ')) {
          setShowMentions(true)
          setMentionSearch(searchTerm.toLowerCase())
          setMentionPosition(lastAtSymbol)
        } else {
          setShowMentions(false)
        }
      } else {
        setShowMentions(false)
      }
    }

    handleInput()
  }, [message])

  const filteredMembers = memberAddresses.filter(addr => 
    addr.toLowerCase().includes(mentionSearch) &&
    addr.toLowerCase() !== address?.toLowerCase()
  )

  const insertMention = (memberAddress: string) => {
    const beforeMention = message.slice(0, mentionPosition)
    const afterMention = message.slice(textareaRef.current?.selectionStart || 0)
    const shortAddress = `${memberAddress.slice(0, 6)}...${memberAddress.slice(-4)}`
    setMessage(`${beforeMention}@${shortAddress} ${afterMention}`)
    setShowMentions(false)
    textareaRef.current?.focus()
  }

  const handleSend = async () => {
    if (!message.trim() || !client || !address) return

    setIsSending(true)
    try {
      // Get or create conversation
      const conversations = await client.conversations.list()
      let conversation = conversations.find(c => c.context?.conversationId === conversationTopic)

      if (!conversation) {
        // Create conversation with first other member
        const otherMember = memberAddresses.find(addr => addr.toLowerCase() !== address.toLowerCase())
        if (!otherMember) {
          toast.error('No other members to chat with')
          return
        }

        conversation = await client.conversations.newConversation(otherMember, {
          conversationId: conversationTopic,
          metadata: {
            poolId,
          }
        })
      }

      // Send message
      await conversation.send(message)
      setMessage('')
      toast.success('Message sent!')
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const createPoll = () => {
    toast.info('Poll creation coming soon! 📊')
    // Will open poll creation dialog
  }

  const attachFile = () => {
    toast.info('File sharing coming soon! 📎')
    // Will open file picker
  }

  return (
    <div className="space-y-2">
      {/* Mention suggestions */}
      {showMentions && filteredMembers.length > 0 && (
        <div className="bg-popover border rounded-lg shadow-lg p-2 space-y-1 max-h-48 overflow-y-auto">
          {filteredMembers.slice(0, 5).map((addr) => (
            <button
              key={addr}
              onClick={() => insertMention(addr)}
              className="w-full text-left px-3 py-2 rounded hover:bg-muted transition-colors text-sm font-mono"
            >
              {addr.slice(0, 6)}...{addr.slice(-4)}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message... (@mention members)"
            className="min-h-[60px] max-h-32 resize-none pr-24"
            disabled={isSending}
          />
          
          <div className="absolute right-2 bottom-2 flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => toast.info('Emoji picker coming soon! 😊')}
            >
              <Smile className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={attachFile}>
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={createPoll}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Create Poll
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          size="icon"
          className="h-[60px] w-12"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send, 
        <kbd className="px-1 py-0.5 bg-muted rounded text-xs ml-1">Shift+Enter</kbd> for new line
      </p>
    </div>
  )
}