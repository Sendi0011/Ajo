import { useContractWrite, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { useState, useEffect } from 'react'

const EMERGENCY_ABI = [
  {
    name: 'requestEmergencyWithdrawal',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'reason', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'voteOnEmergencyRequest',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'requestId', type: 'uint256' },
      { name: 'support', type: 'bool' },
    ],
    outputs: [],
  },
  {
    name: 'executeEmergencyRequest',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'requestId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'getEmergencyRequest',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'requestId', type: 'uint256' }],
    outputs: [
      { name: 'requester', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'reason', type: 'string' },
      { name: 'votesFor', type: 'uint256' },
      { name: 'votesAgainst', type: 'uint256' },
      { name: 'executed', type: 'bool' },
      { name: 'rejected', type: 'bool' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'votingDeadline', type: 'uint256' },
    ],
  },
  {
    name: 'hasVotedOnRequest',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'requestId', type: 'uint256' },
      { name: 'voter', type: 'address' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'emergencyRequestCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'emergencyUsageCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

// Request emergency withdrawal
export function useRequestEmergencyWithdrawal(poolAddress: string) {
  const { writeContract, data, isPending } = useContractWrite()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  const request = (amount: string, reason: string) => {
    const parsedAmount = parseEther(amount)
    
    writeContract({
      address: poolAddress as `0x${string}`,
      abi: EMERGENCY_ABI,
      functionName: 'requestEmergencyWithdrawal',
      args: [parsedAmount, reason],
    })
  }

  return {
    request,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
  }
}

// Vote on emergency request
export function useVoteOnEmergencyRequest(poolAddress: string) {
  const { writeContract, data, isPending } = useContractWrite()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  const vote = (requestId: number, support: boolean) => {
    writeContract({
      address: poolAddress as `0x${string}`,
      abi: EMERGENCY_ABI,
      functionName: 'voteOnEmergencyRequest',
      args: [BigInt(requestId), support],
    })
  }

  return {
    vote,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
  }
}

// Execute emergency request
export function useExecuteEmergencyRequest(poolAddress: string) {
  const { writeContract, data, isPending } = useContractWrite()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  const execute = (requestId: number) => {
    writeContract({
      address: poolAddress as `0x${string}`,
      abi: EMERGENCY_ABI,
      functionName: 'executeEmergencyRequest',
      args: [BigInt(requestId)],
    })
  }

  return {
    execute,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
  }
}

// Read emergency request details
export function useEmergencyRequest(poolAddress: string, requestId: number) {
  const { data, isLoading, refetch } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: EMERGENCY_ABI,
    functionName: 'getEmergencyRequest',
    args: [BigInt(requestId)],
  })

  return {
    request: data ? {
      requester: data[0],
      amount: data[1],
      reason: data[2],
      votesFor: Number(data[3]),
      votesAgainst: Number(data[4]),
      executed: data[5],
      rejected: data[6],
      createdAt: Number(data[7]),
      votingDeadline: Number(data[8]),
    } : null,
    isLoading,
    refetch,
  }
}

// Check if user has voted
export function useHasVoted(poolAddress: string, requestId: number, voterAddress?: string) {
  const { data, isLoading } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: EMERGENCY_ABI,
    functionName: 'hasVotedOnRequest',
    args: [BigInt(requestId), voterAddress as `0x${string}`],
    query: {
      enabled: !!voterAddress,
    },
  })

  return {
    hasVoted: data || false,
    isLoading,
  }
}

// Get total emergency request count
export function useEmergencyRequestCount(poolAddress: string) {
  const { data, isLoading, refetch } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: EMERGENCY_ABI,
    functionName: 'emergencyRequestCount',
  })

  return {
    count: data ? Number(data) : 0,
    isLoading,
    refetch,
  }
}

// Get user's emergency usage count
export function useEmergencyUsageCount(poolAddress: string, userAddress?: string) {
  const { data, isLoading } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: EMERGENCY_ABI,
    functionName: 'emergencyUsageCount',
    args: [userAddress as `0x${string}`],
    query: {
      enabled: !!userAddress,
    },
  })

  return {
    usageCount: data ? Number(data) : 0,
    isLoading,
  }
}

// Fetch all emergency requests for a pool
export function useAllEmergencyRequests(poolAddress: string) {
  const { count, refetch: refetchCount } = useEmergencyRequestCount(poolAddress)
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAllRequests() {
      if (count === 0) {
        setRequests([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const allRequests = []

      // Fetch each request (could be optimized with multicall)
      for (let i = 0; i < count; i++) {
        try {
          // This would need to use useReadContract in a loop
          // For now, we'll fetch them individually
          allRequests.push({ id: i })
        } catch (error) {
          console.error(`Failed to fetch request ${i}:`, error)
        }
      }

      setRequests(allRequests)
      setIsLoading(false)
    }

    fetchAllRequests()
  }, [count, poolAddress])

  return {
    requests,
    isLoading,
    refetch: refetchCount,
  }
}