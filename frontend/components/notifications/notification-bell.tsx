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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <NotificationList
          userAddress={userAddress}
          onClose={() => setIsOpen(false)}
          onCountChange={setUnreadCount}
        />
      </PopoverContent>
    </Popover>
  );
}
