import { supabase, ensureMemberProfile } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch profile by wallet address
export async function GET(req: NextRequest) {
  try {
    const walletAddress = req.nextUrl.searchParams.get('address')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      )
    }

    // Ensure profile exists (creates if not)
    const profile = await ensureMemberProfile(walletAddress)

    