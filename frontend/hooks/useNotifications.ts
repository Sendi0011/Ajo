'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Notification } from '@/types/notification';

interface UseNotificationsParams {
  userAddress: string;
  unreadOnly?: boolean;
  type?: string;
  priority?: string;
  limit?: number;
  autoRefresh?: boolean;
}

export function useNotifications({
  userAddress,
  unreadOnly = false,
  type,
  priority,
  limit = 20,
  autoRefresh = true,
}: UseNotificationsParams) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        userAddress: userAddress.toLowerCase(),
        limit: limit.toString(),
      });

      if (unreadOnly) params.append('unreadOnly', 'true');
      if (type) params.append('type', type);
      if (priority) params.append('priority', priority);

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();

      setNotifications(data.notifications || []);
      
      // Fetch unread count
      const { data: countData } = await supabase.rpc(
        'get_unread_notification_count',
        { p_user_address: userAddress }
      );
      setUnreadCount(countData || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [userAddress, unreadOnly, type, priority, limit]);

  useEffect(() => {
    fetchNotifications();

    if (!autoRefresh) return;

    // Set up real-time subscription
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_address=eq.${userAddress.toLowerCase()}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [fetchNotifications, autoRefresh, userAddress]);

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAddress }),
      });
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
