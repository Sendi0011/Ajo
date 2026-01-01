import { supabase, updateReputationAfterPayment } from '@/lib/supabase'
import { triggerBadgeCheck } from '@/lib/badge-system'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST - Record a payment and update reputation
 * 
 * Body: {
 *   poolId: string
 *   memberAddress: string
 *   amount: number
 *   txHash: string
 *   wasOnTime: boolean (optional, defaults to true)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { poolId, memberAddress, amount, txHash, wasOnTime = true } = body

    if (!poolId || !memberAddress) {
      return NextResponse.json(
        { error: 'Missing poolId or memberAddress' },
        { status: 400 }
      )
    }

    // Update pool_members status
    const { error: updateError } = await supabase
      .from('pool_members')
      .update({ 
        status: wasOnTime ? 'paid' : 'late',
        contribution_amount: amount || 0
      })
      .eq('pool_id', poolId)
      .eq('member_address', memberAddress.toLowerCase())

    if (updateError) {
      console.error('Failed to update member status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      )
    }

    // Log activity
    if (txHash) {
      await supabase.from('pool_activity').insert([
        {
          pool_id: poolId,
          activity_type: wasOnTime ? 'payment_made' : 'payment_late',
          user_address: memberAddress.toLowerCase(),
          amount: amount || null,
          description: `Payment ${wasOnTime ? 'made on time' : 'made late'}`,
          tx_hash: txHash,
        },
      ])
    }

    // Update reputation
    try {
      const updatedProfile = await updateReputationAfterPayment(
        memberAddress,
        poolId,
        wasOnTime
      )

      // Check for new badges
      const badgeResult = await triggerBadgeCheck(memberAddress, 'payment_made')

      return NextResponse.json({
        success: true,
        profile: updatedProfile,
        newBadges: badgeResult.newBadges || [],
        message: badgeResult.message || 'Payment recorded successfully',
      })
    } catch (reputationError) {
      console.error('Failed to update reputation:', reputationError)
      // Still return success since the payment was recorded
      return NextResponse.json({
        success: true,
        message: 'Payment recorded successfully',
        warning: 'Failed to update reputation',
      })
    }
  } catch (error) {
    console.error('Payment recording error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

