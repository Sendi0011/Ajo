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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative"
          onClick={handleOpenChat}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Group Chat
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:w-[540px] p-0 flex flex-col">
        <SheetHeader className="p-4 pb-0">
          <ChatHeader 
            poolName={poolName} 
            memberCount={memberAddresses.length}
            onSettingsClick={() => setActiveTab('members')}
          />
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
            <TabsTrigger value="chat" className="text-xs">
              <MessageCircle className="h-3 w-3 mr-1" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="pinned" className="text-xs">
              <Pin className="h-3 w-3 mr-1" />
              Pinned
            </TabsTrigger>
            <TabsTrigger value="members" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0">
            {xmtpLoading || !isInitialized ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">Initializing secure chat...</p>
                </div>
              </div>
            ) : !client ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-3">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">Failed to initialize chat</p>
                  <Button onClick={initializeClient} size="sm">Try Again</Button>
                </div>
              </div>
            ) : (
              <>
                <ChatMessages 
                  poolId={poolId}
                  poolName={poolName}
                  memberAddresses={memberAddresses}
                  client={client}
                />
                <div className="border-t p-4">
                  <ChatInput 
                    poolId={poolId}
                    memberAddresses={memberAddresses}
                    client={client}
                  />
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="pinned" className="flex-1 m-0 p-0 overflow-hidden">
            <ChatPinnedMessages poolId={poolId} />
          </TabsContent>

          <TabsContent value="members" className="flex-1 m-0 p-0 overflow-hidden">
            <div className="p-4 space-y-3 overflow-y-auto h-full">
              <h3 className="text-sm font-semibold">Members ({memberAddresses.length})</h3>
              {memberAddresses.map((addr) => (
                <div 
                  key={addr} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {addr.slice(2, 4).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm truncate">{addr}</p>
                    <p className="text-xs text-muted-foreground">Member</p>
                  </div>
                  {addr === address && (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}