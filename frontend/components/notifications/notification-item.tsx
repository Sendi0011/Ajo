'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  DollarSign,
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  Mail,
  CheckCircle,
  MoreVertical,
  Archive,
  Trash,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { useRouter } from 'next/navigation';
import type { Notification } from '@/types/notification';

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const router = useRouter();
  const { markAsRead, archive, deleteNotification } = useNotificationActions(
    notification.userAddress
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const getIcon = () => {
    const iconClass = 'h-5 w-5';
    switch (notification.type) {
      case 'PAYMENT_REMINDER':
      case 'PAYMENT_DUE':
      case 'PAYMENT_OVERDUE':
        return <DollarSign className={iconClass} />;
      case 'PAYMENT_RECEIVED':
      case 'PAYOUT_RECEIVED':
        return <CheckCircle className={iconClass} />;
      case 'PAYOUT_READY':
        return <DollarSign className={iconClass} />;
      case 'POOL_INVITE':
      case 'MEMBER_JOINED':
      case 'MEMBER_LEFT':
        return <Users className={iconClass} />;
      case 'BADGE_EARNED':
        return <Award className={iconClass} />;
      case 'REPUTATION_UP':
      case 'REPUTATION_DOWN':
        return <TrendingUp className={iconClass} />;
      case 'EMERGENCY_REQUEST':
      case 'EMERGENCY_APPROVED':
        return <AlertTriangle className={iconClass} />;
      case 'ANNOUNCEMENT':
      case 'SYSTEM_UPDATE':
        return <Bell className={iconClass} />;
      default:
        return <Mail className={iconClass} />;
    }
  };

  const getIconColor = () => {
    switch (notification.priority) {
      case 'URGENT':
        return 'bg-destructive/10 text-destructive';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-500';
      case 'MEDIUM':
        return 'bg-primary/10 text-primary';
      case 'LOW':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }

    onClick?.();
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await archive(notification.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    await deleteNotification(notification.id);
  };

  if (isDeleting) return null;

  
}