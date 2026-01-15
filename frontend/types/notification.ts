export type NotificationType = 
  | 'PAYMENT_REMINDER'      // Upcoming payment due
  | 'PAYMENT_DUE'          // Payment due today
  | 'PAYMENT_OVERDUE'      // Payment is overdue
  | 'PAYMENT_RECEIVED'     // Payment was received
  | 'PAYOUT_READY'         // User is next for payout
  | 'PAYOUT_RECEIVED'      // Payout was received
  | 'POOL_INVITE'          // Invited to join pool
  | 'MEMBER_JOINED'        // New member joined pool
  | 'MEMBER_LEFT'          // Member left pool
  | 'EMERGENCY_REQUEST'    // Emergency withdrawal request
  | 'EMERGENCY_APPROVED'   // Emergency request approved
  | 'BADGE_EARNED'         // Achievement unlocked
  | 'REPUTATION_UP'        // Reputation increased
  | 'REPUTATION_DOWN'      // Reputation decreased
  | 'MILESTONE_REACHED'    // Pool milestone achieved
  | 'POOL_COMPLETED'       // Pool goal completed
  | 'ANNOUNCEMENT'         // Pool announcement
  | 'SYSTEM_UPDATE'        // System/platform update
  | 'VERIFICATION_NEEDED'  // KYC/verification required
  | 'DISPUTE_RAISED'       // Transaction dispute
  | 'POLL_CREATED'         // New poll in pool
  | 'POLL_CLOSING';        // Poll closing soon

export type NotificationPriority = 
  | 'LOW'       // General info
  | 'MEDIUM'    // Standard notifications
  | 'HIGH'      // Important, needs attention
  | 'URGENT';   // Critical, immediate action required

export type NotificationChannel = 
  | 'IN_APP'    // In-app notification center
  | 'EMAIL'     // Email notification
  | 'PUSH'      // Browser push notification
  | 'SMS';      // SMS (future)

export type NotificationStatus = 
  | 'PENDING'   // Created but not sent
  | 'SENT'      // Sent to user
  | 'DELIVERED' // Confirmed delivery
  | 'READ'      // User read notification
  | 'CLICKED'   // User clicked action
  | 'FAILED'    // Delivery failed
  | 'EXPIRED';  // Notification expired

export interface Notification {
  id: string;
  userId: string;
  userAddress: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  actionData?: Record<string, any>;
  metadata: NotificationMetadata;
  channels: NotificationChannel[];
  isRead: boolean;
  isArchived: boolean;
  readAt?: string;
  archivedAt?: string;
  deliveredAt?: string;
  clickedAt?: string;
  createdAt: string;
  expiresAt?: string;
  groupKey?: string; // For grouping similar notifications
}

export interface NotificationMetadata {
  poolId?: string;
  poolName?: string;
  poolType?: string;
  transactionId?: string;
  amount?: string;
  currency?: string;
  dueDate?: string;
  fromUser?: string;
  fromUserName?: string;
  badgeType?: string;
  badgeName?: string;
  icon?: string;
  iconColor?: string;
  image?: string;
  pointsChange?: number;
  previousScore?: number;
  newScore?: number;
  [key: string]: any;
}