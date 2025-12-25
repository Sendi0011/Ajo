"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, AlertCircle, ArrowRight } from "lucide-react"
import { useAccount } from "wagmi"
import Link from "next/link"

interface UpcomingPayment {
  id: string
  poolName: string
  amount: number
  dueDate: string
  status: string
}

