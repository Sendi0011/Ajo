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

// Calendar View Component
function CalendarView({ payments }: { payments: Payment[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const getPaymentsForDay = (day: number) => {
    return payments.filter((p) => {
      const paymentDate = new Date(p.dueDate)
      return (
        paymentDate.getDate() === day &&
        paymentDate.getMonth() === currentDate.getMonth() &&
        paymentDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card className="p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Calendar days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dayPayments = getPaymentsForDay(day)
          const isToday =
            day === new Date().getDate() &&
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear()

          return (
            <div
              key={day}
              className={`aspect-square p-2 border rounded-lg relative ${
                isToday ? "border-primary bg-primary/5" : "border-border"
              } ${dayPayments.length > 0 ? "cursor-pointer hover:bg-muted/50" : ""}`}
            >
              <div className="text-sm font-medium">{day}</div>
              {dayPayments.length > 0 && (
                <div className="absolute bottom-1 left-1 right-1 space-y-1">
                  {dayPayments.slice(0, 2).map((payment, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-1 rounded truncate ${
                        payment.status === "overdue"
                          ? "bg-red-500 text-white"
                          : payment.status === "due_soon"
                          ? "bg-orange-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {payment.amount.toFixed(1)} ETH
                    </div>
                  ))}
                  {dayPayments.length > 2 && (
                    <div className="text-xs text-center text-muted-foreground">
                      +{dayPayments.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// Reminder Preferences Component
function ReminderSettings({
  preferences,
  onSave,
}: {
  preferences: ReminderPreferences
  onSave: (prefs: ReminderPreferences) => void
}) {
  const [localPrefs, setLocalPrefs] = useState(preferences)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Reminder Preferences</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-reminders" className="flex flex-col gap-1">
            <span>Enable Reminders</span>
            <span className="text-xs text-muted-foreground font-normal">
              Get notified before payment deadlines
            </span>
          </Label>
          <Switch
            id="enable-reminders"
            checked={localPrefs.enabled}
            onCheckedChange={(checked) =>
              setLocalPrefs({ ...localPrefs, enabled: checked })
            }
          />
        </div>

        {localPrefs.enabled && (
          <>
            <div className="pl-4 space-y-4 border-l-2 border-primary/20">
              <div className="flex items-center justify-between">
                <Label htmlFor="3days">3 days before</Label>
                <Switch
                  id="3days"
                  checked={localPrefs.threeDaysBefore}
                  onCheckedChange={(checked) =>
                    setLocalPrefs({ ...localPrefs, threeDaysBefore: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="1day">1 day before</Label>
                <Switch
                  id="1day"
                  checked={localPrefs.oneDayBefore}
                  onCheckedChange={(checked) =>
                    setLocalPrefs({ ...localPrefs, oneDayBefore: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="2hours">2 hours before</Label>
                <Switch
                  id="2hours"
                  checked={localPrefs.twoHoursBefore}
                  onCheckedChange={(checked) =>
                    setLocalPrefs({ ...localPrefs, twoHoursBefore: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="30mins">30 minutes before</Label>
                <Switch
                  id="30mins"
                  checked={localPrefs.thirtyMinsBefore}
                  onCheckedChange={(checked) =>
                    setLocalPrefs({ ...localPrefs, thirtyMinsBefore: checked })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Label htmlFor="balance-check" className="flex flex-col gap-1">
                <span>Balance Check</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Warn if insufficient funds
                </span>
              </Label>
              <Switch
                id="balance-check"
                checked={localPrefs.balanceCheck}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, balanceCheck: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="browser-notif" className="flex flex-col gap-1">
                <span>Browser Notifications</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Show desktop notifications
                </span>
              </Label>
              <Switch
                id="browser-notif"
                checked={localPrefs.browserNotifications}
                onCheckedChange={(checked) =>
                  setLocalPrefs({ ...localPrefs, browserNotifications: checked })
                }
              />
            </div>
          </>
        )}

        <Button onClick={() => onSave(localPrefs)} className="w-full">
          Save Preferences
        </Button>
      </div>
    </Card>
  )
}

