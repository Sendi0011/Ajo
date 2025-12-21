import { useState, useEffect } from 'react'
import { parseEther, encodeFunctionData, type Address } from 'viem'
import { useSmartAccount } from './useSmartAccount'
import { PaymasterMode } from '@biconomy/paymaster'

// Import ABIs as const
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

const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x0') as Address
const TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0x0') as Address

// Helper to extract pool address from transaction receipt
async function extractPoolAddress(smartAccount: any, txHash: string): Promise<string | null> {
  try {
    // Use wait method instead
    const receipt = await smartAccount.wait(txHash)
    
    if (!receipt || !receipt.receipt?.logs || receipt.receipt.logs.length === 0) return null

    for (const log of receipt.receipt.logs) {
      try {
        if (log.address.toLowerCase() !== FACTORY_ADDRESS.toLowerCase()) continue

        if (log.topics.length >= 2) {
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

// Approve token spending with Smart Account
export function useSmartApproveToken(spender: string, amount: string) {
  const { smartAccount } = useSmartAccount()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hash, setHash] = useState<string>()
  const [error, setError] = useState<string>()

  const approve = async () => {
    if (!smartAccount || !spender || !amount) {
      setError('Smart account not initialized or invalid parameters')
      return
    }

    setIsPending(true)
    setError(undefined)

    try {
      const parsedAmount = parseEther(amount)
      
      const data = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender as Address, parsedAmount],
      })

      // Use the sendTransaction method from MeeSmartAccount
      const userOpResponse = await (smartAccount as any).sendTransaction(
        TOKEN_ADDRESS,
        data,
        {
          paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        }
      )

      setHash(userOpResponse.userOpHash || userOpResponse.hash)
      
      // Wait for confirmation
      if (userOpResponse.wait) {
        await userOpResponse.wait()
      }
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Approve error:', err)
      setError(err.message || 'Transaction failed')
    } finally {
      setIsPending(false)
    }
  }

  return {
    approve,
    isLoading: isPending,
    isSuccess,
    hash,
    error,
  }
}

// ROTATIONAL POOL HOOKS
export function useSmartRotationalDeposit(poolAddress: string) {
  const { smartAccount } = useSmartAccount()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hash, setHash] = useState<string>()
  const [error, setError] = useState<string>()

  const deposit = async () => {
    if (!smartAccount || !poolAddress) {
      setError('Smart account not initialized')
      return
    }

    setIsPending(true)
    setError(undefined)

    try {
      const data = encodeFunctionData({
        abi: ROTATIONAL_ABI,
        functionName: 'deposit',
      })

      const userOpResponse = await (smartAccount as any).sendTransaction(
        poolAddress as Address,
        data,
        {
          paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        }
      )

      setHash(userOpResponse.userOpHash || userOpResponse.hash)
      if (userOpResponse.wait) {
        await userOpResponse.wait()
      }
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Deposit error:', err)
      setError(err.message || 'Transaction failed')
    } finally {
      setIsPending(false)
    }
  }

  return {
    deposit,
    isLoading: isPending,
    isSuccess,
    hash,
    error,
  }
}

// TARGET POOL HOOKS
export function useSmartTargetContribute(poolAddress: string, amount: string) {
  const { smartAccount } = useSmartAccount()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hash, setHash] = useState<string>()
  const [error, setError] = useState<string>()

  const contribute = async () => {
    if (!smartAccount || !poolAddress || !amount) {
      setError('Smart account not initialized or invalid parameters')
      return
    }

    setIsPending(true)
    setError(undefined)

    try {
      const parsedAmount = parseEther(amount)
      
      const data = encodeFunctionData({
        abi: TARGET_ABI,
        functionName: 'contribute',
        args: [parsedAmount],
      })

      const userOpResponse = await (smartAccount as any).sendTransaction(
        poolAddress as Address,
        data,
        {
          paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        }
      )

      setHash(userOpResponse.userOpHash || userOpResponse.hash)
      if (userOpResponse.wait) {
        await userOpResponse.wait()
      }
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Contribute error:', err)
      setError(err.message || 'Transaction failed')
    } finally {
      setIsPending(false)
    }
  }

  return {
    contribute,
    isLoading: isPending,
    isSuccess,
    hash,
    error,
  }
}

