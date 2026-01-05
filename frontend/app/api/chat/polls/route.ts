import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// POST - Create a new poll
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { pool_id, creator_address, question, options, closes_in_hours } = body

    if (!pool_id || !creator_address || !question || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Missing required fields. Need: pool_id, creator_address, question, and at least 2 options' },
        { status: 400 }
      )
    }

    // Calculate closing time if provided
    let closesAt = null
    if (closes_in_hours) {
      const closeDate = new Date()
      closeDate.setHours(closeDate.getHours() + closes_in_hours)
      closesAt = closeDate.toISOString()
    }

    // Create poll
    const { data: poll, error: pollError } = await supabase
      .from('chat_polls')
      .insert([
        {
          pool_id,
          creator_address: creator_address.toLowerCase(),
          question,
          closes_at: closesAt,
          is_active: true,
        },
      ])
      .select()
      .single()

    if (pollError) throw pollError

    // Create poll options
    const optionData = options.map((option: string) => ({
      poll_id: poll.id,
      option_text: option,
      vote_count: 0,
    }))

    const { data: pollOptions, error: optionsError } = await supabase
      .from('chat_poll_options')
      .insert(optionData)
      .select()

    if (optionsError) throw optionsError

    return NextResponse.json({
      ...poll,
      options: pollOptions,
    })
  } catch (error) {
    console.error('Create poll error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET - Fetch polls for a pool
export async function GET(req: NextRequest) {
  try {
    const poolId = req.nextUrl.searchParams.get('pool_id')
    const pollId = req.nextUrl.searchParams.get('poll_id')

    if (!poolId && !pollId) {
      return NextResponse.json(
        { error: 'Provide pool_id or poll_id' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('chat_polls')
      .select(`
        *,
        options:chat_poll_options (
          id,
          option_text,
          vote_count
        ),
        votes:chat_poll_votes (
          id,
          option_id,
          voter_address,
          voted_at
        )
      `)

    if (pollId) {
      query = query.eq('id', pollId).single()
    } else if (poolId) {
      query = query.eq('pool_id', poolId).order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      if (pollId && error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Poll not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Fetch polls error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

