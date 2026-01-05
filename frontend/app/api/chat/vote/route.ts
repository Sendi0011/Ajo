import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// POST - Cast a vote
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { poll_id, option_id, voter_address } = body

    if (!poll_id || !option_id || !voter_address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if poll is still active
    const { data: poll, error: pollError } = await supabase
      .from('chat_polls')
      .select('is_active, closes_at')
      .eq('id', poll_id)
      .single()

    if (pollError || !poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      )
    }

    if (!poll.is_active) {
      return NextResponse.json(
        { error: 'Poll is closed' },
        { status: 400 }
      )
    }

    if (poll.closes_at && new Date(poll.closes_at) < new Date()) {
      // Auto-close expired poll
      await supabase
        .from('chat_polls')
        .update({ is_active: false })
        .eq('id', poll_id)

      return NextResponse.json(
        { error: 'Poll has expired' },
        { status: 400 }
      )
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('chat_poll_votes')
      .select('id, option_id')
      .eq('poll_id', poll_id)
      .eq('voter_address', voter_address.toLowerCase())
      .single()

    if (existingVote) {
      // User wants to change vote - delete old vote first
      if (existingVote.option_id !== option_id) {
        await supabase
          .from('chat_poll_votes')
          .delete()
          .eq('id', existingVote.id)

        // Note: The trigger will auto-decrement the old option's vote_count
      } else {
        return NextResponse.json(
          { error: 'You have already voted for this option' },
          { status: 400 }
        )
      }
    }

    // Cast vote (trigger will auto-increment vote_count)
    const { data: vote, error: voteError } = await supabase
      .from('chat_poll_votes')
      .insert([
        {
          poll_id,
          option_id,
          voter_address: voter_address.toLowerCase(),
        },
      ])
      .select()
      .single()

    if (voteError) throw voteError

    // Fetch updated poll results
    const { data: updatedPoll } = await supabase
      .from('chat_polls')
      .select(`
        *,
        options:chat_poll_options (
          id,
          option_text,
          vote_count
        )
      `)
      .eq('id', poll_id)
      .single()

    return NextResponse.json({
      vote,
      poll: updatedPoll,
    })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