export function useSmartTargetWithdraw(poolAddress: string) {
  const { smartAccount } = useSmartAccount()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hash, setHash] = useState<string>()
  const [error, setError] = useState<string>()

  const withdraw = async () => {
    if (!smartAccount || !poolAddress) {
      setError('Smart account not initialized')
      return
    }

    setIsPending(true)
    setError(undefined)

    try {
      const data = encodeFunctionData({
        abi: TARGET_ABI,
        functionName: 'withdraw',
      })

      const userOpResponse = await (smartAccount as any).sendTransaction(
        poolAddress as Address,
        data,
        {
          paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        }
      )

      setHash(userOpResponse.userOpHash || userOpResponse.hash)
      if (userOpResponse.wait) {
        await userOpResponse.wait()
      }
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Withdraw error:', err)
      setError(err.message || 'Transaction failed')
    } finally {
      setIsPending(false)
    }
  }

  return {
    withdraw,
    isLoading: isPending,
    isSuccess,
    hash,
    error,
  }
}

// FLEXIBLE POOL HOOKS
export function useSmartFlexibleDeposit(poolAddress: string, amount: string) {
  const { smartAccount } = useSmartAccount()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hash, setHash] = useState<string>()
  const [error, setError] = useState<string>()

  const deposit = async () => {
    if (!smartAccount || !poolAddress || !amount) {
      setError('Smart account not initialized or invalid parameters')
      return
    }

    setIsPending(true)
    setError(undefined)

    try {
      const parsedAmount = parseEther(amount)
      
      const data = encodeFunctionData({
        abi: FLEXIBLE_ABI,
        functionName: 'deposit',
        args: [parsedAmount],
      })

      const userOpResponse = await (smartAccount as any).sendTransaction(
        poolAddress as Address,
        data,
        {
          paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        }
      )

      setHash(userOpResponse.userOpHash || userOpResponse.hash)
      if (userOpResponse.wait) {
        await userOpResponse.wait()
      }
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Deposit error:', err)
      setError(err.message || 'Transaction failed')
    } finally {
      setIsPending(false)
    }
  }

  return {
    deposit,
    isLoading: isPending,
    isSuccess,
    hash,
    error,
  }
}

export function useSmartFlexibleWithdraw(poolAddress: string, amount: string) {
  const { smartAccount } = useSmartAccount()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hash, setHash] = useState<string>()
  const [error, setError] = useState<string>()

  const withdraw = async () => {
    if (!smartAccount || !poolAddress || !amount) {
      setError('Smart account not initialized or invalid parameters')
      return
    }

    setIsPending(true)
    setError(undefined)

    try {
      const parsedAmount = parseEther(amount)
      
      const data = encodeFunctionData({
        abi: FLEXIBLE_ABI,
        functionName: 'withdraw',
        args: [parsedAmount],
      })

      const userOpResponse = await (smartAccount as any).sendTransaction(
        poolAddress as Address,
        data,
        {
          paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        }
      )

      setHash(userOpResponse.userOpHash || userOpResponse.hash)
      if (userOpResponse.wait) {
        await userOpResponse.wait()
      }
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Withdraw error:', err)
      setError(err.message || 'Transaction failed')
    } finally {
      setIsPending(false)
    }
  }

  return {
    withdraw,
    isLoading: isPending,
    isSuccess,
    hash,
    error,
  }
}

