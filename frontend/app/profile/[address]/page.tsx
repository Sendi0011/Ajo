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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Profile Header Card */}
        <Card className="p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary text-3xl font-bold flex-shrink-0">
              {profile.display_name 
                ? profile.display_name.charAt(0).toUpperCase() 
                : address.slice(2, 4).toUpperCase()
              }
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {profile.display_name || "Anonymous Saver"}
                </h1>
                <Badge className={`${repLevel.bg} ${repLevel.color} border-none`}>
                  <Sparkles className="h-3 w-3 mr-1" />
                  {repLevel.label}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground font-mono mb-3">
                {formatAddress(address)}
              </p>
              
              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Reputation Score */}
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-1">
                {profile.reputation_score}
              </div>
              <p className="text-xs text-muted-foreground">Reputation</p>
              <div className="h-2 w-20 bg-muted rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${profile.reputation_score}%` }}
                />
              </div>
            </div>
          </div>
        </Card>


          </div>
        </Card>
      </div>
    </div>
  )
}