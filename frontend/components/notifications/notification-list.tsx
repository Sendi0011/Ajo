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

 
}