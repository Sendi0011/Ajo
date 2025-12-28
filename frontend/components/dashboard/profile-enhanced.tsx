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

