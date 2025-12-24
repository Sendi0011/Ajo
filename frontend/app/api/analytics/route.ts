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

    