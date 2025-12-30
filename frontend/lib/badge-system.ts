import { supabase } from './supabase'

/**
 * Badge definitions and requirements
 */
export const BADGE_DEFINITIONS = {
  early_adopter: {
    name: "Early Adopter",
    description: "Joined in the first 100 members",
    icon: "🚀",
    requirement: (profile: any) => {
      // Check if user ID is in first 100
      return true // Implement your own logic
    }
  },
  trusted_saver: {
    name: "Trusted Saver",
    description: "Maintained 90+ reputation for 30 days",
    icon: "⭐",
    requirement: (profile: any) => {
      return profile.reputation_score >= 90
    }
  },
  perfect_record: {
    name: "Perfect Record",
    description: "10 consecutive on-time payments",
    icon: "💯",
    requirement: (profile: any) => {
      return profile.on_time_payments >= 10 && profile.late_payments === 0 && profile.missed_payments === 0
    }
  },
  group_leader: {
    name: "Group Leader",
    description: "Created 3 successful groups",
    icon: "👑",
    requirement: (profile: any) => {
      return profile.completed_groups >= 3
    }
  },
  social_butterfly: {
    name: "Social Butterfly",
    description: "Member of 5+ active groups",
    icon: "🦋",
    requirement: (profile: any) => {
      return profile.active_groups >= 5
    }
  },
  consistent_contributor: {
    name: "Consistent Contributor",
    description: "Made 25+ on-time payments",
    icon: "🎯",
    requirement: (profile: any) => {
      return profile.on_time_payments >= 25
    }
  },
  high_roller: {
    name: "High Roller",
    description: "Total contributions over 10 ETH",
    icon: "💎",
    requirement: (profile: any) => {
      return profile.total_contributions >= 10
    }
  },
  marathon_saver: {
    name: "Marathon Saver",
    description: "Completed a 12-month savings group",
    icon: "🏃",
    requirement: (profile: any) => {
      // This would need to check actual group duration
      return profile.completed_groups >= 1
    }
  },
  reliable_member: {
    name: "Reliable Member",
    description: "Maintained 75+ reputation for 60 days",
    icon: "🛡️",
    requirement: (profile: any) => {
      return profile.reputation_score >= 75
    }
  },
  community_builder: {
    name: "Community Builder",
    description: "Invited 10+ members who joined groups",
    icon: "🌟",
    requirement: async (profile: any) => {
      // Check invite success count
      const { count } = await supabase
        .from('invite_uses')
        .select('*', { count: 'exact', head: true })
        .eq('inviter_address', profile.wallet_address)
      
      return (count || 0) >= 10
    }
  }
}

/**
 * Check and award eligible badges to a user
 */
export async function checkAndAwardBadges(walletAddress: string) {
  try {
    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('member_profiles')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()

    if (profileError || !profile) {
      console.error('Failed to fetch profile:', profileError)
      return
    }

    // Fetch existing badges
    const { data: existingBadges } = await supabase
      .from('member_badges')
      .select('badge_type')
      .eq('wallet_address', walletAddress.toLowerCase())

    const existingBadgeTypes = new Set(existingBadges?.map(b => b.badge_type) || [])

    // Check each badge definition
    const newBadges = []
    for (const [badgeType, badge] of Object.entries(BADGE_DEFINITIONS)) {
      // Skip if already has badge
      if (existingBadgeTypes.has(badgeType)) continue

      // Check requirement (handle async requirements)
      let eligible = false
      if (typeof badge.requirement === 'function') {
        const result = badge.requirement(profile)
        eligible = result instanceof Promise ? await result : result
      }

      if (eligible) {
        newBadges.push({
          wallet_address: walletAddress.toLowerCase(),
          badge_type: badgeType,
          badge_name: badge.name,
          badge_description: badge.description,
          badge_icon: badge.icon,
        })
      }
    }

    // Award new badges
    if (newBadges.length > 0) {
      const { error: insertError } = await supabase
        .from('member_badges')
        .insert(newBadges)

      if (insertError) {
        console.error('Failed to award badges:', insertError)
      } else {
        console.log(`Awarded ${newBadges.length} new badges to ${walletAddress}`)
      }
    }

    return newBadges
  } catch (error) {
    console.error('Error in checkAndAwardBadges:', error)
    return []
  }
}

