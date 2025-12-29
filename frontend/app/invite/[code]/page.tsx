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

