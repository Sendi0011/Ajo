import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const userAddress = searchParams.get('userAddress');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }
    
    let supabaseQuery = supabase
      .from('transactions')
      .select(`
        *,
        pools:pool_id (name, type),
        member_profiles!transactions_user_address_fkey (display_name)
      `)
      .or(
        `description.ilike.%${query}%,` +
        `tx_hash.ilike.%${query}%,` +
        `notes.ilike.%${query}%,` +
        `tags.cs.{${query}}`
      )
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (userAddress) {
      supabaseQuery = supabaseQuery.eq('user_address', userAddress.toLowerCase());
    }
    
    const { data, error } = await supabaseQuery;
    
    if (error) throw error;
    
    // Transform and add relevance scores
    const results = (data || []).map(tx => {
      let relevance = 0;
      const highlights: any[] = [];
      
      // Check description
      if (tx.description?.toLowerCase().includes(query.toLowerCase())) {
        relevance += 3;
        highlights.push({ field: 'description', value: tx.description });
      }
      
      // Check hash
      if (tx.tx_hash?.toLowerCase().includes(query.toLowerCase())) {
        relevance += 5;
        highlights.push({ field: 'hash', value: tx.tx_hash });
      }
      
      // Check notes
      if (tx.notes?.toLowerCase().includes(query.toLowerCase())) {
        relevance += 2;
        highlights.push({ field: 'notes', value: tx.notes });
      }
      
      // Check tags
      if (tx.tags?.some((tag: string) => 
        tag.toLowerCase().includes(query.toLowerCase())
      )) {
        relevance += 2;
        highlights.push({ field: 'tags', value: tx.tags.join(', ') });
      }
      
      return {
        transaction: tx,
        highlights,
        relevance,
      };
    });
    
    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}