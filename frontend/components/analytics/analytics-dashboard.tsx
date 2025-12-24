"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Award,
  Download,
  Calendar,
  PieChart,
  BarChart3,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { useAccount } from "wagmi"
import { motion } from "framer-motion"

interface AnalyticsData {
  overview: {
    totalSaved: number
    activePoolsCount: number
    completedPoolsCount: number
    onTimePaymentRate: number
    totalContributions: number
    averagePoolSize: number
    emergencyWithdrawals: number
    reputationScore: number
  }
  savingsTrend: Array<{
    date: string
    amount: number
    cumulative: number
  }>
  poolBreakdown: Array<{
    name: string
    type: string
    amount: number
    progress: number
    status: string
  }>
  monthlyStats: Array<{
    month: string
    deposits: number
    withdrawals: number
    net: number
  }>
  performanceMetrics: {
    bestMonth: { month: string; amount: number }
    averageMonthly: number
    projectedYearly: number
    growthRate: number
  }
}

// Stat Card Component
function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    color = "blue",
  }: {
    title: string
    value: string | number
    subtitle?: string
    icon: any
    trend?: "up" | "down"
    trendValue?: string
    color?: string
  }) {
    const colorClasses = {
      blue: "bg-blue-500/10 text-blue-600",
      green: "bg-green-500/10 text-green-600",
      purple: "bg-purple-500/10 text-purple-600",
      orange: "bg-orange-500/10 text-orange-600",
      red: "bg-red-500/10 text-red-600",
    }
  
    
  }