// FACTORY HOOKS WITH POOL ADDRESS EXTRACTION
export function useSmartCreateRotational(
  members: string[],
  depositAmount: string,
  frequency: string,
  treasuryFeeBps: number,
  relayerFeeBps: number
) {
  const { smartAccount } = useSmartAccount()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hash, setHash] = useState<string>()
  const [poolAddress, setPoolAddress] = useState<string | null>(null)
  const [error, setError] = useState<string>()

  const frequencyMap: Record<string, number> = {
    daily: 86400,
    weekly: 604800,
    biweekly: 1209600,
    monthly: 2592000,
  }

  const roundDuration = frequencyMap[frequency] || 604800

  const create = async () => {
    if (!smartAccount || members.length === 0 || !depositAmount) {
      setError('Smart account not initialized or invalid parameters')
      return
    }

    setIsPending(true)
    setError(undefined)

    try {
      const parsedAmount = parseEther(depositAmount)
      
      const data = encodeFunctionData({
        abi: FACTORY_ABI,
        functionName: 'createRotational',
        args: [
          members.map((m) => m as Address),
          parsedAmount,
          BigInt(roundDuration),
          BigInt(treasuryFeeBps),
          BigInt(relayerFeeBps),
        ],
      })

      const userOpResponse = await (smartAccount as any).sendTransaction(
        FACTORY_ADDRESS,
        data,
        {
          paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        }
      )

      const txHash = userOpResponse.userOpHash || userOpResponse.hash
      setHash(txHash)
      
      // Extract pool address from receipt
      const addr = await extractPoolAddress(smartAccount, txHash)
      setPoolAddress(addr)
      
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Create rotational error:', err)
      setError(err.message || 'Transaction failed')
    } finally {
      setIsPending(false)
    }
  }

  return {
    create,
    isLoading: isPending,
    isSuccess,
    hash,
    poolAddress,
    error,
  }
}

export function useSmartCreateTarget(
  members: string[],
  targetAmount: string,
  deadline: Date,
  treasuryFeeBps: number
) {
  const { smartAccount } = useSmartAccount()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hash, setHash] = useState<string>()
  const [poolAddress, setPoolAddress] = useState<string | null>(null)
  const [error, setError] = useState<string>()

  const create = async () => {
    if (!smartAccount || members.length === 0 || !targetAmount) {
      setError('Smart account not initialized or invalid parameters')
      return
    }

    setIsPending(true)
    setError(undefined)

    try {
      const parsedAmount = parseEther(targetAmount)
      const deadlineTimestamp = Math.floor(deadline.getTime() / 1000)
      
      const data = encodeFunctionData({
        abi: FACTORY_ABI,
        functionName: 'createTarget',
        args: [
          members.map((m) => m as Address),
          parsedAmount,
          BigInt(deadlineTimestamp),
          BigInt(treasuryFeeBps),
        ],
      })

      const userOpResponse = await (smartAccount as any).sendTransaction(
        FACTORY_ADDRESS,
        data,
        {
          paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        }
      )

      const txHash = userOpResponse.userOpHash || userOpResponse.hash
      setHash(txHash)
      
      const addr = await extractPoolAddress(smartAccount, txHash)
      setPoolAddress(addr)
      
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Create target error:', err)
      setError(err.message || 'Transaction failed')
    } finally {
      setIsPending(false)
    }
  }

  return {
    create,
    isLoading: isPending,
    isSuccess,
    hash,
    poolAddress,
    error,
  }
}

export function useSmartCreateFlexible(
  members: string[],
  minimumDeposit: string,
  withdrawalFee: string,
  yieldEnabled: boolean,
  treasuryFeeBps: number
) {
  const { smartAccount } = useSmartAccount()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hash, setHash] = useState<string>()
  const [poolAddress, setPoolAddress] = useState<string | null>(null)
  const [error, setError] = useState<string>()

  const create = async () => {
    if (!smartAccount || members.length === 0 || !minimumDeposit) {
      setError('Smart account not initialized or invalid parameters')
      return
    }

    setIsPending(true)
    setError(undefined)

    try {
      const parsedMinimum = parseEther(minimumDeposit)
      const withdrawalFeeBps = Math.floor(Number(withdrawalFee) * 100)
      
      const data = encodeFunctionData({
        abi: FACTORY_ABI,
        functionName: 'createFlexible',
        args: [
          members.map((m) => m as Address),
          parsedMinimum,
          BigInt(withdrawalFeeBps),
          yieldEnabled,
          BigInt(treasuryFeeBps),
        ],
      })

      const userOpResponse = await (smartAccount as any).sendTransaction(
        FACTORY_ADDRESS,
        data,
        {
          paymasterServiceData: { mode: PaymasterMode.SPONSORED },
        }
      )

      const txHash = userOpResponse.userOpHash || userOpResponse.hash
      setHash(txHash)
      
      const addr = await extractPoolAddress(smartAccount, txHash)
      setPoolAddress(addr)
      
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Create flexible error:', err)
      setError(err.message || 'Transaction failed')
    } finally {
      setIsPending(false)
    }
  }

  return {
    create,
    isLoading: isPending,
    isSuccess,
    hash,
    poolAddress,
    error,
  }
}