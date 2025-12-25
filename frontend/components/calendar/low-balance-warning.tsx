"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Wallet, ExternalLink } from "lucide-react"
import { useAccount, useBalance } from "wagmi"
import { formatEther } from "viem"
import { motion, AnimatePresence } from "framer-motion"

export function LowBalanceWarning() {
  const { address } = useAccount()
  const { data: balanceData } = useBalance({ address })
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([])
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    if (address) {
      fetchUpcomingPayments()
    }
  }, [address])

  const fetchUpcomingPayments = async () => {
    try {
      const response = await fetch(`/api/calendar/payments?userAddress=${address}`)
      if (response.ok) {
        const data = await response.json()
        setUpcomingPayments(data.filter((p: any) => !p.hasPaid))
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error)
    }
  }

  useEffect(() => {
    if (!balanceData || upcomingPayments.length === 0) {
      setShowWarning(false)
      return
    }

    const balance = parseFloat(formatEther(balanceData.value))
    const totalDue = upcomingPayments.reduce((sum, p) => sum + p.amount, 0)

    // Show warning if balance is less than total due + 10% buffer
    setShowWarning(balance < totalDue * 1.1)
  }, [balanceData, upcomingPayments])

  if (!showWarning) return null

  const balance = balanceData ? parseFloat(formatEther(balanceData.value)) : 0
  const totalDue = upcomingPayments.reduce((sum, p) => sum + p.amount, 0)
  const shortfall = totalDue - balance

  
}