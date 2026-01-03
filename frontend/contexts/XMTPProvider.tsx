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

