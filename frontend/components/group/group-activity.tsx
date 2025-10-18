"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, UserPlus, Settings } from "lucide-react"

// Mock activity data
const mockActivity = [
  {
    type: "deposit",
    user: "0x1234...5678",
    amount: "0.5 ETH",
    timestamp: "2 hours ago",
  },
  {
    type: "deposit",
    user: "0xabcd...efgh",
    amount: "0.5 ETH",
    timestamp: "5 hours ago",
  },
  {
    type: "payout",
    user: "0x9876...5432",
    amount: "4.0 ETH",
    timestamp: "1 day ago",
  },
  {
    type: "member_joined",
    user: "0xijkl...mnop",
    timestamp: "2 days ago",
  },
  {
    type: "deposit",
    user: "0xqrst...uvwx",
    amount: "0.5 ETH",
    timestamp: "3 days ago",
  },
  {
    type: "settings_updated",
    user: "0x1234...5678",
    timestamp: "5 days ago",
  },
]

export function GroupActivity({ groupId }: { groupId: string }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {mockActivity.map((activity, index) => (
          <div key={index} className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                activity.type === "deposit" ? "bg-primary/10" : activity.type === "payout" ? "bg-accent/10" : "bg-muted"
              }`}
            >
              {activity.type === "deposit" && <ArrowUpRight className="h-5 w-5 text-primary" />}
              {activity.type === "payout" && <ArrowDownLeft className="h-5 w-5 text-accent" />}
              {activity.type === "member_joined" && <UserPlus className="h-5 w-5 text-muted-foreground" />}
              {activity.type === "settings_updated" && <Settings className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">
                  {activity.type === "deposit" && "Deposit"}
                  {activity.type === "payout" && "Payout"}
                  {activity.type === "member_joined" && "Member Joined"}
                  {activity.type === "settings_updated" && "Settings Updated"}
                </p>
                {activity.amount && <Badge variant="secondary">{activity.amount}</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">
                {activity.user} • {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
