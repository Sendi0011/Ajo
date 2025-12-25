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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 right-4 z-50 max-w-sm"
      >
        <Card className="p-4 border-2 border-orange-500 bg-orange-50 dark:bg-orange-950 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-orange-600 mb-1">Low Balance Warning</p>
              <p className="text-sm text-muted-foreground mb-3">
                You have {upcomingPayments.length} upcoming payment{upcomingPayments.length > 1 ? 's' : ''} totaling{' '}
                {totalDue.toFixed(2)} ETH, but your balance is only {balance.toFixed(2)} ETH.
              </p>
              <div className="flex items-center gap-2 text-sm mb-3">
                <Wallet className="h-4 w-4" />
                <span>Need: {shortfall.toFixed(2)} ETH more</span>
              </div>
              <Button size="sm" className="w-full" asChild>
                <a
                  href="https://app.uniswap.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy ETH
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowWarning(false)}
            >
              ×
            </Button>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}