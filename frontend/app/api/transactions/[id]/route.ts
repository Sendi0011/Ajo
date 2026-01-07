import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        pools:pool_id (
          id,
          name,
          type,
          description,
          creator_address,
          contract_address,
          token_address,
          status
        ),
        member_profiles!transactions_user_address_fkey (
          wallet_address,
          display_name,
          avatar_url,
          reputation_score
        )
      `)
      .eq('id', params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Transaction not found' },
          { status: 404 }
        );
      }
      throw error;
    }
    
    const transaction = {
      id: data.id,
      poolId: data.pool_id,
      poolName: data.pools?.name || 'Unknown Pool',
      poolType: data.pools?.type || 'flexible',
      poolDescription: data.pools?.description,
      poolStatus: data.pools?.status,
      userId: data.user_address,
      userAddress: data.user_address,
      userName: data.member_profiles?.display_name || null,
      userAvatar: data.member_profiles?.avatar_url || null,
      userReputation: data.member_profiles?.reputation_score || 0,
      type: data.transaction_type,
      status: data.transaction_status,
      category: data.transaction_category,
      amount: data.amount,
      amountUSD: data.amount_usd,
      currency: data.currency,
      tokenAddress: data.token_address,
      hash: data.tx_hash,
      blockNumber: data.block_number,
      gasUsed: data.gas_used,
      gasFee: data.gas_fee,
      timestamp: data.timestamp,
      confirmedAt: data.confirmed_at,
      description: data.description,
      metadata: data.metadata,
      receiptUrl: data.receipt_url,
      tags: data.tags || [],
      notes: data.notes,
      isBookmarked: data.is_bookmarked,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
    
    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Transaction detail error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const allowedUpdates = [
      'notes',
      'tags',
      'is_bookmarked',
      'transaction_category',
      'description',
    ];
    
    const updates: any = {};
    Object.keys(body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = body[key];
      }
    });
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ transaction: data });
  } catch (error) {
    console.error('Transaction update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', params.id);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Transaction delete error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}