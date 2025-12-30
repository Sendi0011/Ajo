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

/**
 * Award a specific badge to a user
 */
export async function awardBadge(
  walletAddress: string,
  badgeType: keyof typeof BADGE_DEFINITIONS
) {
  const badge = BADGE_DEFINITIONS[badgeType]
  if (!badge) {
    throw new Error(`Unknown badge type: ${badgeType}`)
  }

  try {
    const { data, error } = await supabase
      .from('member_badges')
      .insert([
        {
          wallet_address: walletAddress.toLowerCase(),
          badge_type: badgeType,
          badge_name: badge.name,
          badge_description: badge.description,
          badge_icon: badge.icon,
        },
      ])
      .select()
      .single()

    if (error) {
      // Badge already exists
      if (error.code === '23505') {
        return { success: false, message: 'Badge already earned' }
      }
      throw error
    }

    return { success: true, badge: data }
  } catch (error) {
    console.error('Failed to award badge:', error)
    return { success: false, error }
  }
}

/**
 * Get badges for a user with progress tracking
 */
export async function getUserBadgesWithProgress(walletAddress: string) {
  try {
    // Fetch profile
    const { data: profile } = await supabase
      .from('member_profiles')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()

    if (!profile) return []

    // Fetch earned badges
    const { data: earnedBadges } = await supabase
      .from('member_badges')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())

    const earnedBadgeTypes = new Set(earnedBadges?.map(b => b.badge_type) || [])

    // Calculate progress for all badges
    const badgesWithProgress = await Promise.all(
      Object.entries(BADGE_DEFINITIONS).map(async ([badgeType, badge]) => {
        const earned = earnedBadgeTypes.has(badgeType)
        
        // Calculate progress (0-100%)
        let progress = 0
        if (!earned) {
          // Add custom progress calculation per badge
          switch (badgeType) {
            case 'perfect_record':
              progress = Math.min(100, (profile.on_time_payments / 10) * 100)
              break
            case 'trusted_saver':
              progress = Math.min(100, (profile.reputation_score / 90) * 100)
              break
            case 'social_butterfly':
              progress = Math.min(100, (profile.active_groups / 5) * 100)
              break
            case 'consistent_contributor':
              progress = Math.min(100, (profile.on_time_payments / 25) * 100)
              break
            case 'high_roller':
              progress = Math.min(100, (profile.total_contributions / 10) * 100)
              break
            default:
              const requirement = badge.requirement(profile)
              progress = requirement ? 100 : 0
          }
        } else {
          progress = 100
        }

        return {
          type: badgeType,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          earned,
          progress: Math.round(progress),
          earnedAt: earnedBadges?.find(b => b.badge_type === badgeType)?.earned_at || null,
        }
      })
    )

    return badgesWithProgress
  } catch (error) {
    console.error('Failed to get badges with progress:', error)
    return []
  }
}

