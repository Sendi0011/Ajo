"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Loader2, 
  TrendingUp,
  Award,
  Crown,
  UserPlus,
  Eye
} from "lucide-react"
import { useState, useEffect } from "react"
import { QRInviteDialog } from "./qr-invite-dialog"
import Link from "next/link"

interface Member {
  id: string
  member_address: string
  contribution_amount: number
  status: 'pending' | 'paid' | 'late'
  joined_at: string
  invited_by: string | null
  profile?: {
    display_name: string | null
    reputation_score: number
    avatar_url: string | null
    on_time_payments: number
    total_groups_joined: number
  }
}

interface Pool {
  id: string
  name: string
  creator_address: string
}

export function GroupMembersEnhanced({ groupId }: { groupId: string }) {
  const [members, setMembers] = useState<Member[]>([])
  const [pool, setPool] = useState<Pool | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
  }, [groupId])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/pools?id=${groupId}`)
      const poolData = await response.json()

      setPool(poolData)

      if (poolData.pool_members) {
        // Fetch profile data for each member
        const membersWithProfiles = await Promise.all(
          poolData.pool_members.map(async (member: Member) => {
            try {
              const profileRes = await fetch(`/api/profiles?address=${member.member_address}`)
              const profileData = await profileRes.json()
              return {
                ...member,
                profile: profileData.profile,
              }
            } catch (error) {
              return member
            }
          })
        )
        setMembers(membersWithProfiles)
      }
    } catch (err) {
      console.error('Failed to fetch members:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getReputationBadge = (score: number) => {
    if (score >= 90) return { label: "Elite", color: "bg-yellow-500/10 text-yellow-500" }
    if (score >= 75) return { label: "Trusted", color: "bg-green-500/10 text-green-500" }
    if (score >= 50) return { label: "Reliable", color: "bg-blue-500/10 text-blue-500" }
    return { label: "Building", color: "bg-gray-500/10 text-gray-500" }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "late":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />
      default:
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    )
  }

  
}