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

    