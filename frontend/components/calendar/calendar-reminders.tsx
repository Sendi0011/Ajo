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

// Payment Card Component
function PaymentCard({
  payment,
  walletBalance,
  onPay,
  onSnooze,
}: {
  payment: Payment
  walletBalance: number
  onPay: (payment: Payment) => void
  onSnooze: (payment: Payment) => void
}) {
  const hasInsufficientBalance = payment.amount > walletBalance
  const isOverdue = payment.status === "overdue"
  const isDueSoon = payment.status === "due_soon"

  const getStatusColor = () => {
    if (isOverdue) return "border-red-500 bg-red-50 dark:bg-red-950"
    if (isDueSoon) return "border-orange-500 bg-orange-50 dark:bg-orange-950"
    return "border-border"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={`p-4 border-2 ${getStatusColor()}`}>
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold">{payment.poolName}</h4>
              <Badge variant="secondary" className="text-xs mt-1">
                {payment.poolType}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{payment.amount.toFixed(2)} ETH</p>
              {hasInsufficientBalance && (
                <Badge variant="destructive" className="text-xs mt-1">
                  Insufficient Balance
                </Badge>
              )}
            </div>
          </div>

          {/* Due Date & Countdown */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>{payment.dueDate.toLocaleDateString()}</span>
              <span>{payment.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <CountdownTimer targetDate={payment.dueDate} />
          </div>

          {/* Balance Warning */}
          {hasInsufficientBalance && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium text-destructive">Insufficient Balance</p>
                <p className="text-muted-foreground mt-1">
                  You need {payment.amount.toFixed(2)} ETH but only have{" "}
                  {walletBalance.toFixed(2)} ETH
                </p>
              </div>
            </div>
          )}

          {/* Progress to Deadline */}
          {!isOverdue && (
            <div className="space-y-1">
              <Progress
                value={getTimeProgress(payment.dueDate)}
                className="h-2"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => onPay(payment)}
              disabled={hasInsufficientBalance || payment.hasPaid}
            >
              {payment.hasPaid ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Paid
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Pay Now
                </>
              )}
            </Button>
            {!payment.hasPaid && (
              <Button variant="outline" onClick={() => onSnooze(payment)}>
                Snooze 1hr
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Helper function to calculate time progress
function getTimeProgress(dueDate: Date): number {
  const now = new Date().getTime()
  const due = dueDate.getTime()
  const total = 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  const elapsed = total - (due - now)
  return Math.min(100, Math.max(0, (elapsed / total) * 100))
}

