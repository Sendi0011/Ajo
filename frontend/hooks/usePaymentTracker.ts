import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface PaymentTrackerParams {
  poolId: string
  memberAddress: string | undefined
  amount?: string
  txHash?: string
  wasOnTime?: boolean
  isSuccess: boolean
}

/**
 * Hook to automatically track payments and update reputation
 * Use this after successful deposit/contribute transactions
 */
export function usePaymentTracker({
  poolId,
  memberAddress,
  amount,
  txHash,
  wasOnTime = true,
  isSuccess,
}: PaymentTrackerParams) {
  const [isTracking, setIsTracking] = useState(false)
  const [tracked, setTracked] = useState(false)

  useEffect(() => {
    const trackPayment = async () => {
      // Only track once per success
      if (!isSuccess || tracked || isTracking || !memberAddress) {
        return
      }

      setIsTracking(true)

      try {
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            poolId,
            memberAddress,
            amount: amount ? parseFloat(amount) : 0,
            txHash: txHash || '',
            wasOnTime,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          
          // Show badge notifications
          if (data.newBadges && data.newBadges.length > 0) {
            data.newBadges.forEach((badge: any) => {
              toast.success(
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{badge.badge_icon}</span>
                  <div>
                    <p className="font-bold">New Badge Earned!</p>
                    <p className="text-sm">{badge.badge_name}</p>
                  </div>
                </div>,
                { duration: 5000 }
              )
            })
          } else {
            toast.success('Payment recorded! Reputation updated.')
          }
          
          setTracked(true)
        } else {
          console.error('Failed to track payment')
          // Don't show error to user, payment was still successful on-chain
        }
      } catch (error) {
        console.error('Payment tracking error:', error)
        // Don't show error to user, payment was still successful on-chain
      } finally {
        setIsTracking(false)
      }
    }

    trackPayment()
  }, [isSuccess, tracked, isTracking, poolId, memberAddress, amount, txHash, wasOnTime])

  return {
    isTracking,
    tracked,
  }
}

