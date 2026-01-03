"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Client } from '@xmtp/xmtp-js'
import { useAccount, useWalletClient } from 'wagmi'
import { toast } from 'sonner'

interface XMTPContextType {
  client: Client | null
  isLoading: boolean
  error: string | null
  initializeClient: () => Promise<void>
  isInitialized: boolean
}

const XMTPContext = createContext<XMTPContextType>({
  client: null,
  isLoading: false,
  error: null,
  initializeClient: async () => {},
  isInitialized: false,
})

export function useXMTP() {
  const context = useContext(XMTPContext)
  if (!context) {
    throw new Error('useXMTP must be used within XMTPProvider')
  }
  return context
}

export function XMTPProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const initializeClient = async () => {
    if (!address || !walletClient || !isConnected) {
      setError('Wallet not connected')
      return
    }

    if (client) {
      // Already initialized
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create XMTP client with the wallet
      const xmtpClient = await Client.create(walletClient as any, {
        env: 'production', // or 'dev' for testing
      })

      setClient(xmtpClient)
      setIsInitialized(true)
      console.log('XMTP client initialized for:', address)
    } catch (err: any) {
      console.error('Failed to initialize XMTP:', err)
      setError(err.message || 'Failed to initialize chat')
      toast.error('Failed to initialize chat. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-initialize when wallet connects
  useEffect(() => {
    if (isConnected && address && walletClient && !client && !isLoading) {
      initializeClient()
    }
  }, [isConnected, address, walletClient])

  // Cleanup on disconnect
  useEffect(() => {
    if (!isConnected && client) {
      setClient(null)
      setIsInitialized(false)
    }
  }, [isConnected])

  return (
    <XMTPContext.Provider
      value={{
        client,
        isLoading,
        error,
        initializeClient,
        isInitialized,
      }}
    >
      {children}
    </XMTPContext.Provider>
  )
}