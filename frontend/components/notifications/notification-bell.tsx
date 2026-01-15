'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell } from 'lucide-react';
import { NotificationList } from './notification-list';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function NotificationBell({ userAddress }: { userAddress: string }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchUnreadCount();

    // Real-time subscription
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_address=eq.${userAddress.toLowerCase()}`,
        },
        (payload) => {
          fetchUnreadCount();
          // Show toast for new notification
          const notification = payload.new as any;
          if (notification.priority === 'URGENT') {
            toast.error(notification.title, {
              description: notification.message,
            });
          } else {
            toast.info(notification.title, {
              description: notification.message,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_address=eq.${userAddress.toLowerCase()}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userAddress]);

  const fetchUnreadCount = async () => {
    try {
      const { data, error } = await supabase.rpc('get_unread_notification_count', {
        p_user_address: userAddress,
      });

      if (error) throw error;
      setUnreadCount(data || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  
}
