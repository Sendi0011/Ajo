import { useContractWrite, useWaitForTransactionReceipt, usePublicClient } from 'wagmi'
import { parseEther } from 'viem'
import { useEffect, useState } from 'react'


const FACTORY_ABI = [
  {
    name: 'createRotational',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'members', type: 'address[]' },
      { name: 'depositAmount', type: 'uint256' },
      { name: 'roundDuration', type: 'uint256' },
      { name: 'treasuryFeeBps', type: 'uint256' },
      { name: 'relayerFeeBps', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'createTarget',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'members', type: 'address[]' },
      { name: 'targetAmount', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'treasuryFeeBps', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'createFlexible',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'members', type: 'address[]' },
      { name: 'minimumDeposit', type: 'uint256' },
      { name: 'withdrawalFeeBps', type: 'uint256' },
      { name: 'yieldEnabled', type: 'bool' },
      { name: 'treasuryFeeBps', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'address' }],
  },
] as const

const ROTATIONAL_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const

const TARGET_ABI = [
  {
    name: 'contribute',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const

const FLEXIBLE_ABI = [
  {
    name: 'deposit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'withdraw',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
] as const

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x0') as `0x${string}`
const TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0x0') as `0x${string}`

// Helper to extract pool address from transaction receipt
async function extractPoolAddress(publicClient: any, txHash: `0x${string}`): Promise<string | null> {
  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash })
    
    if (!receipt || !receipt.logs || receipt.logs.length === 0) return null

    for (const log of receipt.logs) {
      try {
        // Check if this log is from the factory
        if (log.address.toLowerCase() !== FACTORY_ADDRESS.toLowerCase()) continue

        // The pool address is indexed and appears in topics[1]
        // Event signature is topics[0], pool address is topics[1], creator is topics[2]
        if (log.topics.length >= 2) {
          // Extract address from topic (remove 0x and take last 40 hex chars = 20 bytes)
          const poolAddr = '0x' + log.topics[1].slice(-40)
          if (poolAddr.match(/^0x[a-fA-F0-9]{40}$/)) {
            return poolAddr
          }
        }
      } catch (e) {
        continue
      }
    }
  } catch (err) {
    console.error('Failed to extract pool address:', err)
  }
  
  return null
}

// Approve token spending
export function useApproveToken(spender: string, amount: string) {
  const parsedAmount = amount ? parseEther(amount) : BigInt(0)

  const { writeContract, data, isPending } = useContractWrite()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  const approve = () => {
    writeContract({
      address: TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender as `0x${string}`, parsedAmount],
    })
  }

  return {
    approve,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
  }
}

// ROTATIONAL POOL HOOKS
export function useRotationalDeposit(poolAddress: string) {
  const { writeContract, data, isPending } = useContractWrite()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  const deposit = () => {
    writeContract({
      address: poolAddress as `0x${string}`,
      abi: ROTATIONAL_ABI,
      functionName: 'deposit',
    })
  }

  return {
    deposit,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
  }
}

// TARGET POOL HOOKS
export function useTargetContribute(poolAddress: string, amount: string) {
  const parsedAmount = amount ? parseEther(amount) : BigInt(0)

  const { writeContract, data, isPending } = useContractWrite()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  const contribute = () => {
    writeContract({
      address: poolAddress as `0x${string}`,
      abi: TARGET_ABI,
      functionName: 'contribute',
      args: [parsedAmount],
    })
  }

  return {
    contribute,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
  }
}

export function useTargetWithdraw(poolAddress: string) {
  const { writeContract, data, isPending } = useContractWrite()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  const withdraw = () => {
    writeContract({
      address: poolAddress as `0x${string}`,
      abi: TARGET_ABI,
      functionName: 'withdraw',
    })
  }

  return {
    withdraw,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
  }
}

// FLEXIBLE POOL HOOKS
export function useFlexibleDeposit(poolAddress: string, amount: string) {
  const parsedAmount = amount ? parseEther(amount) : BigInt(0)

  const { writeContract, data, isPending } = useContractWrite()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  const deposit = () => {
    writeContract({
      address: poolAddress as `0x${string}`,
      abi: FLEXIBLE_ABI,
      functionName: 'deposit',
      args: [parsedAmount],
    })
  }

  return {
    deposit,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
  }
}

