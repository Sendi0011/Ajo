"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, AlertCircle, ArrowRight } from "lucide-react"
import { useAccount } from "wagmi"
import Link from "next/link"

interface UpcomingPayment {
  id: string
  poolName: string
  amount: number
  dueDate: string
  status: string
}

export function UpcomingPaymentsWidget() {
  const { address } = useAccount()
  const [payments, setPayments] = useState<UpcomingPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (address) {
      fetchPayments()
    }
  }, [address])

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/calendar/payments?userAddress=${address}`)
      if (response.ok) {
        const data = await response.json()
        // Get next 3 upcoming payments
        setPayments(data.filter((p: any) => !p.hasPaid).slice(0, 3))
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeUntil = (dueDate: string) => {
    const now = new Date().getTime()
    const due = new Date(dueDate).getTime()
    const diff = due - now

    if (diff < 0) return "Overdue"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    return `${hours}h`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "text-red-600"
      case "due_soon":
        return "text-orange-600"
      default:
        return "text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="h-32 bg-muted animate-pulse rounded" />
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Payments
          </h4>
          {payments.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {payments.length}
            </Badge>
          )}
        </div>

        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No upcoming payments
          </p>
        ) : (
          <div className="space-y-2">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {payment.poolName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payment.amount.toFixed(2)} ETH
                    </p>
                  </div>
                  {payment.status === "overdue" && (
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={getStatusColor(payment.status)}>
                    <Clock className="h-3 w-3 inline mr-1" />
                    {getTimeUntil(payment.dueDate)}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(payment.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link href="/dashboard/calendar">
          <Button variant="ghost" className="w-full" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </Card>
  )
}