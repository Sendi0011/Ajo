import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    
    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address required' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('transaction_filter_presets')
      .select('*')
      .eq('user_address', userAddress.toLowerCase())
      .order('is_default', { ascending: false })
      .order('usage_count', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({ presets: data || [] });
  } catch (error) {
    console.error('Filter presets fetch error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress, name, description, filters, isDefault = false } = body;
    
    if (!userAddress || !name || !filters) {
      return NextResponse.json(
        { error: 'User address, name, and filters required' },
        { status: 400 }
      );
    }
    
    // If setting as default, unset other defaults
    if (isDefault) {
      await supabase
        .from('transaction_filter_presets')
        .update({ is_default: false })
        .eq('user_address', userAddress.toLowerCase());
    }
    
    const { data, error } = await supabase
      .from('transaction_filter_presets')
      .insert([{
        user_address: userAddress.toLowerCase(),
        name,
        description: description || null,
        filters,
        is_default: isDefault,
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ preset: data }, { status: 201 });
  } catch (error) {
    console.error('Filter preset creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}