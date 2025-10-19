"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, UserPlus, Settings, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

interface Activity {
  id: string
  activity_type: string
  user_address: string | null
  amount: number | null
  description: string | null
  created_at: string
}

export function GroupActivity({ groupId }: { groupId: string }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [groupId])

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/pools?id=${groupId}`)
      const pool = await response.json()

      if (pool.pool_activity) {
        setActivities(pool.pool_activity)
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: string | null) => {
    if (!address) return "System"
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getBlockExplorerUrl = (txHash: string | null) => {
    if (!txHash) return null
    // For Base Sepolia testnet
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
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}