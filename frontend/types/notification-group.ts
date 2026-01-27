export interface NotificationGroup {
    id: string;
    key: string; 
    type: NotificationType;
    title: string;
    count: number;
    notifications: Notification[];
    latestNotification: Notification;
    firstNotificationDate: string;
    lastNotificationDate: string;
    isRead: boolean;
    isArchived: boolean;
  }
  
  export interface NotificationGroupRule {
    id: string;
    type: NotificationType;
    groupBy: ('poolId' | 'type' | 'fromUser')[];
    maxAge: number;
    maxCount: number;
    isActive: boolean;
  }