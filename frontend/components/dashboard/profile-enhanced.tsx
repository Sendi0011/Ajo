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

  
  )
}