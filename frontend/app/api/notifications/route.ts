import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('userAddress');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userAddress) {
      return NextResponse.json({ error: 'User address required' }, { status: 400 });
    }

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_address', userAddress.toLowerCase())
      .eq('is_archived', false)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    if (type) {
      query = query.eq('notification_type', type);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data, error, count } = await query.range(
      (page - 1) * limit,
      page * limit - 1
    );

    if (error) throw error;

    return NextResponse.json({
      notifications: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_address: body.userAddress.toLowerCase(),
          notification_type: body.type,
          priority: body.priority || 'MEDIUM',
          title: body.title,
          message: body.message,
          action_url: body.actionUrl,
          action_label: body.actionLabel,
          action_data: body.actionData || {},
          metadata: body.metadata || {},
          channels: body.channels || ['IN_APP'],
          expires_at: body.expiresIn
            ? new Date(Date.now() + body.expiresIn * 60 * 60 * 1000).toISOString()
            : null,
          group_key: body.groupKey,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Trigger delivery to channels
    await deliverNotification(data);

    return NextResponse.json({ notification: data }, { status: 201 });
  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
