"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  BellOff,
  Check,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  XCircle,
  Zap,
  DollarSign,
  Calendar,
  RefreshCw,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useAccount } from "wagmi"
import { formatEther } from "viem"

// Activity Types
type ActivityType = 
  | 'pool_created'
  | 'deposit'
  | 'contribution'
  | 'withdrawal'
  | 'payout'
  | 'emergency_requested'
  | 'emergency_voted'
  | 'emergency_executed'
  | 'emergency_rejected'
  | 'member_joined'
  | 'deadline_approaching'
  | 'target_reached'

interface Activity {
  id: string
  pool_id: string
  activity_type: ActivityType
  user_address: string | null
  amount: number | null
  description: string | null
  tx_hash: string | null
  created_at: string
  pool?: {
    name: string
    type: string
  }
}

// Activity Icon Component
function ActivityIcon({ type }: { type: ActivityType }) {
  const iconMap: Record<ActivityType, { icon: React.ReactNode; color: string }> = {
    pool_created: { icon: <Users className="h-4 w-4" />, color: "text-blue-600" },
    deposit: { icon: <ArrowUpRight className="h-4 w-4" />, color: "text-green-600" },
    contribution: { icon: <DollarSign className="h-4 w-4" />, color: "text-green-600" },
    withdrawal: { icon: <ArrowDownLeft className="h-4 w-4" />, color: "text-orange-600" },
    payout: { icon: <Zap className="h-4 w-4" />, color: "text-purple-600" },
    emergency_requested: { icon: <AlertCircle className="h-4 w-4" />, color: "text-red-600" },
    emergency_voted: { icon: <ThumbsUp className="h-4 w-4" />, color: "text-blue-600" },
    emergency_executed: { icon: <CheckCircle className="h-4 w-4" />, color: "text-green-600" },
    emergency_rejected: { icon: <XCircle className="h-4 w-4" />, color: "text-red-600" },
    member_joined: { icon: <Users className="h-4 w-4" />, color: "text-blue-600" },
    deadline_approaching: { icon: <Clock className="h-4 w-4" />, color: "text-amber-600" },
    target_reached: { icon: <TrendingUp className="h-4 w-4" />, color: "text-green-600" },
  }

  const config = iconMap[type] || { icon: <Bell className="h-4 w-4" />, color: "text-gray-600" }

  return (
    <div className={`p-2 rounded-full bg-muted ${config.color}`}>
      {config.icon}
    </div>
  )
}

// Single Activity Item
function ActivityItem({ activity }: { activity: Activity }) {
  const { address } = useAccount()
  const isMyActivity = activity.user_address?.toLowerCase() === address?.toLowerCase()

  return (
    <div className="flex gap-3 py-3">
      <ActivityIcon type={activity.activity_type} />
      
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium">
              {activity.description || activity.activity_type.replace(/_/g, ' ')}
            </p>
            {activity.pool && (
              <p className="text-xs text-muted-foreground">
                {activity.pool.name}
              </p>
            )}
          </div>
          {activity.amount && (
            <Badge variant="secondary" className="ml-2">
              {formatEther(BigInt(Math.floor(activity.amount * 1e18)))} ETH
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</span>
          {isMyActivity && (
            <Badge variant="outline" className="text-xs">You</Badge>
          )}
          {activity.tx_hash && (
            <a
              href={`https://sepolia.basescan.org/tx/${activity.tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              View TX
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Activity Feed Component
export function ActivityFeed({ poolId }: { poolId?: string }) {
  const { address } = useAccount()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'mine'>('all')

  // Fetch activities
  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams()
      if (poolId) params.append('poolId', poolId)
      if (address && filter === 'mine') params.append('userAddress', address)

      const response = await fetch(`/api/activity?${params}`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
    
    // Poll for new activities every 10 seconds
    const interval = setInterval(fetchActivities, 10000)
    return () => clearInterval(interval)
  }, [poolId, address, filter])

  const filteredActivities = filter === 'mine' 
    ? activities.filter(a => a.user_address?.toLowerCase() === address?.toLowerCase())
    : activities

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">Activity Feed</h3>
            {activities.length > 0 && (
              <Badge variant="secondary">{activities.length}</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'mine' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('mine')}
            >
              Mine
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchActivities}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Activity List */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 py-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-3" />
              <h4 className="font-semibold mb-1">No Activity Yet</h4>
              <p className="text-sm text-muted-foreground">
                {filter === 'mine' 
                  ? "You haven't performed any actions yet"
                  : "No activities recorded for this pool"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </Card>
  )
}

// Compact Activity Feed for Dashboard
export function CompactActivityFeed() {
  const { address } = useAccount()
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const params = new URLSearchParams()
        if (address) params.append('userAddress', address)
        params.append('limit', '5')

        const response = await fetch(`/api/activity?${params}`)
        if (response.ok) {
          const data = await response.json()
          setActivities(data)
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivities()
    const interval = setInterval(fetchActivities, 15000)
    return () => clearInterval(interval)
  }, [address])

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Recent Activity</h4>
          {activities.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activities.length}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No recent activity
            </p>
          ) : (
            activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-2 text-sm">
                <div className="mt-0.5">
                  <ActivityIcon type={activity.activity_type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate">
                    {activity.description || activity.activity_type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <Button variant="ghost" className="w-full" size="sm">
          View All Activity
        </Button>
      </div>
    </Card>
  )
}

// Live Activity Ticker (for top of dashboard)
export function ActivityTicker() {
  const [latestActivity, setLatestActivity] = useState<Activity | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await fetch('/api/activity?limit=1')
        if (response.ok) {
          const data = await response.json()
          if (data.length > 0 && data[0].id !== latestActivity?.id) {
            setLatestActivity(data[0])
            setIsVisible(true)
            setTimeout(() => setIsVisible(false), 5000)
          }
        }
      } catch (error) {
        console.error('Failed to fetch latest activity:', error)
      }
    }

    fetchLatest()
    const interval = setInterval(fetchLatest, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!isVisible || !latestActivity) return null

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right">
      <Card className="p-4 shadow-lg border-2 border-primary/20 max-w-sm">
        <div className="flex items-start gap-3">
          <ActivityIcon type={latestActivity.activity_type} />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {latestActivity.description}
            </p>
            {latestActivity.amount && (
              <p className="text-xs text-muted-foreground">
                Amount: {formatEther(BigInt(Math.floor(latestActivity.amount * 1e18)))} ETH
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsVisible(false)}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}