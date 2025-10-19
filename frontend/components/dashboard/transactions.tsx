"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, Clock, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Activity {
  id: string
  activity_type: string
  user_address: string | null
  amount: number | null
  description: string | null
  created_at: string
  pool_id: string
}

export function Transactions() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('pool_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setActivities(data || [])
    } catch (err) {
      console.error('Failed to fetch activities:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Transaction History</h2>
        <p className="text-muted-foreground mt-1">View all deposits and payouts</p>
      </div>

      <Card className="divide-y divide-border">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No transactions yet
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    activity.activity_type === 'deposit' ? 'bg-primary/10' : 'bg-accent/10'
                  }`}>
                    {activity.activity_type === 'deposit' ? (
                      <ArrowUpRight className="h-6 w-6 text-primary" />
                    ) : (
                      <ArrowDownLeft className="h-6 w-6 text-accent" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold capitalize">{activity.activity_type}</h3>
                      <Badge variant="default" className="bg-primary/10 text-primary">
                        Completed
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.amount && (
                    <p className="text-xl font-bold">{activity.amount.toFixed(2)} ETH</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
