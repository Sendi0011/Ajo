"use client"

import { use, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Award, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  Clock,
  XCircle,
  Trophy,
  ArrowLeft,
  Sparkles,
  Calendar,
  Loader2
} from "lucide-react"
import Link from "next/link"

interface MemberProfile {
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
  created_at: string
}

interface Badge {
  id: string
  badge_type: string
  badge_name: string
  badge_description: string | null
  badge_icon: string | null
  earned_at: string
}

interface Pool {
  id: string
  pools: {
    id: string
    name: string
    type: string
    status: string
    created_at: string
  }
  status: string
  contribution_amount: number
  joined_at: string
}

export default function PublicProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = use(params)
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [address])

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profiles?address=${address}`)
      const data = await response.json()

      setProfile(data.profile)
      setBadges(data.badges)
      setPools(data.pools)
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const getReputationLevel = (score: number) => {
    if (score >= 90) return { label: "Elite", color: "text-yellow-500", bg: "bg-yellow-500/10" }
    if (score >= 75) return { label: "Trusted", color: "text-green-500", bg: "bg-green-500/10" }
    if (score >= 50) return { label: "Reliable", color: "text-blue-500", bg: "bg-blue-500/10" }
    return { label: "Building", color: "text-gray-500", bg: "bg-gray-500/10" }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This user hasn't created a profile yet
          </p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const repLevel = getReputationLevel(profile.reputation_score)
  const totalPayments = profile.on_time_payments + profile.late_payments + profile.missed_payments
  const successRate = totalPayments > 0 
    ? ((profile.on_time_payments / totalPayments) * 100).toFixed(1)
    : "N/A"

  const activePools = pools.filter(p => p.pools.status === 'active')
  const completedPools = pools.filter(p => p.pools.status === 'completed')

  