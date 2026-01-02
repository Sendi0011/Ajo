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

