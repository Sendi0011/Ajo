import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters, includeCharts = false } = body;
    
    // Fetch transactions with filters
    let query = supabase.from('transactions').select(`
      *,
      pools:pool_id (name, type),
      member_profiles!transactions_user_address_fkey (display_name)
    `);
    
    if (filters?.poolId) query = query.in('pool_id', filters.poolId);
    if (filters?.type) query = query.in('transaction_type', filters.type);
    if (filters?.status) query = query.in('transaction_status', filters.status);
    if (filters?.startDate) query = query.gte('timestamp', filters.startDate);
    if (filters?.endDate) query = query.lte('timestamp', filters.endDate);
    if (filters?.userAddress) {
      query = query.eq('user_address', filters.userAddress.toLowerCase());
    }
    
    const { data, error } = await query.order('timestamp', { ascending: false });
    
    if (error) throw error;
    
    // For now, return JSON with instructions to generate PDF on client
    // In production, you'd use a library like jsPDF or puppeteer
    return NextResponse.json({
      message: 'PDF generation should be handled client-side',
      data: data || [],
      includeCharts,
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
