import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch activity feed
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const poolId = searchParams.get('poolId')
    const userAddress = searchParams.get('userAddress')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('pool_activity')
      .select(`
        *,
        pools (
          id,
          name,
          type
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by pool
    if (poolId) {
      query = query.eq('pool_id', poolId)
    }

    // Filter by user
    if (userAddress) {
      query = query.eq('user_address', userAddress.toLowerCase())
    }

    const { data, error } = await query

    if (error) {
      console.error('Activity fetch error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Activity fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Create activity (called after blockchain events)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      poolId,
      activityType,
      userAddress,
      amount,
      description,
      txHash,
    } = body

    // Validate required fields
    if (!poolId || !activityType) {
      return NextResponse.json(
        { error: 'poolId and activityType are required' },
        { status: 400 }
      )
    }

    // Insert activity
    const { data, error } = await supabase
      .from('pool_activity')
      .insert([
        {
          pool_id: poolId,
          activity_type: activityType,
          user_address: userAddress?.toLowerCase() || null,
          amount: amount || null,
          description: description || null,
          tx_hash: txHash || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Activity creation error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Create notifications for relevant users
    if (data) {
      await createNotificationsForActivity(data)
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Activity creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper function to create notifications based on activity
async function createNotificationsForActivity(activity: any) {
  try {
    // Get pool details and members
    const { data: pool } = await supabase
      .from('pools')
      .select(`
        *,
        pool_members (
          member_address
        )
      `)
      .eq('id', activity.pool_id)
      .single()

    if (!pool) return

    const notifications: any[] = []

    // Determine who should be notified based on activity type
    switch (activity.activity_type) {
      case 'deposit':
      case 'contribution':
        // Notify all other members about deposits
        pool.pool_members.forEach((member: any) => {
          if (member.member_address.toLowerCase() !== activity.user_address?.toLowerCase()) {
            notifications.push({
              user_address: member.member_address.toLowerCase(),
              pool_id: pool.id,
              type: 'deposit',
              title: '💰 New Deposit',
              message: `A member deposited ${activity.amount || 0} ETH to ${pool.name}`,
              action_url: `/dashboard/group/${pool.id}`,
              read: false,
            })
          }
        })
        break

      case 'emergency_requested':
        // Notify all members about emergency requests
        pool.pool_members.forEach((member: any) => {
          if (member.member_address.toLowerCase() !== activity.user_address?.toLowerCase()) {
            notifications.push({
              user_address: member.member_address.toLowerCase(),
              pool_id: pool.id,
              type: 'emergency',
              title: '🚨 Emergency Withdrawal Requested',
              message: `A member requested emergency withdrawal from ${pool.name}. Your vote is needed!`,
              action_url: `/dashboard/group/${pool.id}?tab=emergency`,
              read: false,
            })
          }
        })
        break

      case 'emergency_voted':
        // Notify requester about votes
        if (activity.user_address) {
          notifications.push({
            user_address: activity.user_address.toLowerCase(),
            pool_id: pool.id,
            type: 'vote',
            title: '👍 Vote Received',
            message: `A member voted on your emergency request in ${pool.name}`,
            action_url: `/dashboard/group/${pool.id}?tab=emergency`,
            read: false,
          })
        }
        break

      case 'payout':
        // Notify recipient about payout
        if (activity.user_address) {
          notifications.push({
            user_address: activity.user_address.toLowerCase(),
            pool_id: pool.id,
            type: 'payout',
            title: '🎉 Payout Received!',
            message: `You received ${activity.amount || 0} ETH from ${pool.name}`,
            action_url: `/dashboard/group/${pool.id}`,
            read: false,
          })
        }
        break

      case 'target_reached':
        // Notify all members
        pool.pool_members.forEach((member: any) => {
          notifications.push({
            user_address: member.member_address.toLowerCase(),
            pool_id: pool.id,
            type: 'milestone',
            title: '🎯 Target Reached!',
            message: `${pool.name} has reached its savings target!`,
            action_url: `/dashboard/group/${pool.id}`,
            read: false,
          })
        })
        break
    }

    // Insert all notifications
    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications)
    }
  } catch (error) {
    console.error('Failed to create notifications:', error)
  }
}