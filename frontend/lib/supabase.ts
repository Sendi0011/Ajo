import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      pools: {
        Row: {
          id: string
          name: string
          description: string | null
          type: 'rotational' | 'target' | 'flexible'
          status: 'active' | 'completed' | 'paused'
          creator_address: string
          contract_address: string
          token_address: string
          total_saved: number
          target_amount: number | null
          progress: number
          members_count: number
          next_payout: string | null
          next_recipient: string | null
          created_at: string
          updated_at: string
          contribution_amount: number | null
          round_duration: number | null
          frequency: string | null
          deadline: string | null
          minimum_deposit: number | null
          withdrawal_fee: number | null
          yield_enabled: boolean
        }
        Insert: {
          name: string
          description?: string | null
          type: 'rotational' | 'target' | 'flexible'
          status?: 'active' | 'completed' | 'paused'
          creator_address: string
          contract_address: string
          token_address: string
          total_saved?: number
          target_amount?: number | null
          progress?: number
          members_count?: number
          next_payout?: string | null
          next_recipient?: string | null
          contribution_amount?: number | null
          round_duration?: number | null
          frequency?: string | null
          deadline?: string | null
          minimum_deposit?: number | null
          withdrawal_fee?: number | null
          yield_enabled?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          type?: 'rotational' | 'target' | 'flexible'
          status?: 'active' | 'completed' | 'paused'
          creator_address?: string
          contract_address?: string
          token_address?: string
          total_saved?: number
          target_amount?: number | null
          progress?: number
          members_count?: number
          next_payout?: string | null
          next_recipient?: string | null
          contribution_amount?: number | null
          round_duration?: number | null
          frequency?: string | null
          deadline?: string | null
          minimum_deposit?: number | null
          withdrawal_fee?: number | null
          yield_enabled?: boolean
        }
      }
      pool_members: {
        Row: {
          id: string
          pool_id: string
          member_address: string
          contribution_amount: number
          status: 'pending' | 'paid' | 'late'
          joined_at: string
          invited_by: string | null
          invite_id: string | null
        }
        Insert: {
          pool_id: string
          member_address: string
          contribution_amount?: number
          status?: 'pending' | 'paid' | 'late'
          invited_by?: string | null
          invite_id?: string | null
        }
        Update: {
          pool_id?: string
          member_address?: string
          contribution_amount?: number
          status?: 'pending' | 'paid' | 'late'
          invited_by?: string | null
          invite_id?: string | null
        }
      }
      pool_activity: {
        Row: {
          id: string
          pool_id: string
          activity_type: string
          user_address: string | null
          amount: number | null
          description: string | null
          tx_hash: string | null
          created_at: string
        }
        Insert: {
          pool_id: string
          activity_type: string
          user_address?: string | null
          amount?: number | null
          description?: string | null
          tx_hash?: string | null
        }
        Update: {
          pool_id?: string
          activity_type?: string
          user_address?: string | null
          amount?: number | null
          description?: string | null
          tx_hash?: string | null
        }
      }
      member_profiles: {
        Row: {
          id: string
          wallet_address: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          reputation_score: number
          total_groups_joined: number
          active_groups: number
          completed_groups: number
          total_contributions: number
          on_time_payments: number
          late_payments: number
          missed_payments: number
          verified_phone: boolean
          verified_email: boolean
          kyc_verified: boolean
          created_at: string
          updated_at: string
          last_active_at: string
        }
        Insert: {
          wallet_address: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          reputation_score?: number
          total_groups_joined?: number
          active_groups?: number
          completed_groups?: number
          total_contributions?: number
          on_time_payments?: number
          late_payments?: number
          missed_payments?: number
          verified_phone?: boolean
          verified_email?: boolean
          kyc_verified?: boolean
        }
        Update: {
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          reputation_score?: number
          total_groups_joined?: number
          active_groups?: number
          completed_groups?: number
          total_contributions?: number
          on_time_payments?: number
          late_payments?: number
          missed_payments?: number
          verified_phone?: boolean
          verified_email?: boolean
          kyc_verified?: boolean
        }
      }
      reputation_history: {
        Row: {
          id: string
          wallet_address: string
          pool_id: string | null
          action_type: string
          points_change: number
          previous_score: number
          new_score: number
          description: string | null
          created_at: string
        }
        Insert: {
          wallet_address: string
          pool_id?: string | null
          action_type: string
          points_change: number
          previous_score: number
          new_score: number
          description?: string | null
        }
        Update: {
          wallet_address?: string
          pool_id?: string | null
          action_type?: string
          points_change?: number
          previous_score?: number
          new_score?: number
          description?: string | null
        }
      }
      member_badges: {
        Row: {
          id: string
          wallet_address: string
          badge_type: string
          badge_name: string
          badge_description: string | null
          badge_icon: string | null
          earned_at: string
        }
        Insert: {
          wallet_address: string
          badge_type: string
          badge_name: string
          badge_description?: string | null
          badge_icon?: string | null
        }
        Update: {
          badge_type?: string
          badge_name?: string
          badge_description?: string | null
          badge_icon?: string | null
        }
      }
      group_invites: {
        Row: {
          id: string
          pool_id: string
          invite_code: string
          inviter_address: string
          max_uses: number | null
          uses_count: number
          expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          pool_id: string
          invite_code: string
          inviter_address: string
          max_uses?: number | null
          uses_count?: number
          expires_at?: string | null
          is_active?: boolean
        }
        Update: {
          pool_id?: string
          invite_code?: string
          inviter_address?: string
          max_uses?: number | null
          uses_count?: number
          expires_at?: string | null
          is_active?: boolean
        }
      }
      invite_uses: {
        Row: {
          id: string
          invite_id: string
          invitee_address: string
          used_at: string
        }
        Insert: {
          invite_id: string
          invitee_address: string
        }
        Update: {
          invite_id?: string
          invitee_address?: string
        }
      }
    }
  }
}

