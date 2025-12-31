import { supabase, savePoolToDatabase } from '@/lib/supabase'
import { triggerBadgeCheck } from '@/lib/badge-system'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      name,
      description,
      poolType,
      creatorAddress,
      poolAddress,
      tokenAddress,
      members,
      contributionAmount,
      roundDuration,
      frequency,
      targetAmount,
      deadline,
      minimumDeposit,
      withdrawalFee,
      yieldEnabled,
      txHash,
      inviteCode, // NEW: Optional invite code if joining via invite
    } = body

    // Validate required fields
    if (!name || !poolType || !creatorAddress || !poolAddress || !tokenAddress || !members?.length) {
      return NextResponse.json(
        { error: 'Missing required fields. Need: name, poolType, creatorAddress, poolAddress, tokenAddress, members' },
        { status: 400 }
      )
    }

    
    const result = await savePoolToDatabase({
      name,
      description,
      poolType,
      creatorAddress,
      contractAddress: poolAddress,
      tokenAddress,
      members,
      contributionAmount,
      roundDuration,
      frequency,
      targetAmount,
      deadline,
      minimumDeposit,
      withdrawalFee,
      yieldEnabled,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to save pool' },
        { status: 500 }
      )
    }

    // Log the pool creation activity with tx hash
    if (txHash && result.poolId) {
      await supabase.from('pool_activity').insert([
        {
          pool_id: result.poolId,
          activity_type: 'pool_created',
          user_address: creatorAddress.toLowerCase(),
          description: `${poolType} pool created`,
          tx_hash: txHash,
        },
      ])
    }

    // If created via invite, mark the invite as used
    if (inviteCode) {
      try {
        const { data: invite } = await supabase
          .from('group_invites')
          .select('id, inviter_address')
          .eq('invite_code', inviteCode)
          .single()

        if (invite) {
          // Record invite use
          await supabase.from('invite_uses').insert([
            {
              invite_id: invite.id,
              invitee_address: creatorAddress.toLowerCase(),
            },
          ])

          // Increment uses count
          await supabase
            .from('group_invites')
            .update({ 
              uses_count: supabase.rpc('increment', { x: 1 }) 
            })
            .eq('id', invite.id)

          // Update pool_members to track who invited
          await supabase
            .from('pool_members')
            .update({ 
              invited_by: invite.inviter_address,
              invite_id: invite.id 
            })
            .eq('pool_id', result.poolId)
            .eq('member_address', creatorAddress.toLowerCase())
        }
      } catch (err) {
        console.error('Failed to track invite usage:', err)
        // Don't fail the pool creation if invite tracking fails
      }
    }

    // Award "Group Leader" badge to creator if they've created multiple groups
    try {
      await triggerBadgeCheck(creatorAddress, 'pool_created')
    } catch (err) {
      console.error('Failed to check badges:', err)
    }

    return NextResponse.json({
      ...result.pool,
      message: 'Pool created successfully! Profiles created for all members.'
    }, { status: 201 })
  } catch (error) {
    console.error('Pool creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const poolId = req.nextUrl.searchParams.get('id')
    const creatorAddress = req.nextUrl.searchParams.get('creator')
    const memberAddress = req.nextUrl.searchParams.get('member')

    if (poolId) {
      // Fetch single pool by ID with member profiles
      const { data, error } = await supabase
        .from('pools')
        .select(`
          *,
          pool_members (
            id,
            member_address,
            contribution_amount,
            status,
            invited_by,
            profile:member_address (
              wallet_address,
              display_name,
              reputation_score,
              avatar_url,
              on_time_payments,
              total_groups_joined
            )
          ),
          pool_activity (
            id,
            activity_type,
            user_address,
            amount,
            description,
            created_at,
            tx_hash
          )
        `)
        .eq('id', poolId)
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Pool not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(data)
    } else if (creatorAddress) {
      // Fetch all pools by creator
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .eq('creator_address', creatorAddress.toLowerCase())
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return NextResponse.json(data || [])
    } else if (memberAddress) {
      // NEW: Fetch all pools where user is a member
      const { data: memberPools, error } = await supabase
        .from('pool_members')
        .select(`
          *,
          pools:pool_id (
            id,
            name,
            type,
            status,
            creator_address,
            members_count,
            total_saved,
            created_at
          )
        `)
        .eq('member_address', memberAddress.toLowerCase())
        .order('joined_at', { ascending: false })

      if (error) {
        throw error
      }

      return NextResponse.json(memberPools || [])
    } else {
      // Fetch all pools
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        throw error
      }

      return NextResponse.json(data || [])
    }
  } catch (error) {
    console.error('Pool fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const poolId = req.nextUrl.searchParams.get('id')

    if (!poolId) {
      return NextResponse.json(
        { error: 'Pool ID required' },
        { status: 400 }
      )
    }

    const body = await req.json()

    // If updating pool status to 'completed', update member stats
    if (body.status === 'completed') {
      try {
        // Get all pool members
        const { data: members } = await supabase
          .from('pool_members')
          .select('member_address')
          .eq('pool_id', poolId)

        if (members && members.length > 0) {
          // Update each member's completed_groups and active_groups
          for (const member of members) {
            const { data: profile } = await supabase
              .from('member_profiles')
              .select('completed_groups, active_groups')
              .eq('wallet_address', member.member_address)
              .single()

            if (profile) {
              await supabase
                .from('member_profiles')
                .update({
                  completed_groups: (profile.completed_groups || 0) + 1,
                  active_groups: Math.max(0, (profile.active_groups || 1) - 1),
                })
                .eq('wallet_address', member.member_address)

              // Check for badges
              await triggerBadgeCheck(member.member_address, 'group_completed')
            }
          }
        }
      } catch (err) {
        console.error('Failed to update member stats:', err)
      }
    }

    const { data, error } = await supabase
      .from('pools')
      .update(body)
      .eq('id', poolId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update pool' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Pool update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}