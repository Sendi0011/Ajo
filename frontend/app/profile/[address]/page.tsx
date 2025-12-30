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

