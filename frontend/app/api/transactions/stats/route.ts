import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const poolId = searchParams.get('poolId');
    const userAddress = searchParams.get('userAddress');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let query = supabase.from('transactions').select('*');
    
    if (poolId) query = query.eq('pool_id', poolId);
    if (userAddress) query = query.eq('user_address', userAddress.toLowerCase());
    if (startDate) query = query.gte('timestamp', startDate);
    if (endDate) query = query.lte('timestamp', endDate);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const transactions = data || [];
    
    // Calculate statistics
    const totalTransactions = transactions.length;
    
    const totalVolume = transactions.reduce((sum, tx) => 
      sum + parseFloat(tx.amount || '0'), 0
    );
    
    const completedTxs = transactions.filter(tx => 
      tx.transaction_status === 'COMPLETED'
    );
    const successRate = totalTransactions > 0 
      ? (completedTxs.length / totalTransactions) * 100 
      : 0;
    
    const averageAmount = totalTransactions > 0 
      ? totalVolume / totalTransactions 
      : 0;
    
    // Group by type
    const byType: Record<string, number> = {};
    transactions.forEach(tx => {
      byType[tx.transaction_type] = (byType[tx.transaction_type] || 0) + 1;
    });
    
    // Group by status
    const byStatus: Record<string, number> = {};
    transactions.forEach(tx => {
      byStatus[tx.transaction_status] = (byStatus[tx.transaction_status] || 0) + 1;
    });
    
    // Group by category
    const byCategory: Record<string, number> = {};
    transactions.forEach(tx => {
      byCategory[tx.transaction_category] = (byCategory[tx.transaction_category] || 0) + 1;
    });
    
    // Recent activity
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentActivity = {
      last24h: transactions.filter(tx => 
        new Date(tx.timestamp) >= last24h
      ).length,
      last7d: transactions.filter(tx => 
        new Date(tx.timestamp) >= last7d
      ).length,
      last30d: transactions.filter(tx => 
        new Date(tx.timestamp) >= last30d
      ).length,
    };
    
    return NextResponse.json({
      totalTransactions,
      totalVolume: totalVolume.toFixed(6),
      totalVolumeUSD: '0', // Calculate if USD prices available
      averageAmount: averageAmount.toFixed(6),
      successRate: successRate.toFixed(2),
      byType,
      byStatus,
      byCategory,
      recentActivity,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}