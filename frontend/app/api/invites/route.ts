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

// GET - Fetch invite details or list invites
export async function GET(req: NextRequest) {
  try {
    const inviteCode = req.nextUrl.searchParams.get('code')
    const poolId = req.nextUrl.searchParams.get('pool_id')
    const inviterAddress = req.nextUrl.searchParams.get('inviter')

    if (inviteCode) {
      // Fetch single invite by code
      const { data, error } = await supabase
        .from('group_invites')
        .select(`
          *,
          pools:pool_id (
            id,
            name,
            type,
            description,
            members_count,
            creator_address,
            status
          ),
          inviter:inviter_address (
            wallet_address,
            display_name,
            reputation_score,
            avatar_url
          )
        `)
        .eq('invite_code', inviteCode)
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Invite not found' },
          { status: 404 }
        )
      }

      // Check if invite is still valid
      const isValid = data.is_active &&
        (!data.expires_at || new Date(data.expires_at) > new Date()) &&
        (!data.max_uses || data.uses_count < data.max_uses)

      // Fetch recent uses
      const { data: recentUses } = await supabase
        .from('invite_uses')
        .select('*, invitee:invitee_address(*)')
        .eq('invite_id', data.id)
        .order('used_at', { ascending: false })
        .limit(5)

      return NextResponse.json({
        ...data,
        is_valid: isValid,
        recent_uses: recentUses || [],
      })
    } else if (poolId) {
      // Fetch all invites for a pool
      const { data, error } = await supabase
        .from('group_invites')
        .select('*')
        .eq('pool_id', poolId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json(data || [])
    } else if (inviterAddress) {
      // Fetch all invites by inviter
      const { data, error } = await supabase
        .from('group_invites')
        .select(`
          *,
          pools:pool_id (
            id,
            name,
            type
          )
        `)
        .eq('inviter_address', inviterAddress.toLowerCase())
        .order('created_at', { ascending: false })

      if (error) throw error
      return NextResponse.json(data || [])
    } else {
      return NextResponse.json(
        { error: 'Provide code, pool_id, or inviter parameter' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Invite fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PATCH - Use invite (join via invite code)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { invite_code, invitee_address } = body

    if (!invite_code || !invitee_address) {
      return NextResponse.json(
        { error: 'Missing invite_code or invitee_address' },
        { status: 400 }
      )
    }

    // Fetch invite
    const { data: invite, error: inviteError } = await supabase
      .from('group_invites')
      .select('*')
      .eq('invite_code', invite_code)
      .single()

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      )
    }

    // Validate invite
    if (!invite.is_active) {
      return NextResponse.json(
        { error: 'Invite has been deactivated' },
        { status: 400 }
      )
    }

    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Invite has expired' },
        { status: 400 }
      )
    }

    if (invite.max_uses && invite.uses_count >= invite.max_uses) {
      return NextResponse.json(
        { error: 'Invite has reached maximum uses' },
        { status: 400 }
      )
    }

    
}