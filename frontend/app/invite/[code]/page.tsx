"use client"

import { use, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Crown,
  Award,
  Clock
} from "lucide-react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"

interface InviteData {
  id: string
  invite_code: string
  pool_id: string
  inviter_address: string
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  is_valid: boolean
  pools: {
    id: string
    name: string
    type: string
    description: string | null
    members_count: number
    creator_address: string
    status: string
    contribution_amount: number | null
    target_amount: number | null
    frequency: string | null
  }
  inviter: {
    wallet_address: string
    display_name: string | null
    reputation_score: number
    avatar_url: string | null
  }
  recent_uses: any[]
}

export default function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvite()
  }, [code])

  const fetchInvite = async () => {
    try {
      const response = await fetch(`/api/invites?code=${code}`)
      
      if (!response.ok) {
        setError("Invite not found or expired")
        setLoading(false)
        return
      }

      const data = await response.json()
      setInviteData(data)

      if (!data.is_valid) {
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError("This invite has expired")
        } else if (data.max_uses && data.uses_count >= data.max_uses) {
          setError("This invite has reached its maximum number of uses")
        } else if (!data.is_active) {
          setError("This invite has been deactivated")
        } else {
          setError("This invite is no longer valid")
        }
      }
    } catch (err) {
      console.error("Failed to fetch invite:", err)
      setError("Failed to load invite")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!address || !isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!inviteData?.is_valid) {
      toast.error("This invite is no longer valid")
      return
    }

    setJoining(true)
    try {
      // Use the invite
      const response = await fetch("/api/invites", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invite_code: code,
          invitee_address: address,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || "Failed to join group")
        return
      }

      const data = await response.json()
      toast.success("Successfully joined the group!")
      
      // Redirect to the group page
      router.push(`/dashboard/group/${data.pool.id}`)
    } catch (error) {
      console.error("Failed to join group:", error)
      toast.error("Failed to join group")
    } finally {
      setJoining(false)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getPoolTypeIcon = (type: string) => {
    switch (type) {
      case "rotational":
        return "🔄"
      case "target":
        return "🎯"
      case "flexible":
        return "💎"
      default:
        return "💰"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !inviteData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Invalid Invite</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
        </Card>
      </div>
    )
  }

  const pool = inviteData.pools
  const inviter = inviteData.inviter

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{getPoolTypeIcon(pool.type)}</div>
          <h1 className="text-3xl font-bold mb-2">You're Invited!</h1>
          <p className="text-muted-foreground">
            Join <strong>{pool.name}</strong> and start saving together
          </p>
        </div>

        {/* Main Invite Card */}
        <Card className="p-6 mb-6">
          {/* Group Info */}
          <div className="space-y-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">{pool.name}</h2>
              <Badge className="capitalize">{pool.type} Pool</Badge>
            </div>

            {pool.description && (
              <p className="text-muted-foreground">{pool.description}</p>
            )}

            {/* Group Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="font-bold">{pool.members_count}</p>
                </div>
              </div>

              {pool.contribution_amount && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Contribution</p>
                    <p className="font-bold">{pool.contribution_amount} ETH</p>
                  </div>
                </div>
              )}

              {pool.target_amount && (
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="font-bold">{pool.target_amount} ETH</p>
                  </div>
                </div>
              )}

              {pool.frequency && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Frequency</p>
                    <p className="font-bold capitalize">{pool.frequency}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          
      </div>
    </div>
  )
}