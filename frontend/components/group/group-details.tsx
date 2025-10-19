"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, TrendingUp, Users, Clock, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface GroupData {
  id: string
  name: string
  type: 'rotational' | 'target' | 'flexible'
  status: 'active' | 'completed' | 'paused'
  description: string | null
  total_saved: number
  target_amount: number | null
  progress: number
  members_count: number
  next_payout: string | null
  next_recipient: string | null
  created_at: string
  contribution_amount: number | null
  frequency: string | null
  deadline: string | null
}

export function GroupDetails({ groupId }: { groupId: string }) {
  const [group, setGroup] = useState<GroupData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchGroupData()
  }, [groupId])

  const fetchGroupData = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(`/api/pools?id=${groupId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch group")
      }

      const data = await response.json()
      setGroup(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load group")
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-12">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    )
  }

  if (error || !group) {
    return (
      <Card className="p-6 bg-destructive/10 text-destructive">
        <p>{error || "Group not found"}</p>
      </Card>
    )
  }

  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getStats = () => {
    const baseStats = [
      { icon: TrendingUp, label: "Total Saved", value: `${(group.total_saved || 0).toFixed(2)} ETH` },
      { icon: Users, label: "Members", value: group.members_count || 0 },
    ]

    if (group.type === 'rotational') {
      baseStats.push({ icon: Clock, label: "Next Payout", value: group.next_payout || "N/A" })
      baseStats.push({ icon: Calendar, label: "Frequency", value: group.frequency || "N/A" })
    } else if (group.type === 'target') {
      baseStats.push({ icon: Calendar, label: "Target", value: `${(group.target_amount || 0).toFixed(2)} ETH` })
      baseStats.push({ icon: Clock, label: "Deadline", value: group.deadline ? new Date(group.deadline).toLocaleDateString() : "N/A" })
    } else {
      baseStats.push({ icon: Clock, label: "Status", value: group.status })
      baseStats.push({ icon: Calendar, label: "Created", value: new Date(group.created_at).toLocaleDateString() })
    }

    return baseStats
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{formatType(group.type)}</Badge>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{group.status}</Badge>
            </div>
          </div>
        </div>

        {group.description && <p className="text-muted-foreground mb-6">{group.description}</p>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {getStats().map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="p-4 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <stat.icon className="h-4 w-4" />
                <span className="text-sm">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {group.target_amount && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress to Target</span>
              <span className="font-medium">
                {(group.total_saved || 0).toFixed(2)} / {(group.target_amount || 0).toFixed(2)} ETH
              </span>
            </div>
            <Progress value={group.progress || 0} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {group.progress || 0}% complete
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  )
}