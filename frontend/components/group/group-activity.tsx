"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, UserPlus, Settings, Loader2, ExternalLink, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface Activity {
  id: string
  activity_type: string
  user_address: string | null
  amount: number | null
  description: string | null
  created_at: string
  tx_hash: string | null
}

export function GroupActivity({ groupId }: { groupId: string }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchActivities()
    
    // Refetch activities every 5 seconds
    const interval = setInterval(() => {
      fetchActivities(true)
    }, 5000)

    return () => clearInterval(interval)
  }, [groupId])

  const fetchActivities = async (isAutoRefresh: boolean = false) => {
    try {
      if (isAutoRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const response = await fetch(`/api/pools?id=${groupId}`)
      const pool = await response.json()

      console.log('Pool data received:', pool)
      console.log('Pool activities:', pool.pool_activity)

      if (pool.pool_activity && Array.isArray(pool.pool_activity)) {
        console.log(`Found ${pool.pool_activity.length} activities for pool ${groupId}`)
        setActivities(pool.pool_activity)
      } else {
        console.log('No activities found for pool', groupId)
        setActivities([])
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err)
      setActivities([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleManualRefresh = () => {
    fetchActivities()
  }

  const formatAddress = (address: string | null) => {
    if (!address) return "System"
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date"
      }
      
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      
      // Handle negative differences (future dates)
      if (diffMs < 0) {
        return "Just now"
      }
      
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (err) {
      return "Unknown date"
    }
  }

  const getBlockExplorerUrl = (txHash: string | null) => {
    if (!txHash) return null
    return `https://sepolia.basescan.org/tx/${txHash}`
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleManualRefresh}
          disabled={refreshing}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${
                  activity.activity_type === "deposit" ? "bg-primary/10" : activity.activity_type === "payout" ? "bg-accent/10" : "bg-muted"
                }`}
              >
                {activity.activity_type === "deposit" && <ArrowUpRight className="h-5 w-5 text-primary" />}
                {activity.activity_type === "payout" && <ArrowDownLeft className="h-5 w-5 text-accent" />}
                {activity.activity_type === "member_joined" && <UserPlus className="h-5 w-5 text-muted-foreground" />}
                {activity.activity_type === "pool_created" && <Settings className="h-5 w-5 text-muted-foreground" />}
                {!["deposit", "payout", "member_joined", "pool_created"].includes(activity.activity_type) && (
                  <Settings className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm capitalize">
                    {activity.activity_type === "deposit" && "Deposit"}
                    {activity.activity_type === "payout" && "Payout"}
                    {activity.activity_type === "member_joined" && "Member Joined"}
                    {activity.activity_type === "pool_created" && "Pool Created"}
                    {!["deposit", "payout", "member_joined", "pool_created"].includes(activity.activity_type) && activity.activity_type}
                  </p>
                  {activity.amount && <Badge variant="secondary">{activity.amount.toFixed(2)} ETH</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatAddress(activity.user_address)} • {formatTime(activity.created_at)}
                </p>
                {activity.description && (
                  <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                )}
                {activity.tx_hash ? (
                  getBlockExplorerUrl(activity.tx_hash) && (
                    <a
                      href={getBlockExplorerUrl(activity.tx_hash)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                    >
                      View on BaseScan
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )
                ) : (
                  <p className="text-xs text-muted-foreground mt-2">No transaction hash</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}