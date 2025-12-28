import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { customAlphabet } from 'nanoid'

// Create short invite codes (8 characters, URL-safe)
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8)

// POST - Create new invite link
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pool_id, inviter_address, max_uses, expires_in_days } = body

    if (!pool_id || !inviter_address) {
      return NextResponse.json(
        { error: 'Missing pool_id or inviter_address' },
        { status: 400 }
      )
    }

    // Generate unique invite code
    const inviteCode = nanoid()

    // Calculate expiration date
    let expiresAt = null
    if (expires_in_days) {
      const expiration = new Date()
      expiration.setDate(expiration.getDate() + expires_in_days)
      expiresAt = expiration.toISOString()
    }

    const { data, error } = await supabase
      .from('group_invites')
      .insert([
        {
          pool_id,
          invite_code: inviteCode,
          inviter_address: inviter_address.toLowerCase(),
          max_uses: max_uses || null,
          expires_at: expiresAt,
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Generate invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const inviteUrl = `${baseUrl}/invite/${inviteCode}`

    return NextResponse.json({
      ...data,
      invite_url: inviteUrl,
    })
  } catch (error) {
    console.error('Invite creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

