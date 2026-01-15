export interface NotificationAnalytics {
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalClicked: number;
    totalFailed: number;
    deliveryRate: number;
    readRate: number;
    clickRate: number;
    byType: Record<NotificationType, NotificationTypeStats>;
    byChannel: Record<NotificationChannel, ChannelStats>;
    byPriority: Record<NotificationPriority, number>;
    timeline: TimelineData[];
  }
  
  export interface NotificationTypeStats {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    failed: number;
    avgTimeToRead: number; // seconds
    avgTimeToClick: number; // seconds
  }
  
  export interface ChannelStats {
    sent: number;
    delivered: number;
    failed: number;
    deliveryRate: number;
    avgDeliveryTime: number; // seconds
  }
  
  export interface TimelineData {
    date: string;
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
  }