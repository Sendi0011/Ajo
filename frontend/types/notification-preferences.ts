export interface NotificationPreferences {
    id: string;
    userId: string;
    userAddress: string;
    email: EmailPreferences;
    push: PushPreferences;
    inApp: InAppPreferences;
    schedule: SchedulePreferences;
    types: NotificationTypePreferences;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface EmailPreferences {
    enabled: boolean;
    address?: string;
    verified: boolean;
    digest: DigestFrequency;
    digestTime: string; 
    digestDays?: number[];
  }
  
  export interface PushPreferences {
    enabled: boolean;
    subscription?: PushSubscription;
    deviceTokens: string[];
  }
  
  export interface InAppPreferences {
    enabled: boolean;
    showBadge: boolean;
    playSound: boolean;
    soundFile?: string;
    showPreview: boolean;
    groupSimilar: boolean;
    autoMarkReadAfter?: number; // seconds
  }
  
  export interface SchedulePreferences {
    quietHoursEnabled: boolean;
    quietHoursStart: string; 
    quietHoursEnd: string; 
    timezone: string;
    pausedUntil?: string; 
  }
  
  export interface NotificationTypePreferences {
    paymentReminders: boolean;
    paymentDue: boolean;
    paymentOverdue: boolean;
    payouts: boolean;
    poolInvites: boolean;
    poolActivity: boolean;
    achievements: boolean;
    reputationChanges: boolean;
    milestones: boolean;
    announcements: boolean;
    systemUpdates: boolean;
    emergencies: boolean;
    polls: boolean;
  }
  
  export type DigestFrequency = 
    | 'DISABLED'
    | 'REALTIME'
    | 'DAILY'
    | 'WEEKLY'
    | 'MONTHLY';