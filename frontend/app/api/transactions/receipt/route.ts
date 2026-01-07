import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId } = body;
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID required' },
        { status: 400 }
      );
    }
    
    // Fetch transaction
    const { data: tx, error: txError } = await supabase
      .from('transactions')
      .select(`
        *,
        pools:pool_id (name, type, creator_address),
        member_profiles!transactions_user_address_fkey (display_name, avatar_url)
      `)
      .eq('id', transactionId)
      .single();
    
    if (txError) throw txError;
    
    // Check if receipt already exists
    const { data: existingReceipt } = await supabase
      .from('transaction_receipts')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();
    
    if (existingReceipt) {
      return NextResponse.json({ receipt: existingReceipt });
    }
    
    // Generate receipt number
    const receiptNumber = `RCP-${Date.now()}-${transactionId.slice(0, 8).toUpperCase()}`;
    
    // Generate QR code data (would use a QR library in production)
    const qrData = `https://basescan.org/tx/${tx.tx_hash}`;
    
    // Create receipt
    const { data: receipt, error: receiptError } = await supabase
      .from('transaction_receipts')
      .insert([{
        transaction_id: transactionId,
        receipt_number: receiptNumber,
        format: 'PDF',
        url: `/api/transactions/receipt/${transactionId}/download`,
        qr_code: qrData,
        metadata: {
          issuer: 'AJO Platform',
          issuerAddress: tx.pools?.creator_address,
          recipient: tx.member_profiles?.display_name || tx.user_address,
          recipientAddress: tx.user_address,
          network: 'Base',
          blockExplorer: 'https://basescan.org',
        },
      }])
      .select()
      .single();
    
    if (receiptError) throw receiptError;
    
    return NextResponse.json({ receipt });
  } catch (error) {
    console.error('Receipt generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID required' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('transaction_receipts')
      .select('*')
      .eq('transaction_id', transactionId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Receipt not found' },
          { status: 404 }
        );
      }
      throw error;
    }
    
    return NextResponse.json({ receipt: data });
  } catch (error) {
    console.error('Receipt fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
