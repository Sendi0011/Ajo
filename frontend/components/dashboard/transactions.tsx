"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react"

// Mock transaction data
const mockTransactions = [
  {
    id: "1",
    type: "deposit",
    group: "Family Savings Circle",
    amount: "0.5 ETH",
    date: "2025-01-08",
    status: "completed",
    hash: "0x1234...5678",
  },
  {
    id: "2",
    type: "payout",
    group: "Business Investment Pool",
    amount: "1.2 ETH",
    date: "2025-01-05",
    status: "completed",
    hash: "0xabcd...efgh",
  },
  {
    id: "3",
    type: "deposit",
    group: "Community Emergency Fund",
    amount: "0.3 ETH",
    date: "2025-01-03",
    status: "completed",
    hash: "0x9876...5432",
  },
  {
    id: "4",
    type: "deposit",
    group: "Family Savings Circle",
    amount: "0.5 ETH",
    date: "2025-01-01",
    status: "pending",
    hash: "0xijkl...mnop",
  },
]

export function Transactions() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Transaction History</h2>
        <p className="text-muted-foreground mt-1">View all your deposits and payouts</p>
      </div>

      <Card className="divide-y divide-border">
        {mockTransactions.map((transaction) => (
          <div key={transaction.id} className="p-6 hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    transaction.type === "deposit" ? "bg-primary/10" : "bg-accent/10"
                  }`}
                >
                  {transaction.type === "deposit" ? (
                    <ArrowUpRight className="h-6 w-6 text-primary" />
                  ) : (
                    <ArrowDownLeft className="h-6 w-6 text-accent" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{transaction.type === "deposit" ? "Deposit" : "Payout"}</h3>
                    <Badge
                      variant={transaction.status === "completed" ? "default" : "secondary"}
                      className={
                        transaction.status === "completed" ? "bg-primary/10 text-primary hover:bg-primary/20" : ""
                      }
                    >
                      {transaction.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                      {transaction.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{transaction.group}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {transaction.date} • {transaction.hash}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{transaction.amount}</p>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
