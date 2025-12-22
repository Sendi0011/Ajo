import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// POST - Create emergency request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      poolId,
      requestId,
      requesterAddress,
      amount,
      reason,
      votingDeadline,
      txHash,
    } = body

    // Validate required fields
    if (!poolId || requestId === undefined || !requesterAddress || !amount || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert emergency request
    const { data, error } = await supabase
      .from('emergency_requests')
      .insert([
        {
          pool_id: poolId,
          request_id: requestId,
          requester_address: requesterAddress.toLowerCase(),
          amount: parseFloat(amount),
          reason,
          voting_deadline: votingDeadline || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          tx_hash: txHash,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Failed to create emergency request:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('pool_activity').insert([
      {
        pool_id: poolId,
        activity_type: 'emergency_requested',
        user_address: requesterAddress.toLowerCase(),
        amount: parseFloat(amount),
        description: `Emergency withdrawal requested: ${reason.substring(0, 100)}`,
        tx_hash: txHash,
      },
    ])

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Emergency request creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET - Fetch emergency requests
export async function GET(req: NextRequest) {
  try {
    const poolId = req.nextUrl.searchParams.get('poolId')
    const requestId = req.nextUrl.searchParams.get('requestId')

    if (requestId && poolId) {
      // Fetch single request with votes
      const { data, error } = await supabase
        .from('emergency_requests')
        .select(`
          *,
          emergency_votes (
            id,
            voter_address,
            support,
            created_at,
            tx_hash
          )
        `)
        .eq('pool_id', poolId)
        .eq('request_id', parseInt(requestId))
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Request not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(data)
    } else if (poolId) {
      // Fetch all requests for a pool
      const { data, error } = await supabase
        .from('emergency_requests')
        .select(`
          *,
          emergency_votes (
            id,
            voter_address,
            support,
            created_at
          )
        `)
        .eq('pool_id', poolId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return NextResponse.json(data || [])
    } else {
      return NextResponse.json(
        { error: 'poolId required' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Emergency request fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PATCH - Update emergency request (voting results)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const poolId = req.nextUrl.searchParams.get('poolId')
    const requestId = req.nextUrl.searchParams.get('requestId')

    if (!poolId || !requestId) {
      return NextResponse.json(
        { error: 'poolId and requestId required' },
        { status: 400 }
      )
    }

    const { votesFor, votesAgainst, executed, rejected } = body

    const { data, error } = await supabase
      .from('emergency_requests')
      .update({
        votes_for: votesFor,
        votes_against: votesAgainst,
        executed,
        rejected,
        updated_at: new Date().toISOString(),
      })
      .eq('pool_id', poolId)
      .eq('request_id', parseInt(requestId))
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 500 }
      )
    }

    // If executed, increment emergency usage count and log activity
    if (executed && data) {
      await supabase.rpc('increment_emergency_usage', {
        p_pool_id: poolId,
        p_member_address: data.requester_address,
      })

      await supabase.from('pool_activity').insert([
        {
          pool_id: poolId,
          activity_type: 'emergency_executed',
          user_address: data.requester_address,
          amount: data.amount,
          description: `Emergency withdrawal executed`,
        },
      ])
    }

    // If rejected, log activity
    if (rejected && data) {
      await supabase.from('pool_activity').insert([
        {
          pool_id: poolId,
          activity_type: 'emergency_rejected',
          user_address: data.requester_address,
          description: `Emergency withdrawal rejected`,
        },
      ])
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Emergency request update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Record vote
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      poolId,
      requestId,
      voterAddress,
      support,
      txHash,
    } = body

    if (!poolId || requestId === undefined || !voterAddress || support === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the emergency request UUID
    const { data: request, error: requestError } = await supabase
      .from('emergency_requests')
      .select('id, requester_address')
      .eq('pool_id', poolId)
      .eq('request_id', requestId)
      .single()

    if (requestError || !request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Record vote using the function
    const { data, error } = await supabase.rpc('record_emergency_vote', {
      p_emergency_request_id: request.id,
      p_voter_address: voterAddress,
      p_support: support,
      p_tx_hash: txHash,
    })

    if (error) {
      console.error('Failed to record vote:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Log activity
    await supabase.from('pool_activity').insert([
      {
        pool_id: poolId,
        activity_type: 'emergency_voted',
        user_address: voterAddress.toLowerCase(),
        description: `Voted ${support ? 'for' : 'against'} emergency request #${requestId}`,
        tx_hash: txHash,
      },
    ])

    return NextResponse.json({ success: true, voteId: data })
  } catch (error) {
    console.error('Vote recording error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}