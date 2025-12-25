import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userAddress = searchParams.get('userAddress')

    if (!userAddress) {
      return NextResponse.json(
        { error: 'userAddress is required' },
        { status: 400 }
      )
    }

    // Fetch user's pools with payment information
    const { data: poolMembers, error: poolError } = await supabase
      .from('pool_members')
      .select(`
        *,
        pools (
          id,
          name,
          type,
          status,
          contribution_amount,
          round_duration,
          frequency,
          deadline,
          next_payout,
          created_at
        )
      `)
      .eq('member_address', userAddress.toLowerCase())

    if (poolError) throw poolError

    // Fetch user's payment activities
    const { data: activities, error: activitiesError } = await supabase
      .from('pool_activity')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .in('activity_type', ['deposit', 'contribution'])

    if (activitiesError) throw activitiesError

    const payments: any[] = []
    const now = new Date()

    // Process each pool to generate payment deadlines
    poolMembers?.forEach((member) => {
      const pool = member.pools
      if (!pool || pool.status !== 'active') return

      // Check if user has already paid for current period
      const recentPayment = activities?.find(
        (a) =>
          a.pool_id === pool.id &&
          new Date(a.created_at) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      )

      let dueDate: Date | null = null

      // Calculate due date based on pool type
      if (pool.type === 'rotational') {
        // For rotational: use next_payout if available
        if (pool.next_payout) {
          dueDate = new Date(pool.next_payout)
        } else if (pool.round_duration) {
          // Calculate next payment based on round duration
          const createdAt = new Date(pool.created_at)
          const roundMs = pool.round_duration * 1000
          const roundsPassed = Math.floor((now.getTime() - createdAt.getTime()) / roundMs)
          dueDate = new Date(createdAt.getTime() + (roundsPassed + 1) * roundMs)
        }
      } else if (pool.type === 'target') {
        // For target: use deadline
        if (pool.deadline) {
          dueDate = new Date(pool.deadline)
        }
      } else if (pool.type === 'flexible') {
        // For flexible: no fixed deadline, but show reminder for regular contributions
        // Use a monthly reminder
        const monthAgo = new Date(now)
        monthAgo.setMonth(monthAgo.getMonth() - 1)

        if (!recentPayment || new Date(recentPayment.created_at) < monthAgo) {
          dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      }

      if (!dueDate) return

      // Skip if due date has passed and payment was made
      if (recentPayment && dueDate < now) return

      // Determine status
      const timeUntilDue = dueDate.getTime() - now.getTime()
      const hoursUntilDue = timeUntilDue / (1000 * 60 * 60)

      let status: 'upcoming' | 'due_soon' | 'overdue' | 'paid' = 'upcoming'

      if (dueDate < now && !recentPayment) {
        status = 'overdue'
      } else if (hoursUntilDue < 24) {
        status = 'due_soon'
      } else if (recentPayment) {
        status = 'paid'
      }

      // Calculate grace period (typically 24-48 hours after due date)
      const gracePeriod = new Date(dueDate.getTime() + 48 * 60 * 60 * 1000)

      payments.push({
        id: `${pool.id}-${dueDate.getTime()}`,
        poolId: pool.id,
        poolName: pool.name,
        poolType: pool.type,
        amount: pool.contribution_amount || 0,
        dueDate: dueDate.toISOString(),
        status,
        hasPaid: !!recentPayment,
        gracePeriod: gracePeriod.toISOString(),
      })
    })

    // Sort by due date (soonest first)
    payments.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Calendar payments fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Mark payment as snoozed (store reminder for later)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userAddress, paymentId, snoozeUntil } = body

    if (!userAddress || !paymentId) {
      return NextResponse.json(
        { error: 'userAddress and paymentId are required' },
        { status: 400 }
      )
    }

    // Store snooze preference in localStorage or database
    // For now, we'll just return success
    // In production, you might want to store this in a reminders table

    return NextResponse.json({ success: true, snoozeUntil })
  } catch (error) {
    console.error('Snooze payment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}