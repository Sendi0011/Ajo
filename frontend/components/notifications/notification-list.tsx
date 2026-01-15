'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, CheckCheck } from 'lucide-react';
import { NotificationItem } from './notification-item';
import { NotificationSkeleton } from './notification-skeleton';
import { NotificationEmpty } from './notification-empty';
import { useNotifications } from '@/hooks/useNotifications';
import Link from 'next/link';

interface NotificationListProps {
  userAddress: string;
  onClose?: () => void;
  onCountChange?: (count: number) => void;
}

export function NotificationList({
  userAddress,
  onClose,
  onCountChange,
}: NotificationListProps) {
  const { notifications, loading, markAllAsRead } = useNotifications({
    userAddress,
    limit: 10,
  });

  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    onCountChange?.(unreadCount);
  }, [notifications, onCountChange]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        <div className="flex gap-2">
          {notifications.some((n) => !n.isRead) && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notifications/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        {loading ? (
          <NotificationSkeleton count={3} />
        ) : notifications.length === 0 ? (
          <NotificationEmpty />
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={onClose}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t">
          <Button variant="outline" className="w-full" asChild onClick={onClose}>
            <Link href="/notifications">View All Notifications</Link>
          </Button>
        </div>
      )}
    </div>
  );
}