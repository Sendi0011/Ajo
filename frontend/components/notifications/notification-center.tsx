"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Settings,
  X,
  Trash2,
  Filter,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useAccount } from "wagmi"
import { toast } from "sonner"

interface Notification {
  id: string
  user_address: string
  pool_id: string | null
  type: string
  title: string
  message: string
  read: boolean
  action_url: string | null
  created_at: string
  pool?: {
    name: string
  }
}

interface NotificationPreferences {
  deposits: boolean
  withdrawals: boolean
  emergencies: boolean
  payouts: boolean
  deadlines: boolean
  votes: boolean
  browserPush: boolean
  email: boolean
}

// Notification Item Component
function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  return (
    <div
      className={`p-4 border-b last:border-b-0 ${
        !notification.read ? "bg-blue-50 dark:bg-blue-950" : "bg-transparent"
      } hover:bg-muted/50 transition-colors`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-medium text-sm">{notification.title}</p>
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
              {notification.pool && (
                <p className="text-xs text-muted-foreground mt-1">
                  Pool: {notification.pool.name}
                </p>
              )}
            </div>
            {!notification.read && (
              <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </p>

            <div className="flex items-center gap-1">
              {notification.action_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => window.location.href = notification.action_url!}
                >
                  View
                </Button>
              )}
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onMarkRead(notification.id)}
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => onDelete(notification.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Notification Preferences Modal
function NotificationPreferences({
  preferences,
  onSave,
}: {
  preferences: NotificationPreferences
  onSave: (prefs: NotificationPreferences) => void
}) {
  const [localPrefs, setLocalPrefs] = useState(preferences)

  const handleSave = () => {
    onSave(localPrefs)
    toast.success("Notification preferences saved")
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notification Settings</SheetTitle>
          <SheetDescription>
            Choose what notifications you want to receive
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Activity Notifications */}
          <div className="space-y-4">
            <h4 className="font-medium">Activity Notifications</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="deposits" className="flex flex-col gap-1">
                <span>Deposits & Contributions</span>
                <span className="text-xs text-muted-foreground font-normal">
                  When members make deposits
                </span>
              </Label>
              <Switch
                id="deposits"
                checked={localPrefs.deposits}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, deposits: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="withdrawals" className="flex flex-col gap-1">
                <span>Withdrawals</span>
                <span className="text-xs text-muted-foreground font-normal">
                  When withdrawals are made
                </span>
              </Label>
              <Switch
                id="withdrawals"
                checked={localPrefs.withdrawals}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, withdrawals: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="payouts" className="flex flex-col gap-1">
                <span>Payouts</span>
                <span className="text-xs text-muted-foreground font-normal">
                  When payouts are triggered
                </span>
              </Label>
              <Switch
                id="payouts"
                checked={localPrefs.payouts}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, payouts: checked })
                }
              />
            </div>
          </div>

          <Separator />

          {/* Emergency Notifications */}
          <div className="space-y-4">
            <h4 className="font-medium">Emergency Alerts</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="emergencies" className="flex flex-col gap-1">
                <span>Emergency Requests</span>
                <span className="text-xs text-muted-foreground font-normal">
                  When emergency withdrawals are requested
                </span>
              </Label>
              <Switch
                id="emergencies"
                checked={localPrefs.emergencies}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, emergencies: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="votes" className="flex flex-col gap-1">
                <span>Vote Requests</span>
                <span className="text-xs text-muted-foreground font-normal">
                  When your vote is needed
                </span>
              </Label>
              <Switch
                id="votes"
                checked={localPrefs.votes}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, votes: checked })
                }
              />
            </div>
          </div>

          <Separator />

          {/* Reminder Notifications */}
          <div className="space-y-4">
            <h4 className="font-medium">Reminders</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="deadlines" className="flex flex-col gap-1">
                <span>Deadline Reminders</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Upcoming contribution deadlines
                </span>
              </Label>
              <Switch
                id="deadlines"
                checked={localPrefs.deadlines}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, deadlines: checked })
                }
              />
            </div>
          </div>

          <Separator />

          {/* Delivery Methods */}
          <div className="space-y-4">
            <h4 className="font-medium">Delivery Methods</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="browserPush" className="flex flex-col gap-1">
                <span>Browser Notifications</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Show desktop notifications
                </span>
              </Label>
              <Switch
                id="browserPush"
                checked={localPrefs.browserPush}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, browserPush: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="flex flex-col gap-1">
                <span>Email Notifications</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Send to your email (coming soon)
                </span>
              </Label>
              <Switch
                id="email"
                checked={localPrefs.email}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, email: checked })
                }
                disabled
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Preferences
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Main Notification Center Component
export function NotificationCenter() {
  const { address } = useAccount()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    deposits: true,
    withdrawals: true,
    emergencies: true,
    payouts: true,
    deadlines: true,
    votes: true,
    browserPush: true,
    email: false,
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!address) return

    try {
      const response = await fetch(`/api/notifications?userAddress=${address}`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  // Mark as read
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
        toast.success("Marked as read")
      }
    } catch (error) {
      console.error('Failed to mark as read:', error)
      toast.error("Failed to mark as read")
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress: address }),
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        toast.success("All notifications marked as read")
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast.error("Failed to mark all as read")
    }
  }

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
        toast.success("Notification deleted")
      }
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error("Failed to delete notification")
    }
  }

  // Save preferences
  const savePreferences = async (prefs: NotificationPreferences) => {
    setPreferences(prefs)
    
    // Save to localStorage for now (can be moved to backend)
    localStorage.setItem('notification-prefs', JSON.stringify(prefs))

    // Request browser notification permission if enabled
    if (prefs.browserPush && Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        toast.error("Browser notifications blocked")
      }
    }
  }

  // Load preferences
  useEffect(() => {
    const saved = localStorage.getItem('notification-prefs')
    if (saved) {
      setPreferences(JSON.parse(saved))
    }
  }, [])

  // Fetch notifications on mount and periodically
  useEffect(() => {
    if (address) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000) // Every 30 seconds
      return () => clearInterval(interval)
    }
  }, [address])

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} new</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <NotificationPreferences
              preferences={preferences}
              onSave={savePreferences}
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <BellOff className="h-12 w-12 text-muted-foreground mb-3" />
              <h4 className="font-semibold mb-1">No notifications</h4>
              <p className="text-sm text-muted-foreground">
                {filter === 'unread'
                  ? "You're all caught up!"
                  : "We'll notify you when something happens"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}