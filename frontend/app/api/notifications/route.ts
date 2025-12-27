import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch user notifications
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userAddress = searchParams.get('userAddress')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!userAddress) {
      return NextResponse.json(
        { error: 'userAddress is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('notifications')
      .select(`
        *,
        pools (
          id,
          name,
          type
        )
      `)
      .eq('user_address', userAddress.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('Notifications fetch error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Create notification (for manual triggers)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      userAddress,
      poolId,
      type,
      title,
      message,
      actionUrl,
    } = body

    if (!userAddress || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_address: userAddress.toLowerCase(),
          pool_id: poolId || null,
          type,
          title,
          message,
          action_url: actionUrl || null,
          read: false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Notification creation error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Trigger browser push notification if user has permission
    await sendBrowserNotification(userAddress, title, message)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Notification creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Helper to send browser notification (optional)
async function sendBrowserNotification(
  userAddress: string,
  title: string,
  message: string
) {
  // This would integrate with a push notification service
  // For now, it's just a placeholder
  console.log(`Browser notification for ${userAddress}: ${title}`)
}