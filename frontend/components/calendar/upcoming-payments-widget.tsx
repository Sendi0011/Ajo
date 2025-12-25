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

  
}