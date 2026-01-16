'use client';

import { toast } from 'sonner';

export function useNotificationActions(userAddress: string) {
  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const archive = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: true }),
      });
      toast.success('Notification archived');
    } catch (error) {
      toast.error('Failed to archive notification');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const bulkMarkRead = async (notificationIds: string[]) => {
    try {
      await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'MARK_READ',
          notificationIds,
          userAddress,
        }),
      });
      toast.success(`Marked ${notificationIds.length} notifications as read`);
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const bulkArchive = async (notificationIds: string[]) => {
    try {
      await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ARCHIVE',
          notificationIds,
          userAddress,
        }),
      });
      toast.success(`Archived ${notificationIds.length} notifications`);
    } catch (error) {
      toast.error('Failed to archive');
    }
  };

  return {
    markAsRead,
    archive,
    deleteNotification,
    bulkMarkRead,
    bulkArchive,
  };
}