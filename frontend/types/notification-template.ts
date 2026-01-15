export interface NotificationTemplate {
    id: string;
    key: string; // Unique identifier like 'payment_reminder_3d'
    name: string;
    description: string;
    type: NotificationType;
    titleTemplate: string;
    messageTemplate: string;
    defaultChannels: NotificationChannel[];
    defaultPriority: NotificationPriority;
    variables: TemplateVariable[];
    actionUrl?: string;
    actionLabel?: string;
    icon?: string;
    color?: string;
    expiresAfter?: number; // hours
    metadata: Record<string, any>;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface TemplateVariable {
    key: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'currency';
    required: boolean;
    default?: any;
    example?: string;
  }
  
  export interface NotificationTemplateData {
    templateKey: string;
    userAddress: string;
    variables: Record<string, any>;
    overrides?: {
      title?: string;
      message?: string;
      channels?: NotificationChannel[];
      priority?: NotificationPriority;
    };
  }