import { supabase, savePoolToDatabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      name,
      description,
      poolType,
      creatorAddress,
      contractAddress,
      tokenAddress,
      members,
      contributionAmount,
      roundDuration,
      frequency,
      targetAmount,
      deadline,
      minimumDeposit,
      withdrawalFee,
      yieldEnabled,
    } = body

    // Validate required fields
    if (!name || !poolType || !creatorAddress || !contractAddress || !tokenAddress || !members?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use the helper function from supabase.ts
    const result = await savePoolToDatabase({
      name,
      description,
      poolType,
      creatorAddress,
      contractAddress,
      tokenAddress,
      members,
      contributionAmount,
      roundDuration,
      frequency,
      targetAmount,
      deadline,
      minimumDeposit,
      withdrawalFee,
      yieldEnabled,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to save pool' },
        { status: 500 }
      )
    }

    return NextResponse.json(result.pool, { status: 201 })
  } catch (error) {
    console.error('Pool creation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const poolId = req.nextUrl.searchParams.get('id')
    const creatorAddress = req.nextUrl.searchParams.get('creator')

    if (poolId) {
      // Fetch single pool by ID
      const { data, error } = await supabase
        .from('pools')
        .select(`
          *,
          pool_members (
            id,
            member_address,
            contribution_amount,
            status
          ),
          pool_activity (
            id,
            activity_type,
            user_address,
            amount,
            description,
            created_at
          )
        `)
        .eq('id', poolId)
        .single()

      if (error) {
        return NextResponse.json(
          { error: 'Pool not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(data)
    } else if (creatorAddress) {
      // Fetch all pools by creator
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .eq('creator_address', creatorAddress.toLowerCase())
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return NextResponse.json(data || [])
    } else {
      // Fetch all pools
      const { data, error } = await supabase
        .from('pools')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        throw error
      }

      return NextResponse.json(data || [])
    }
  } catch (error) {
    console.error('Pool fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const poolId = req.nextUrl.searchParams.get('id')

    if (!poolId) {
      return NextResponse.json(
        { error: 'Pool ID required' },
        { status: 400 }
      )
    }

    const body = await req.json()

    const { data, error } = await supabase
      .from('pools')
      .update(body)
      .eq('id', poolId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update pool' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Pool update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}