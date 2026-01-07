import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { FilterOptions, PaginationParams, SortOption } from '@/types/transaction';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Parse filters
    const type = searchParams.get('type')?.split(',');
    const status = searchParams.get('status')?.split(',');
    const category = searchParams.get('category')?.split(',');
    const poolId = searchParams.get('poolId')?.split(',');
    const poolType = searchParams.get('poolType')?.split(',');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const tags = searchParams.get('tags')?.split(',');
    const isBookmarked = searchParams.get('isBookmarked') === 'true';
    const hasNotes = searchParams.get('hasNotes') === 'true';
    const userAddress = searchParams.get('userAddress');
    
    // Parse sorting
    const sortBy = searchParams.get('sortBy') || 'timestamp';
    const sortDir = searchParams.get('sortDir') || 'desc';
    
    // Build base query
    let query = supabase
      .from('transactions')
      .select(`
        *,
        pools:pool_id (
          id,
          name,
          type,
          creator_address,
          contract_address
        ),
        member_profiles!transactions_user_address_fkey (
          wallet_address,
          display_name,
          avatar_url
        )
      `, { count: 'exact' });
    
    // Apply filters
    if (type && type.length > 0) {
      query = query.in('transaction_type', type);
    }
    
    if (status && status.length > 0) {
      query = query.in('transaction_status', status);
    }
    
    if (category && category.length > 0) {
      query = query.in('transaction_category', category);
    }
    
    if (poolId && poolId.length > 0) {
      query = query.in('pool_id', poolId);
    }
    
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }
    
    if (search) {
      query = query.or(
        `description.ilike.%${search}%,` +
        `tx_hash.ilike.%${search}%,` +
        `notes.ilike.%${search}%`
      );
    }
    
    if (minAmount) {
      query = query.gte('amount', minAmount);
    }
    
    if (maxAmount) {
      query = query.lte('amount', maxAmount);
    }
    
    if (tags && tags.length > 0) {
      query = query.contains('tags', tags);
    }
    
    if (isBookmarked) {
      query = query.eq('is_bookmarked', true);
    }
    
    if (hasNotes) {
      query = query.not('notes', 'is', null);
    }
    
    if (userAddress) {
      query = query.eq('user_address', userAddress.toLowerCase());
    }
    
    // Apply sorting
    const sortColumn = sortBy === 'timestamp' ? 'timestamp' : 
                      sortBy === 'amount' ? 'amount' : 
                      sortBy === 'status' ? 'transaction_status' : 'timestamp';
    
    query = query.order(sortColumn, { ascending: sortDir === 'asc' });
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Transaction fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Transform data
    const transactions = (data || []).map(tx => ({
      id: tx.id,
      poolId: tx.pool_id,
      poolName: tx.pools?.name || 'Unknown Pool',
      poolType: tx.pools?.type || 'flexible',
      userId: tx.user_address,
      userAddress: tx.user_address,
      userName: tx.member_profiles?.display_name || null,
      userAvatar: tx.member_profiles?.avatar_url || null,
      type: tx.transaction_type,
      status: tx.transaction_status,
      category: tx.transaction_category,
      amount: tx.amount,
      amountUSD: tx.amount_usd,
      currency: tx.currency,
      tokenAddress: tx.token_address,
      hash: tx.tx_hash,
      blockNumber: tx.block_number,
      gasUsed: tx.gas_used,
      gasFee: tx.gas_fee,
      timestamp: tx.timestamp,
      confirmedAt: tx.confirmed_at,
      description: tx.description,
      metadata: tx.metadata,
      receiptUrl: tx.receipt_url,
      tags: tx.tags || [],
      notes: tx.notes,
      isBookmarked: tx.is_bookmarked,
      createdAt: tx.created_at,
      updatedAt: tx.updated_at,
    }));
    
    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: offset + limit < (count || 0),
        hasPrev: page > 1,
      }
    });
  } catch (error) {
    console.error('Transaction API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      poolId,
      userAddress,
      type,
      status = 'PENDING',
      category,
      amount,
      currency = 'ETH',
      tokenAddress,
      hash,
      blockNumber,
      gasUsed,
      gasFee,
      description,
      metadata = {},
    } = body;
    
    // Validate required fields
    if (!poolId || !userAddress || !type || !amount || !hash || !tokenAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Insert transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        pool_id: poolId,
        user_address: userAddress.toLowerCase(),
        transaction_type: type,
        transaction_status: status,
        transaction_category: category || 'OTHER',
        amount: amount.toString(),
        currency,
        token_address: tokenAddress.toLowerCase(),
        tx_hash: hash,
        block_number: blockNumber || null,
        gas_used: gasUsed || null,
        gas_fee: gasFee || null,
        description: description || null,
        metadata,
        timestamp: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Transaction creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ transaction: data }, { status: 201 });
  } catch (error) {
    console.error('Transaction POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}