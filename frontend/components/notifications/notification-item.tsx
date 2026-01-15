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

  return (
    <div
      className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
        !notification.isRead ? 'bg-primary/5' : ''
      }`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getIconColor()}`}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={`font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {notification.message}
            </p>
          </div>
          
          {/* Priority Badge */}
          {notification.priority === 'URGENT' && (
            <Badge variant="destructive" className="text-xs">
              Urgent
            </Badge>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {notification.metadata?.poolName && (
            <>
              <span>{notification.metadata.poolName}</span>
              <span>•</span>
            </>
          )}
          <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
          {!notification.isRead && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                New
              </span>
            </>
          )}
        </div>

        {/* Action Button */}
        {notification.actionLabel && notification.actionUrl && (
          <Button variant="outline" size="sm" className="mt-2">
            {notification.actionLabel}
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      {/* More Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!notification.isRead && (
            <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as read
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="mr-2 h-4 w-4" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}