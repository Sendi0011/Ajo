"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, TrendingUp, Users, Clock } from "lucide-react"
import { motion } from "framer-motion"

// Mock data - will be replaced with smart contract data
const mockGroupData = {
  "1": {
    name: "Family Savings Circle",
    type: "Rotational",
    status: "active",
    description: "Monthly savings for family emergencies and celebrations",
    totalSaved: "2.5 ETH",
    targetAmount: "8.0 ETH",
    progress: 31,
    members: 8,
    nextPayout: "3 days",
    nextRecipient: "0x1234...5678",
    createdAt: "2025-01-01",
    contributionAmount: "0.5 ETH",
    frequency: "Monthly",
  },
}

export function GroupDetails({ groupId }: { groupId: string }) {
  const group = mockGroupData[groupId as keyof typeof mockGroupData] || mockGroupData["1"]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{group.type}</Badge>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">{group.status}</Badge>
            </div>
          </div>
        </div>

        {group.description && <p className="text-muted-foreground mb-6">{group.description}</p>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: TrendingUp, label: "Total Saved", value: group.totalSaved },
            { icon: Users, label: "Members", value: group.members },
            { icon: Clock, label: "Next Payout", value: group.nextPayout },
            { icon: Calendar, label: "Frequency", value: group.frequency },
          ].map((stat, index) => (
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

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress to Target</span>
            <span className="font-medium">
              {group.totalSaved} / {group.targetAmount}
            </span>
          </div>
          <Progress value={group.progress} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {group.progress}% complete • Next recipient: {group.nextRecipient}
          </p>
        </div>
      </Card>
    </motion.div>
  )
}
