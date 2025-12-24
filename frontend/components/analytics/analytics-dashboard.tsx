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
  
    return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold">{value}</h3>
                  {trend && trendValue && (
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span>{trendValue}</span>
                    </div>
                  )}
                </div>
                {subtitle && (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        </motion.div>
      )
    }
    
    // Main Analytics Dashboard
    export function AnalyticsDashboard() {
      const { address } = useAccount()
      const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
      const [loading, setLoading] = useState(true)
      const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month")
    
      useEffect(() => {
        if (address) {
          fetchAnalytics()
        }
      }, [address, timeframe])
    
      const fetchAnalytics = async () => {
        try {
          setLoading(true)
          const response = await fetch(`/api/analytics?userAddress=${address}&timeframe=${timeframe}`)
          if (response.ok) {
            const data = await response.json()
            setAnalytics(data)
          }
        } catch (error) {
          console.error("Failed to fetch analytics:", error)
        } finally {
          setLoading(false)
        }
      }
    
      const exportReport = async (format: "pdf" | "csv") => {
        try {
          const response = await fetch(
            `/api/analytics/export?userAddress=${address}&format=${format}`
          )
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `ajo-analytics-${new Date().toISOString().split("T")[0]}.${format}`
          a.click()
        } catch (error) {
          console.error("Export failed:", error)
        }
      }
    
      if (loading) {
        return (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="h-32 bg-muted animate-pulse rounded" />
              </Card>
            ))}
          </div>
        )
      }
    
      if (!analytics) {
        return (
          <Card className="p-12">
            <div className="text-center">
              <PieChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
              <p className="text-sm text-muted-foreground">
                Start contributing to pools to see your analytics
              </p>
            </div>
          </Card>
        )
      }
    
      const { overview, savingsTrend, poolBreakdown, monthlyStats, performanceMetrics } = analytics
    
      // Chart colors
      const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]
    
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
              <p className="text-muted-foreground">
                Track your savings performance and trends
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => exportReport("csv")}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportReport("pdf")}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
    
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Saved"
              value={`${overview.totalSaved.toFixed(2)} ETH`}
              subtitle={`≈ $${(overview.totalSaved * 2500).toFixed(0)}`}
              icon={DollarSign}
              trend="up"
              trendValue={`${performanceMetrics.growthRate.toFixed(1)}%`}
              color="green"
            />
            <StatCard
              title="Active Pools"
              value={overview.activePoolsCount}
              subtitle={`${overview.completedPoolsCount} completed`}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="On-Time Rate"
              value={`${overview.onTimePaymentRate}%`}
              subtitle="Payment reliability"
              icon={CheckCircle}
              trend={overview.onTimePaymentRate >= 90 ? "up" : "down"}
              trendValue={overview.onTimePaymentRate >= 90 ? "Excellent" : "Needs improvement"}
              color={overview.onTimePaymentRate >= 90 ? "green" : "orange"}
            />
            <StatCard
              title="Reputation Score"
              value={overview.reputationScore}
              subtitle={
                overview.reputationScore >= 90
                  ? "🏆 Diamond"
                  : overview.reputationScore >= 75
                  ? "🥇 Gold"
                  : "🥈 Silver"
              }
              icon={Award}
              color="purple"
            />
          </div>
    
          {/* Main Charts */}
          <Tabs defaultValue="trends" className="space-y-4">
            <TabsList>
              <TabsTrigger value="trends">Savings Trends</TabsTrigger>
              <TabsTrigger value="pools">Pool Breakdown</TabsTrigger>
              <TabsTrigger value="monthly">Monthly Analysis</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
    
            {/* Savings Trends */}
            <TabsContent value="trends" className="space-y-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Savings Growth</h3>
                    <p className="text-sm text-muted-foreground">
                      Your cumulative savings over time
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={timeframe === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeframe("week")}
                    >
                      Week
                    </Button>
                    <Button
                      variant={timeframe === "month" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeframe("month")}
                    >
                      Month
                    </Button>
                    <Button
                      variant={timeframe === "year" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeframe("year")}
                    >
                      Year
                    </Button>
                  </div>
                </div>
    
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={savingsTrend}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
    
              {/* Key Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Best Month</p>
                      <p className="font-semibold">
                        {performanceMetrics.bestMonth.month}
                      </p>
                      <p className="text-xs text-green-600">
                        {performanceMetrics.bestMonth.amount.toFixed(2)} ETH
                      </p>
                    </div>
                  </div>
                </Card>
    
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Monthly</p>
                      <p className="font-semibold">
                        {performanceMetrics.averageMonthly.toFixed(2)} ETH
                      </p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                  </div>
                </Card>
    
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Projected Yearly</p>
                      <p className="font-semibold">
                        {performanceMetrics.projectedYearly.toFixed(2)} ETH
                      </p>
                      <p className="text-xs text-muted-foreground">at current rate</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
    
            {/* Pool Breakdown */}
            <TabsContent value="pools" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Savings Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={poolBreakdown}
                        dataKey="amount"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {poolBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                </Card>
    
                {/* Pool List */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Pool Performance</h3>
                  <div className="space-y-4">
                    {poolBreakdown.map((pool, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium">{pool.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {pool.type}
                            </Badge>
                          </div>
                          <span className="font-semibold">{pool.amount.toFixed(2)} ETH</span>
                        </div>
                        <Progress value={pool.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {pool.progress}% complete • {pool.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>
    
            {/* Monthly Analysis */}
            <TabsContent value="monthly" className="space-y-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Cash Flow</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="deposits" fill="#10b981" name="Deposits" />
                    <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" />
                    <Bar dataKey="net" fill="#3b82f6" name="Net Savings" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>
    
            {/* Performance Metrics */}
            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Reliability Score */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Reliability Score</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">On-Time Payments</span>
                        <span className="font-semibold">{overview.onTimePaymentRate}%</span>
                      </div>
                      <Progress value={overview.onTimePaymentRate} className="h-3" />
                    </div>
    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Pools Completed</span>
                        <span className="font-semibold">
                          {overview.completedPoolsCount}/{overview.activePoolsCount + overview.completedPoolsCount}
                        </span>
                      </div>
                      <Progress
                        value={
                          (overview.completedPoolsCount /
                            (overview.activePoolsCount + overview.completedPoolsCount)) *
                          100
                        }
                        className="h-3"
                      />
                    </div>
    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Emergency Usage</span>
                        <span className="font-semibold">{overview.emergencyWithdrawals}</span>
                      </div>
                      <Progress
                        value={overview.emergencyWithdrawals * 10}
                        className="h-3"
                      />
                    </div>
                  </div>
                </Card>
    
                {/* Achievements */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Achievements</h3>
                  <div className="space-y-3">
                    <AchievementBadge
                      icon={<Zap className="h-5 w-5" />}
                      title="Early Adopter"
                      description="Joined in the first month"
                      unlocked={true}
                    />
                    <AchievementBadge
                      icon={<CheckCircle className="h-5 w-5" />}
                      title="Perfect Payer"
                      description="100% on-time for 3 months"
                      unlocked={overview.onTimePaymentRate >= 95}
                    />
                    <AchievementBadge
                      icon={<Users className="h-5 w-5" />}
                      title="Community Builder"
                      description="Active in 5+ pools"
                      unlocked={overview.activePoolsCount >= 5}
                    />
                    <AchievementBadge
                      icon={<Target className="h-5 w-5" />}
                      title="Goal Crusher"
                      description="Completed 10 pools"
                      unlocked={overview.completedPoolsCount >= 10}
                    />
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )
    }
    
    // Achievement Badge Component
    function AchievementBadge({
      icon,
      title,
      description,
      unlocked,
    }: {
      icon: React.ReactNode
      title: string
      description: string
      unlocked: boolean
    }) {
      return (
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border ${
            unlocked
              ? "bg-primary/5 border-primary/20"
              : "bg-muted/30 border-muted opacity-50"
          }`}
        >
          <div
            className={`p-2 rounded-lg ${
              unlocked ? "bg-primary/10 text-primary" : "bg-muted"
            }`}
          >
            {icon}
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {unlocked && <CheckCircle className="h-5 w-5 text-primary" />}
        </div>
      )
  }