import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// POST - Pin a message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pool_id, message_id, message_content, message_sender, pinned_by } = body

    if (!pool_id || !message_id || !message_content || !message_sender) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('chat_pinned_messages')
      .insert([
        {
          pool_id,
          message_id,
          message_content,
          message_sender: message_sender.toLowerCase(),
          pinned_by: (pinned_by || message_sender).toLowerCase(),
        },
      ])
      .select()
      .single()

    if (error) {
      // Check if already pinned
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Message already pinned' },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Pin message error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

