import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'

export async function POST_MARK_ALL(req: NextRequest) {
    try {
      const body = await req.json()
      const { userAddress } = body
  
      if (!userAddress) {
        return NextResponse.json(
          { error: 'userAddress is required' },
          { status: 400 }
        )
      }
  
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_address', userAddress.toLowerCase())
        .eq('read', false)
  
      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }
  
      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Mark all read error:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  }