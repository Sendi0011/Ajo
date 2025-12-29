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