// Helper function to ensure member profile exists
export async function ensureMemberProfile(walletAddress: string) {
  const { data, error } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single()

  if (error && error.code === 'PGRST116') {
    // Profile doesn't exist, create it
    const { data: newProfile, error: createError } = await supabase
      .from('member_profiles')
      .insert([{ wallet_address: walletAddress.toLowerCase() }])
      .select()
      .single()

    if (createError) throw createError
    return newProfile
  }

  if (error) throw error
  return data
}

// Helper function to update reputation after payment
export async function updateReputationAfterPayment(
  walletAddress: string,
  poolId: string,
  wasOnTime: boolean
) {
  const profile = await ensureMemberProfile(walletAddress)

  const updates: any = {
    last_active_at: new Date().toISOString(),
  }

  if (wasOnTime) {
    updates.on_time_payments = (profile.on_time_payments || 0) + 1
  } else {
    updates.late_payments = (profile.late_payments || 0) + 1
  }

  const { data: updatedProfile, error } = await supabase
    .from('member_profiles')
    .update(updates)
    .eq('wallet_address', walletAddress.toLowerCase())
    .select()
    .single()

  if (error) throw error

  // Record in history
  const pointsChange = wasOnTime ? 5 : -2
  await supabase.from('reputation_history').insert([
    {
      wallet_address: walletAddress.toLowerCase(),
      pool_id: poolId,
      action_type: wasOnTime ? 'payment_made' : 'payment_late',
      points_change: pointsChange,
      previous_score: profile.reputation_score,
      new_score: updatedProfile.reputation_score,
      description: wasOnTime ? 'On-time payment made' : 'Late payment made',
    },
  ])

  return updatedProfile
}

// Helper function to save pool (updated with profile creation)
export async function savePoolToDatabase({
  name,
  description,
  poolType,
  creatorAddress,
  contractAddress,
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
}: {
  name: string
  description: string | null
  poolType: 'rotational' | 'target' | 'flexible'
  creatorAddress: string
  contractAddress: string
  tokenAddress: string
  members: string[]
  contributionAmount?: string
  roundDuration?: number
  frequency?: string
  targetAmount?: string
  deadline?: string
  minimumDeposit?: string
  withdrawalFee?: string
  yieldEnabled?: boolean
}) {
  try {
    // Ensure creator has a profile
    await ensureMemberProfile(creatorAddress)

    // Ensure all members have profiles
    for (const member of members) {
      await ensureMemberProfile(member)
    }

    // Insert pool
    const { data: pool, error: poolError } = await supabase
      .from('pools')
      .insert([
        {
          name,
          description,
          type: poolType,
          status: 'active',
          creator_address: creatorAddress.toLowerCase(),
          contract_address: contractAddress.toLowerCase(),
          token_address: tokenAddress.toLowerCase(),
          members_count: members.length,
          contribution_amount: contributionAmount ? parseFloat(contributionAmount) : null,
          round_duration: roundDuration || null,
          frequency: frequency || null,
          target_amount: targetAmount ? parseFloat(targetAmount) : null,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          minimum_deposit: minimumDeposit ? parseFloat(minimumDeposit) : null,
          withdrawal_fee: withdrawalFee ? parseFloat(withdrawalFee) : null,
          yield_enabled: yieldEnabled || false,
        },
      ])
      .select()

    if (poolError) throw poolError
    if (!pool || pool.length === 0) throw new Error('Failed to create pool')

    const poolId = pool[0].id

    // Insert members
    if (members.length > 0) {
      const memberData = members.map((address) => ({
        pool_id: poolId,
        member_address: address.toLowerCase(),
        contribution_amount: contributionAmount ? parseFloat(contributionAmount) : 0,
        status: 'pending' as const,
      }))

      const { error: membersError } = await supabase
        .from('pool_members')
        .insert(memberData)

      if (membersError) throw membersError

      // Update member profiles: increment total_groups_joined and active_groups
      for (const member of members) {
        await supabase.rpc('ensure_member_profile', { p_wallet_address: member.toLowerCase() })
        
        const { data: memberProfile } = await supabase
          .from('member_profiles')
          .select('total_groups_joined, active_groups')
          .eq('wallet_address', member.toLowerCase())
          .single()

        if (memberProfile) {
          await supabase
            .from('member_profiles')
            .update({
              total_groups_joined: (memberProfile.total_groups_joined || 0) + 1,
              active_groups: (memberProfile.active_groups || 0) + 1,
            })
            .eq('wallet_address', member.toLowerCase())
        }
      }
    }

    // Log activity
    await supabase.from('pool_activity').insert([
      {
        pool_id: poolId,
        activity_type: 'pool_created',
        user_address: creatorAddress.toLowerCase(),
        description: `${poolType} pool created`,
      },
    ])

    return { success: true, poolId, pool: pool[0] }
  } catch (error) {
    console.error('Failed to save pool:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}