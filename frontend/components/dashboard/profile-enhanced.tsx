"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAccount } from "wagmi"
import { 
  Wallet, 
  Award, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Edit2,
  Trophy,
  Target,
  Calendar,
  Sparkles
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

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

interface ReputationHistory {
  id: string
  action_type: string
  points_change: number
  previous_score: number
  new_score: number
  description: string | null
  created_at: string
}

export function ProfileEnhanced() {
  const { address } = useAccount()
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [reputationHistory, setReputationHistory] = useState<ReputationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  
  // Edit form state
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")

  useEffect(() => {
    if (address) {
      fetchProfile()
    }
  }, [address])

  const fetchProfile = async () => {
    if (!address) return

    try {
      const response = await fetch(`/api/profiles?address=${address}`)
      const data = await response.json()

      setProfile(data.profile)
      setBadges(data.badges)
      setReputationHistory(data.reputationHistory)
      setDisplayName(data.profile.display_name || "")
      setBio(data.profile.bio || "")
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!address) return

    try {
      const response = await fetch(`/api/profiles?address=${address}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          bio: bio,
        }),
      })

      if (response.ok) {
        toast.success("Profile updated successfully")
        setIsEditing(false)
        fetchProfile()
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile")
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

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <Card className="p-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </Card>
      </div>
    )
  }

  const repLevel = getReputationLevel(profile.reputation_score)
  const totalPayments = profile.on_time_payments + profile.late_payments + profile.missed_payments
  const successRate = totalPayments > 0 
    ? ((profile.on_time_payments / totalPayments) * 100).toFixed(1)
    : "N/A"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold">Profile</h2>
          <p className="text-muted-foreground mt-1">Your on-chain savings reputation</p>
        </div>
        {!isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary text-2xl font-bold">
            {profile.display_name ? profile.display_name.charAt(0).toUpperCase() : address?.slice(2, 4).toUpperCase()}
          </div>
          
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Display Name</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Bio</label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditing(false)
                    setDisplayName(profile.display_name || "")
                    setBio(profile.bio || "")
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">
                    {profile.display_name || "Anonymous Saver"}
                  </h3>
                  <Badge className={`${repLevel.bg} ${repLevel.color} border-none`}>
                    <Sparkles className="h-3 w-3 mr-1" />
                    {repLevel.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-mono mb-2">
                  {formatAddress(address || "")}
                </p>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>
                )}
              </>
            )}
          </div>

          {!isEditing && (
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                {profile.reputation_score}
              </div>
              <p className="text-xs text-muted-foreground">Reputation</p>
            </div>
          )}
        </div>

        {/* Reputation Progress Bar */}
        {!isEditing && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Reputation Score</span>
              <span className="font-semibold">{profile.reputation_score}/100</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-1000"
                style={{ width: `${profile.reputation_score}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.total_groups_joined}</p>
              <p className="text-xs text-muted-foreground">Groups Joined</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.on_time_payments}</p>
              <p className="text-xs text-muted-foreground">On-time Payments</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <Trophy className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{profile.completed_groups}</p>
              <p className="text-xs text-muted-foreground">Completed Groups</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Payment Statistics
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Success Rate</span>
            <span className="text-lg font-bold text-green-500">{successRate}%</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>On-time</span>
              </div>
              <span className="font-medium">{profile.on_time_payments}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span>Late</span>
              </div>
              <span className="font-medium">{profile.late_payments}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>Missed</span>
              </div>
              <span className="font-medium">{profile.missed_payments}</span>
            </div>
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
      {badges.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Badges Earned ({badges.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
        </Card>
      )}

      {/* Recent Activity */}
      {reputationHistory.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recent Reputation Changes
          </h3>
          <div className="space-y-3">
            {reputationHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${item.points_change > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${item.points_change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.points_change > 0 ? '+' : ''}{item.points_change}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.previous_score} → {item.new_score}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Reputation Info */}
      <Card className="p-6 bg-muted/30">
        <h3 className="text-lg font-semibold mb-2">How Reputation Works</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Your reputation score is calculated based on your savings behavior. Build trust and unlock benefits:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
            <span className="text-muted-foreground"><strong>+5 points</strong> for each on-time payment</span>
          </li>
          <li className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
            <span className="text-muted-foreground"><strong>-2 points</strong> for late payments</span>
          </li>
          <li className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
            <span className="text-muted-foreground"><strong>+10 points</strong> for completing a savings group</span>
          </li>
          <li className="flex gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
            <span className="text-muted-foreground">Higher scores = Lower fees & premium group access</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}