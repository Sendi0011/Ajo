'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const NOTIFICATION_TYPES = [
  { value: 'PAYMENT_REMINDER', label: 'Payment Reminders' },
  { value: 'PAYMENT_DUE', label: 'Payment Due' },
  { value: 'PAYOUT_READY', label: 'Payout Ready' },
  { value: 'MEMBER_JOINED', label: 'Member Activity' },
  { value: 'BADGE_EARNED', label: 'Achievements' },
  { value: 'MILESTONE_REACHED', label: 'Milestones' },
  { value: 'ANNOUNCEMENT', label: 'Announcements' },
];

const PRIORITIES = [
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

interface NotificationFiltersProps {
  filters: any;
  onChange: (filters: any) => void;
}

export function NotificationFilters({ filters, onChange }: NotificationFiltersProps) {
  const toggleType = (type: string) => {
    const types = filters.types || [];
    const newTypes = types.includes(type)
      ? types.filter((t: string) => t !== type)
      : [...types, type];
    onChange({ ...filters, types: newTypes });
  };

  const togglePriority = (priority: string) => {
    const priorities = filters.priorities || [];
    const newPriorities = priorities.includes(priority)
      ? priorities.filter((p: string) => p !== priority)
      : [...priorities, priority];
    onChange({ ...filters, priorities: newPriorities });
  };

  
}