export function useFlexibleWithdraw(poolAddress: string, amount: string) {
  const parsedAmount = amount ? parseEther(amount) : BigInt(0)

  const { writeContract, data, isPending } = useContractWrite()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })

  const withdraw = () => {
    writeContract({
      address: poolAddress as `0x${string}`,
      abi: FLEXIBLE_ABI,
      functionName: 'withdraw',
      args: [parsedAmount],
    })
  }

  return {
    withdraw,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
  }
}

// FACTORY HOOKS - UPDATED WITH POOL ADDRESS EXTRACTION
export function useCreateRotational(
  members: string[],
  depositAmount: string,
  frequency: string,
  treasuryFeeBps: number,
  relayerFeeBps: number
) {
  const frequencyMap: Record<string, number> = {
    daily: 86400,
    weekly: 604800,
    biweekly: 1209600,
    monthly: 2592000,
  }

  const roundDuration = frequencyMap[frequency] || 604800
  const parsedAmount = depositAmount ? parseEther(depositAmount) : BigInt(0)

  const { writeContract, data, isPending } = useContractWrite()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })
  
  const publicClient = usePublicClient()
  const [poolAddress, setPoolAddress] = useState<string | null>(null)

  useEffect(() => {
    if (isSuccess && data && publicClient) {
      extractPoolAddress(publicClient, data).then(addr => {
        setPoolAddress(addr)
      })
    }
  }, [isSuccess, data, publicClient])

  const create = () => {
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createRotational',
      args: [
        members.map((m) => m as `0x${string}`),
        parsedAmount,
        BigInt(roundDuration),
        BigInt(treasuryFeeBps),
        BigInt(relayerFeeBps),
      ],
    })
  }

  return {
    create,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
    poolAddress,
  }
}

export function useCreateTarget(
  members: string[],
  targetAmount: string,
  deadline: Date,
  treasuryFeeBps: number
) {
  const parsedAmount = targetAmount ? parseEther(targetAmount) : BigInt(0)
  const deadlineTimestamp = Math.floor(deadline.getTime() / 1000)

  const { writeContract, data, isPending } = useContractWrite()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })
  
  const publicClient = usePublicClient()
  const [poolAddress, setPoolAddress] = useState<string | null>(null)

  useEffect(() => {
    if (isSuccess && data && publicClient) {
      extractPoolAddress(publicClient, data).then(addr => {
        setPoolAddress(addr)
      })
    }
  }, [isSuccess, data, publicClient])

  const create = () => {
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createTarget',
      args: [
        members.map((m) => m as `0x${string}`),
        parsedAmount,
        BigInt(deadlineTimestamp),
        BigInt(treasuryFeeBps),
      ],
    })
  }

  return {
    create,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
    poolAddress,
  }
}

export function useCreateFlexible(
  members: string[],
  minimumDeposit: string,
  withdrawalFee: string,
  yieldEnabled: boolean,
  treasuryFeeBps: number
) {
  const parsedMinimum = minimumDeposit ? parseEther(minimumDeposit) : BigInt(0)
  const withdrawalFeeBps = Math.floor(Number(withdrawalFee) * 100)

  const { writeContract, data, isPending } = useContractWrite()
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ 
    hash: data 
  })
  
  const publicClient = usePublicClient()
  const [poolAddress, setPoolAddress] = useState<string | null>(null)

  useEffect(() => {
    if (isSuccess && data && publicClient) {
      extractPoolAddress(publicClient, data).then(addr => {
        setPoolAddress(addr)
      })
    }
  }, [isSuccess, data, publicClient])

  const create = () => {
    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createFlexible',
      args: [
        members.map((m) => m as `0x${string}`),
        parsedMinimum,
        BigInt(withdrawalFeeBps),
        yieldEnabled,
        BigInt(treasuryFeeBps),
      ],
    })
  }

  return {
    create,
    isLoading: isPending || isWaiting,
    isSuccess,
    hash: data,
    poolAddress,
  }
}