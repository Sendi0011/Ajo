import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userAddress } = body;

    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_address', userAddress.toLowerCase())
      .eq('is_read', false)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, count: data.length });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark all as read' },
      { status: 500 }
    );
  }
}