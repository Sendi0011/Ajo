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

