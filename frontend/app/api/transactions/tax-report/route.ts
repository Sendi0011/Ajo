import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, year, quarter, period = 'yearly' } = body;
    
    if (!userAddress || !year) {
      return NextResponse.json(
        { error: 'User address and year required' },
        { status: 400 }
      );
    }
    
    // Calculate date range
    let startDate: Date, endDate: Date;
    
    if (period === 'quarterly' && quarter) {
      const quarterStart = (quarter - 1) * 3;
      startDate = new Date(year, quarterStart, 1);
      endDate = new Date(year, quarterStart + 3, 0, 23, 59, 59);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }
    
    // Fetch transactions for period
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .eq('transaction_status', 'COMPLETED');
    
    if (error) throw error;
    
    // Calculate tax summary
    const contributions = transactions.filter(tx => 
      tx.transaction_type === 'CONTRIBUTION'
    );
    const payouts = transactions.filter(tx => 
      tx.transaction_type === 'PAYOUT'
    );
    const fees = transactions.filter(tx => 
      tx.transaction_type === 'FEE'
    );
    
    const totalIncome = payouts.reduce((sum, tx) => 
      sum + parseFloat(tx.amount || '0'), 0
    );
    const totalExpenses = contributions.reduce((sum, tx) => 
      sum + parseFloat(tx.amount || '0'), 0
    );
    const totalFees = fees.reduce((sum, tx) => 
      sum + parseFloat(tx.amount || '0'), 0
    );
    
    const summary = {
      totalIncome: totalIncome.toFixed(6),
      totalExpenses: totalExpenses.toFixed(6),
      netProfit: (totalIncome - totalExpenses).toFixed(6),
      totalFees: totalFees.toFixed(6),
      contributionsMade: totalExpenses.toFixed(6),
      payoutsReceived: totalIncome.toFixed(6),
      capitalGains: '0.00', // Calculate based on price differences
      transactionCount: transactions.length,
      taxableEvents: payouts.length,
    };
    
    // Create tax transactions
    const taxTransactions = transactions.map(tx => ({
      date: new Date(tx.timestamp).toISOString(),
      type: tx.transaction_type === 'PAYOUT' ? 'INCOME' : 'EXPENSE',
      description: tx.description || tx.transaction_type,
      amount: tx.amount,
      amountUSD: tx.amount_usd || '0',
      currency: tx.currency,
      category: tx.transaction_category,
      hash: tx.tx_hash,
      isTaxable: tx.transaction_type === 'PAYOUT',
    }));
    
    // Save report
    const { data: report, error: reportError } = await supabase
      .from('tax_reports')
      .upsert([{
        user_address: userAddress.toLowerCase(),
        tax_year: year,
        quarter: quarter || null,
        summary,
        transactions: taxTransactions,
        format: 'PDF',
        url: `/api/transactions/tax-report/${userAddress}/${year}${quarter ? `/${quarter}` : ''}/download`,
      }], {
        onConflict: 'user_address,tax_year,quarter',
      })
      .select()
      .single();
    
    if (reportError) throw reportError;
    
    return NextResponse.json({ report });
  } catch (error) {
    console.error('Tax report error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}