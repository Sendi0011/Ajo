import { supabase, ensureMemberProfile } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch profile by wallet address
export async function GET(req: NextRequest) {
  try {
    const walletAddress = req.nextUrl.searchParams.get('address')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    // Ensure profile exists (creates if not)
    const profile = await ensureMemberProfile(walletAddress)

    // Fetch badges
    const { data: badges } = await supabase
      .from('member_badges')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .order('earned_at', { ascending: false })

    // Fetch recent reputation history
    const { data: reputationHistory } = await supabase
      .from('reputation_history')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(10)

    // Fetch pools the user is part of
    const { data: memberPools } = await supabase
      .from('pool_members')
      .select(`
        *,
        pools:pool_id (
          id,
          name,
          type,
          status,
          created_at
        )
      `)
      .eq('member_address', walletAddress.toLowerCase())

    return NextResponse.json({
      profile,
      badges: badges || [],
      reputationHistory: reputationHistory || [],
      pools: memberPools || [],
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PATCH - Update profile
export async function PATCH(req: NextRequest) {
  try {
    const walletAddress = req.nextUrl.searchParams.get('address')
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { display_name, bio, avatar_url } = body

    // Only allow updating these safe fields
    const updates: any = {}
    if (display_name !== undefined) updates.display_name = display_name
    if (bio !== undefined) updates.bio = bio
    if (avatar_url !== undefined) updates.avatar_url = avatar_url
    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('member_profiles')
      .update(updates)
      .eq('wallet_address', walletAddress.toLowerCase())
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Award badge to user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { wallet_address, badge_type, badge_name, badge_description, badge_icon } = body

    if (!wallet_address || !badge_type || !badge_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Ensure profile exists
    await ensureMemberProfile(wallet_address)

    // Award badge (will not duplicate due to UNIQUE constraint)
    const { data, error } = await supabase
      .from('member_badges')
      .insert([
        {
          wallet_address: wallet_address.toLowerCase(),
          badge_type,
          badge_name,
          badge_description: badge_description || null,
          badge_icon: badge_icon || null,
        },
      ])
      .select()
      .single()

    if (error) {
      // If badge already exists, just return success
      if (error.code === '23505') {
        return NextResponse.json({ message: 'Badge already earned' })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Badge award error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}