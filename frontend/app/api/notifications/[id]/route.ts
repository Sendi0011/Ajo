import { NextRequest, NextResponse } from "next/server"
import { supabase } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updates: any = {};

    if (body.isRead !== undefined) {
      updates.is_read = body.isRead;
      if (body.isRead) {
        updates.read_at = new Date().toISOString();
      }
    }

    if (body.isArchived !== undefined) {
      updates.is_archived = body.isArchived;
      if (body.isArchived) {
        updates.archived_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ notification: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update notification' },
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
      .from('notifications')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
