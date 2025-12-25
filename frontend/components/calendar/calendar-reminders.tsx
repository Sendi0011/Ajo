"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Calendar as CalendarIcon,
  Clock,
  Bell,
  AlertCircle,
  CheckCircle,
  Wallet,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingDown,
} from "lucide-react"
import { useAccount, useBalance } from "wagmi"
import { formatEther } from "viem"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface Payment {
  id: string
  poolId: string
  poolName: string
  poolType: string
  amount: number
  dueDate: Date
  status: "upcoming" | "due_soon" | "overdue" | "paid"
  hasPaid: boolean
  gracePeriod?: Date
  reminder3Days?: boolean
  reminder1Day?: boolean
  reminder2Hours?: boolean
}

interface ReminderPreferences {
  enabled: boolean
  threeDaysBefore: boolean
  oneDayBefore: boolean
  twoHoursBefore: boolean
  thirtyMinsBefore: boolean
  balanceCheck: boolean
  browserNotifications: boolean
  emailNotifications: boolean
}

// Countdown Timer Component
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  function calculateTimeLeft(target: Date) {
    const now = new Date().getTime()
    const targetTime = target.getTime()
    const diff = targetTime - now

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }

    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      total: diff,
    }
  }

  const isUrgent = timeLeft.total < 24 * 60 * 60 * 1000 // Less than 24 hours
  const isCritical = timeLeft.total < 2 * 60 * 60 * 1000 // Less than 2 hours

  return (
    <div
      className={`flex items-center gap-2 text-sm ${
        isCritical
          ? "text-red-600"
          : isUrgent
          ? "text-orange-600"
          : "text-muted-foreground"
      }`}
    >
      <Clock className="h-4 w-4" />
      {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
      <span>
        {timeLeft.hours}h {timeLeft.minutes}m
      </span>
      {isCritical && <span>{timeLeft.seconds}s</span>}
    </div>
  )
}

