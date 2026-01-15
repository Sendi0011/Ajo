import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const userAddress = searchParams.get('userAddress');
  
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_address', userAddress?.toLowerCase())
        .single();
  
      if (error && error.code !== 'PGRST116') throw error;
  
      // Create default preferences if not found
      if (!data) {
        const { data: newPrefs, error: createError } = await supabase
          .from('notification_preferences')
          .insert([{ user_address: userAddress?.toLowerCase() }])
          .select()
          .single();
  
        if (createError) throw createError;
        return NextResponse.json({ preferences: newPrefs });
      }
  
      return NextResponse.json({ preferences: data });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }
  }
  
  export async function PATCH(request: NextRequest) {
    try {
      const body = await request.json();
      const { userAddress, ...updates } = body;
  
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_address', userAddress.toLowerCase())
        .select()
        .single();
  
      if (error) throw error;
  
      return NextResponse.json({ preferences: data });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }
  }