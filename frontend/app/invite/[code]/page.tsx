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

   