import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userAddress = searchParams.get('userAddress')
    const timeframe = searchParams.get('timeframe') || 'month'

    if (!userAddress) {
      return NextResponse.json(
        { error: 'userAddress is required' },
        { status: 400 }
      )
    }

    // Fetch user's pools
    const { data: userPools, error: poolsError } = await supabase
      .from('pool_members')
      .select(`
        pool_id,
        contribution_amount,
        status,
        joined_at,
        pools (
          id,
          name,
          type,
          status,
          total_saved,
          target_amount,
          progress,
          created_at
        )
      `)
      .eq('member_address', userAddress.toLowerCase())

    if (poolsError) throw poolsError

    // Fetch user's activities
    const { data: activities, error: activitiesError } = await supabase
      .from('pool_activity')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .order('created_at', { ascending: true })

    if (activitiesError) throw activitiesError

    // Calculate overview stats
    const activePoolsCount = userPools?.filter(
      (p) => p.pools?.status === 'active'
    ).length || 0

    const completedPoolsCount = userPools?.filter(
      (p) => p.pools?.status === 'completed'
    ).length || 0

    const totalSaved = userPools?.reduce((sum, p) => {
      return sum + (p.pools?.total_saved || 0)
    }, 0) || 0

    const totalContributions = activities?.filter(
      (a) => a.activity_type === 'deposit' || a.activity_type === 'contribution'
    ).length || 0

    const onTimeContributions = userPools?.filter(
      (p) => p.status === 'paid'
    ).length || 0

    const totalExpectedContributions = userPools?.length || 1

    const onTimePaymentRate = Math.round(
      (onTimeContributions / totalExpectedContributions) * 100
    )

    const emergencyWithdrawals = activities?.filter(
      (a) => a.activity_type === 'emergency_executed'
    ).length || 0

    // Calculate reputation score
    let reputationScore = 50 // Base score
    reputationScore += Math.min(onTimePaymentRate * 0.4, 40) // Up to 40 points for on-time
    reputationScore += Math.min(completedPoolsCount * 2, 20) // Up to 20 points for completed pools
    reputationScore -= emergencyWithdrawals * 5 // Minus 5 points per emergency
    reputationScore = Math.max(0, Math.min(100, reputationScore)) // Clamp between 0-100

    // Calculate savings trend based on timeframe
    const savingsTrend = calculateSavingsTrend(activities, timeframe)

    // Pool breakdown
    const poolBreakdown = userPools?.map((p) => ({
      name: p.pools?.name || 'Unknown Pool',
      type: p.pools?.type || 'unknown',
      amount: p.contribution_amount || 0,
      progress: p.pools?.progress || 0,
      status: p.pools?.status || 'unknown',
    })) || []

    // Monthly stats
    const monthlyStats = calculateMonthlyStats(activities)

    // Performance metrics
    const performanceMetrics = calculatePerformanceMetrics(activities, monthlyStats)

    const overview = {
      totalSaved,
      activePoolsCount,
      completedPoolsCount,
      onTimePaymentRate,
      totalContributions,
      averagePoolSize: userPools?.length ? totalSaved / userPools.length : 0,
      emergencyWithdrawals,
      reputationScore: Math.round(reputationScore),
    }

    return NextResponse.json({
      overview,
      savingsTrend,
      poolBreakdown,
      monthlyStats,
      performanceMetrics,
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper: Calculate savings trend
function calculateSavingsTrend(activities: any[], timeframe: string) {
  const now = new Date()
  let startDate = new Date()

  switch (timeframe) {
    case 'week':
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(now.getMonth() - 1)
      break
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1)
      break
  }

  const relevantActivities = activities.filter((a) => {
    const activityDate = new Date(a.created_at)
    return activityDate >= startDate && activityDate <= now
  })

  const dailyData: Record<string, number> = {}
  let cumulative = 0

  relevantActivities.forEach((activity) => {
    const date = new Date(activity.created_at).toISOString().split('T')[0]
    const amount = activity.amount || 0

    if (activity.activity_type === 'deposit' || activity.activity_type === 'contribution') {
      cumulative += amount
    } else if (activity.activity_type === 'withdrawal') {
      cumulative -= amount
    }

    dailyData[date] = cumulative
  })

  return Object.entries(dailyData).map(([date, cumulative]) => ({
    date: formatDate(date, timeframe),
    amount: cumulative,
    cumulative,
  }))
}

// Helper: Calculate monthly stats
function calculateMonthlyStats(activities: any[]) {
  const monthlyData: Record<string, { deposits: number; withdrawals: number }> = {}

  activities.forEach((activity) => {
    const month = new Date(activity.created_at).toISOString().slice(0, 7) // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { deposits: 0, withdrawals: 0 }
    }

    const amount = activity.amount || 0
    if (activity.activity_type === 'deposit' || activity.activity_type === 'contribution') {
      monthlyData[month].deposits += amount
    } else if (activity.activity_type === 'withdrawal') {
      monthlyData[month].withdrawals += amount
    }
  })

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // Last 6 months
    .map(([month, data]) => ({
      month: formatMonth(month),
      deposits: data.deposits,
      withdrawals: data.withdrawals,
      net: data.deposits - data.withdrawals,
    }))
}

// Helper: Calculate performance metrics
function calculatePerformanceMetrics(activities: any[], monthlyStats: any[]) {
  const deposits = activities.filter(
    (a) => a.activity_type === 'deposit' || a.activity_type === 'contribution'
  )

  const monthlyTotals = monthlyStats.map((m) => ({
    month: m.month,
    amount: m.deposits,
  }))

  const bestMonth = monthlyTotals.reduce(
    (best, current) => (current.amount > best.amount ? current : best),
    { month: 'N/A', amount: 0 }
  )

  const averageMonthly =
    monthlyTotals.reduce((sum, m) => sum + m.amount, 0) / (monthlyTotals.length || 1)

  const projectedYearly = averageMonthly * 12

  // Calculate growth rate (comparing last month to average)
  const lastMonth = monthlyTotals[monthlyTotals.length - 1]?.amount || 0
  const growthRate = averageMonthly
    ? ((lastMonth - averageMonthly) / averageMonthly) * 100
    : 0

  return {
    bestMonth,
    averageMonthly,
    projectedYearly,
    growthRate,
  }
}

// Helper: Format date based on timeframe
function formatDate(dateString: string, timeframe: string): string {
  const date = new Date(dateString)
  switch (timeframe) {
    case 'week':
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    case 'year':
      return date.toLocaleDateString('en-US', { month: 'short' })
    default:
      return dateString
  }
}

// Helper: Format month
function formatMonth(monthString: string): string {
  const [year, month] = monthString.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}