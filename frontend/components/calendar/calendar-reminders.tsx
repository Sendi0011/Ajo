"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Calendar as CalendarIcon,
  Clock,
  Bell,
  AlertCircle,
  CheckCircle,
  Wallet,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingDown,
} from "lucide-react"
import { useAccount, useBalance } from "wagmi"
import { formatEther } from "viem"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

