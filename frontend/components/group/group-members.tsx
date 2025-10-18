"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

// Mock member data
const mockMembers = [
  {
    address: "0x1234...5678",
    status: "paid",
    contribution: "0.5 ETH",
    lastPayment: "2025-01-08",
    isNext: true,
  },
  {
    address: "0xabcd...efgh",
    status: "paid",
    contribution: "0.5 ETH",
    lastPayment: "2025-01-08",
    isNext: false,
  },
  {
    address: "0x9876...5432",
    status: "pending",
    contribution: "0.0 ETH",
    lastPayment: "N/A",
    isNext: false,
  },
  {
    address: "0xijkl...mnop",
    status: "paid",
    contribution: "0.5 ETH",
    lastPayment: "2025-01-08",
    isNext: false,
  },
  {
    address: "0xqrst...uvwx",
    status: "late",
    contribution: "0.3 ETH",
    lastPayment: "2024-12-25",
    isNext: false,
  },
]

export function GroupMembers({ groupId }: { groupId: string }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Members ({mockMembers.length})</h3>
      <div className="space-y-3">
        {mockMembers.map((member, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {member.address.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm font-mono">{member.address}</p>
                <p className="text-xs text-muted-foreground">{member.contribution}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {member.isNext && (
                <Badge variant="secondary" className="text-xs">
                  Next
                </Badge>
              )}
              {member.status === "paid" && <CheckCircle2 className="h-4 w-4 text-primary" />}
              {member.status === "pending" && <Clock className="h-4 w-4 text-muted-foreground" />}
              {member.status === "late" && <XCircle className="h-4 w-4 text-destructive" />}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
