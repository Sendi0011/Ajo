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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 mb-2">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{profile.total_groups_joined}</p>
              <p className="text-xs text-muted-foreground">Groups Joined</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 mb-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{profile.on_time_payments}</p>
              <p className="text-xs text-muted-foreground">On-time Payments</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 mb-2">
                <Trophy className="h-6 w-6 text-purple-500" />
              </div>
              <p className="text-2xl font-bold">{profile.completed_groups}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 mb-2">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-2xl font-bold">{successRate}%</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Statistics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Payment Record
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm">On-time</span>
                </div>
                <span className="text-lg font-bold text-green-500">{profile.on_time_payments}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm">Late</span>
                </div>
                <span className="text-lg font-bold text-yellow-500">{profile.late_payments}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm">Missed</span>
                </div>
                <span className="text-lg font-bold text-red-500">{profile.missed_payments}</span>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Contributions</span>
                  <span className="text-lg font-bold">{profile.total_contributions.toFixed(4)} ETH</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Badges */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Badges ({badges.length})
            </h3>
            {badges.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No badges earned yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-4 rounded-lg bg-muted/30 text-center hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-3xl mb-2">{badge.badge_icon || "🏆"}</div>
                    <p className="font-medium text-sm">{badge.badge_name}</p>
                    {badge.badge_description && (
                      <p className="text-xs text-muted-foreground mt-1">{badge.badge_description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Pools Section */}
        {pools.length > 0 && (
          <div className="mt-6 space-y-4">
            {/* Active Pools */}
            {activePools.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Active Groups ({activePools.length})
                </h3>
                <div className="space-y-2">
                  {activePools.map((pool) => (
                    <Link key={pool.id} href={`/dashboard/group/${pool.pools.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-medium">{pool.pools.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {pool.pools.type} • Joined {new Date(pool.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="capitalize">
                          {pool.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            
          </div>
        </Card>
      </div>
    </div>
  )
}