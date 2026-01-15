export async function POST(request: NextRequest) {
    try {
      const body = await request.json();
      const { action, notificationIds, userAddress } = body;
  
      let updates: any = {};
  
      switch (action) {
        case 'MARK_READ':
          updates = { is_read: true, read_at: new Date().toISOString() };
          break;
        case 'MARK_UNREAD':
          updates = { is_read: false, read_at: null };
          break;
        case 'ARCHIVE':
          updates = { is_archived: true, archived_at: new Date().toISOString() };
          break;
        case 'DELETE':
          const { error: deleteError } = await supabase
            .from('notifications')
            .delete()
            .in('id', notificationIds)
            .eq('user_address', userAddress.toLowerCase());
  
          if (deleteError) throw deleteError;
          return NextResponse.json({ success: true, count: notificationIds.length });
      }
  
      const { error } = await supabase
        .from('notifications')
        .update(updates)
        .in('id', notificationIds)
        .eq('user_address', userAddress.toLowerCase());
  
      if (error) throw error;
  
      return NextResponse.json({ success: true, count: notificationIds.length });
    } catch (error) {
      return NextResponse.json({ error: 'Bulk operation failed' }, { status: 500 });
    }
  }